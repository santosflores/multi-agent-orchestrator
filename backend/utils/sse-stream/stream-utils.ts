import { FastifyRequest } from "fastify";
import { randomUUID } from "crypto";
import { Event, stringifyContent, getFunctionCalls, getFunctionResponses } from "@google/adk";
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
    request: FastifyRequest
): AsyncGenerator<string> {
    const messageId = randomUUID();
    const runId = randomUUID();

    yield runStartedEvent(threadId, runId);

    // Send initial state
    const currentDate = new Date().toISOString();
    yield stateSnapshotEvent({
        current_date: currentDate
    });

    // Store active tool call IDs to match starts with results (FIFO assumption)
    const activeToolCallIds: string[] = [];

    // Maintain current state to support merging updates
    const currentState: AgentState = {
        current_date: currentDate
    };

    let hasContent = false;
    let messageStarted = false;

    try {
        for await (const event of result) {

            // Handle Function Calls (Tool Calls)
            const functionCalls = getFunctionCalls(event);
            if (functionCalls.length > 0) {
                console.log('Server: Detected function calls:', functionCalls);
                for (const call of functionCalls) {
                    const callId = randomUUID(); // CopilotKit needs an ID
                    activeToolCallIds.push(callId);

                    if (updateSharedState(call.args, currentState)) {
                        yield stateSnapshotEvent(currentState);
                    }

                    console.log(`Server: Emitting tool call start for ${call.name} (${callId})`);
                    yield toolCallStartEvent(callId, call.name || 'unknown');
                    yield toolCallArgsEvent(callId, JSON.stringify(call.args));
                    yield toolCallEndEvent(callId);

                    console.log(`Server: Emitting activity snapshot for tool call ${call.name} (${callId})`);
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
                        yield stateSnapshotEvent(currentState);
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
    if (!source || typeof source !== 'object') {
        return false;
    }

    let updated = false;
    for (const key of SHARED_STATE_KEYS) {
        if (key in source) {
            const newValue = (source as any)[key];
            // Update if value is defined and different from current
            if (newValue !== undefined && newValue !== currentState[key as keyof AgentState]) {
                (currentState as any)[key] = newValue;
                updated = true;
            }
        }
    }
    return updated;
}
