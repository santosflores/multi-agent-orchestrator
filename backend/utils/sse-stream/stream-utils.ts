import { FastifyRequest } from "fastify";
import { randomUUID } from "crypto";
import { Event, stringifyContent, getFunctionCalls, getFunctionResponses, Session, InMemoryRunner, createEvent } from "@google/adk";
import { AgentState, SHARED_STATE_KEYS } from "../../types/agent";
import {
    runStartedEvent,
    stateSnapshotEvent,
    textMessageStartEvent,
    toolCallStartEvent, // Keep strict imports if needed elsewhere, or remove
    toolCallArgsEvent,
    toolCallEndEvent,
    toolCallResultEvent,
    textMessageContentEvent,
    textMessageEndEvent,
    runFinishedEvent,
    runErrorEvent,
    activitySnapshotEvent
} from "../../utils";

export async function* streamAgentResponse(
    result: AsyncIterable<Event>,
    threadId: string,
    request: FastifyRequest,
    session: Session,
    runner: InMemoryRunner
): AsyncGenerator<string> {
    const messageId = randomUUID();
    const runId = randomUUID();

    yield runStartedEvent(threadId, runId);

    // Send initial state
    const currentDate = new Date().toISOString();

    // Maintain current state to support merging updates
    const currentState: AgentState = {
        ...(session.state as unknown as AgentState),
        current_date: currentDate
    };

    console.log(`[Stream] Initialized currentState from session ${session.id}:`, JSON.stringify(currentState));

    // Sync initial state back to session in case it was empty
    // Object.assign(session.state, currentState); // Removed manual assignment
    await runner.sessionService.appendEvent({
        session,
        event: createEvent({
            invocationId: runId,
            author: 'default',
            actions: {
                stateDelta: currentState,
                artifactDelta: {},
                requestedAuthConfigs: {},
                requestedToolConfirmations: {}
            }
        })
    });

    yield stateSnapshotEvent(currentState, threadId, runId);

    // Store active tool call IDs to match starts with results (FIFO assumption)
    const activeToolCallIds: string[] = [];

    let hasContent = false;
    let messageStarted = false;

    try {
        for await (const event of result) {

            // Handle Function Calls (Tool Calls)
            const functionCalls = getFunctionCalls(event);
            if (functionCalls.length > 0) {
                request.log.info(JSON.stringify(functionCalls));
                for (const call of functionCalls) {
                    const callId = randomUUID(); // CopilotKit needs an ID
                    activeToolCallIds.push(callId);

                    request.log.info({
                        msg: "Processing tool call for state update",
                        callName: call.name,
                        argsType: typeof call.args,
                        argsValue: call.args
                    });

                    if (updateSharedState(call.args, currentState)) {
                        // Persist state change
                        await runner.sessionService.appendEvent({
                            session,
                            event: createEvent({
                                invocationId: runId,
                                author: 'default',
                                actions: {
                                    stateDelta: currentState,
                                    artifactDelta: {},
                                    requestedAuthConfigs: {},
                                    requestedToolConfirmations: {}
                                }
                            })
                        });
                        request.log.info({ state: currentState }, 'Server: Emitting updated state snapshot');
                        yield stateSnapshotEvent(currentState, threadId, runId);
                    }

                    request.log.info(`Server: Emitting tool call start for ${call.name} (${callId})`);
                    yield toolCallStartEvent(callId, call.name || 'unknown');
                    yield toolCallArgsEvent(callId, JSON.stringify(call.args));
                    yield toolCallEndEvent(callId);

                    request.log.info(`Server: Emitting activity snapshot for tool call ${call.name} (${callId})`);
                    // Use ACTIVITY_SNAPSHOT to render the tool call bubble
                    yield activitySnapshotEvent(callId, "toolCall", {
                        name: call.name,
                        arguments: call.args
                    });
                }
            }

            // Handle Function Responses (Tool Results)
            const functionResponses = getFunctionResponses(event);
            if (functionResponses.length > 0) {
                for (const resp of functionResponses) {
                    const toolResultMessageId = randomUUID();
                    const callId = activeToolCallIds.shift() || randomUUID();

                    // Check both direct response and encapsulated .data
                    const sources = [resp.response, (resp.response as any)?.data];
                    let stateUpdated = false;
                    for (const source of sources) {
                        if (updateSharedState(source, currentState)) {
                            stateUpdated = true;
                        }
                    }

                    if (stateUpdated) {
                        // Persist state change
                        await runner.sessionService.appendEvent({
                            session,
                            event: createEvent({
                                invocationId: runId,
                                author: 'default',
                                actions: {
                                    stateDelta: currentState,
                                    artifactDelta: {},
                                    requestedAuthConfigs: {},
                                    requestedToolConfirmations: {}
                                }
                            })
                        });
                        yield stateSnapshotEvent(currentState, threadId, runId);
                    }

                    yield toolCallResultEvent(toolResultMessageId, callId, JSON.stringify(resp.response));
                }
            }

            const delta = stringifyContent(event);
            if (delta && delta.length > 0) {
                if (!messageStarted) {
                    yield textMessageStartEvent(messageId);
                    messageStarted = true;
                }
                hasContent = true;
                yield textMessageContentEvent(messageId, delta);
            }
        }

        if (!hasContent) {
            request.log.warn('No content was extracted from ADK events');
        }

        if (messageStarted) {
            yield textMessageEndEvent(messageId);
        }

        // Ensure final state is synchronized before finishing run
        yield stateSnapshotEvent(currentState, threadId, runId);

        yield runFinishedEvent(threadId, runId);

    } catch (e: any) {
        request.log.error(e, 'Error during agent execution stream');
        yield runErrorEvent("RUNTIME_ERROR", e.message || 'Unknown error occurred');
        yield runFinishedEvent(threadId, runId);
    }
}

/**
 * Updates the shared state based on the provided source object.
 * Returns true if the state was updated, false otherwise.
 */
function updateSharedState(source: unknown, currentState: AgentState): boolean {
    console.log('[Stream] updateSharedState called with:', JSON.stringify(source));

    let sourceObj = source;

    if (typeof source === 'string') {
        try {
            sourceObj = JSON.parse(source);
        } catch (e) {
            console.log('[Stream] JSON parse failed for source:', source);
            return false;
        }
    }

    if (!sourceObj || typeof sourceObj !== 'object') {
        console.log('[Stream] Source is not an object:', typeof sourceObj);
        return false;
    }

    let updated = false;
    console.log('[Stream] Checking keys against:', SHARED_STATE_KEYS);

    for (const key of SHARED_STATE_KEYS) {
        if (key in sourceObj) {
            const newValue = (sourceObj as any)[key];
            const oldValue = currentState[key as keyof AgentState];

            console.log(`[Stream] Found key '${key}'. New: ${newValue}, Old: ${oldValue}`);

            // Update if value is defined and different from current
            if (newValue !== undefined && newValue !== oldValue) {
                (currentState as any)[key] = newValue;
                updated = true;
                console.log(`[Stream] State updated key '${key}' to:`, newValue);
            }
        }
    }
    return updated;
}
