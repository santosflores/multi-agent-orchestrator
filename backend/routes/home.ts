import { InMemoryRunner } from "@google/adk";
import { FastifyInstance, FastifyRequest } from "fastify";
import { extractPrompt, runFinishedEvent, runStartedEvent, textMessageContentEvent, textMessageEndEvent, textMessageStartEvent, stateSnapshotEvent, toolCallStartEvent, toolCallArgsEvent, toolCallEndEvent, toolCallResultEvent, runErrorEvent } from "../utils";
import { randomUUID } from "crypto";
import { ensureSession } from "../services/session";
import { Readable } from "stream";
import { stringifyContent, Event, getFunctionCalls, getFunctionResponses } from "@google/adk";

export function registerHomeRoute(fastify: FastifyInstance, runner: InMemoryRunner) {
    fastify.get('/', async (request) => {
        request.log.info('Request received');
        return { hello: 'world' };
    });

    fastify.post('/', async (request: FastifyRequest, reply) => {

        try {
            const body = request.body as Record<string, unknown>;
            const prompt = extractPrompt(body);

            // CopilotKit sends threadId - use it as our session identifier
            const inputSessionId = typeof body.threadId === 'string' ? body.threadId : undefined;
            const inputUserId = typeof body.userId === 'string' ? body.userId : undefined;

            const { sessionId, userId } = await ensureSession(runner, inputSessionId, inputUserId);

            const result = runner.runAsync({
                userId,
                sessionId,
                newMessage: {
                    role: 'user',
                    parts: [{ text: prompt }],
                },
            });

            const stream = Readable.from(streamAgentResponse(result, sessionId, request));

            return reply
                .header('Content-Type', 'text/event-stream')
                .header('Cache-Control', 'no-cache')
                .header('Connection', 'keep-alive')
                .send(stream);
        } catch (error) {
            request.log.error({ err: error }, 'Failed to process request');
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}



async function* streamAgentResponse(
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

    yield textMessageStartEvent(messageId);

    // Store active tool call IDs to match starts with results (FIFO assumption)
    const activeToolCallIds: string[] = [];

    // Maintain current state to support merging updates
    const currentState: { current_date?: string; location?: string } = {
        current_date: currentDate
    };

    let hasContent = false;

    try {
        for await (const event of result) {

            // Handle Function Calls (Tool Calls)
            const functionCalls = getFunctionCalls(event);
            if (functionCalls.length > 0) {
                // Since this uses random IDs, we need to be careful.
                // Assuming ADK events map well to single "turns" or consistent re-emission.
                // For simplicity here, we assume one-shot tool calls as per common patterns.
                for (const call of functionCalls) {
                    const callId = randomUUID(); // CopilotKit needs an ID
                    activeToolCallIds.push(callId);

                    // Check for location in args to update shared state
                    if (call.args && typeof call.args === 'object' && 'location' in call.args) {
                        const newLocation = (call.args as any).location;
                        if (newLocation && newLocation !== currentState.location) {
                            currentState.location = newLocation;
                            yield stateSnapshotEvent(currentState);
                        }
                    }

                    yield toolCallStartEvent(callId, call.name || 'unknown');
                    yield toolCallArgsEvent(callId, JSON.stringify(call.args));
                    yield toolCallEndEvent(callId);
                }
            }

            // Handle Function Responses (Tool Results)
            const functionResponses = getFunctionResponses(event);
            if (functionResponses.length > 0) {
                for (const resp of functionResponses) {
                    const toolResultMessageId = randomUUID();
                    // Match result to the earliest active tool call (FIFO)
                    const callId = activeToolCallIds.shift() || randomUUID();

                    yield toolCallResultEvent(toolResultMessageId, callId, JSON.stringify(resp.response));
                }
            }

            const delta = stringifyContent(event);
            if (delta && delta.length > 0) {
                hasContent = true;
                yield textMessageContentEvent(messageId, delta);
            }
        }

        if (!hasContent) {
            request.log.warn('No content was extracted from ADK events');
        }

        yield textMessageEndEvent(messageId);
        yield runFinishedEvent(threadId, runId);

    } catch (e: any) {
        request.log.error(e, 'Error during agent execution stream');
        yield runErrorEvent("RUNTIME_ERROR", e.message || 'Unknown error occurred');
        yield runFinishedEvent(threadId, runId);
    }
}