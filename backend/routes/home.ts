import { InMemoryRunner } from "@google/adk";
import { FastifyInstance, FastifyRequest } from "fastify";
import { extractPrompt, runFinishedEvent, runStartedEvent, textMessageContentEvent, textMessageEndEvent, textMessageStartEvent, stateSnapshotEvent } from "../utils";
import { randomUUID } from "crypto";
import { ensureSession } from "../services/session";
import { Readable } from "stream";
import { stringifyContent, Event } from "@google/adk";

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
    yield stateSnapshotEvent({ current_date: currentDate });

    yield textMessageStartEvent(messageId);

    let hasContent = false;

    for await (const event of result) {
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
}