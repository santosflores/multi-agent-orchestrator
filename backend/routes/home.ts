import { InMemoryRunner } from "@google/adk";
import { FastifyInstance, FastifyRequest } from "fastify";
import { runFinishedEvent, runStartedEvent, textMessageContentEvent, textMessageEndEvent, textMessageStartEvent } from "../utils/sse-stream/sse-event-builders";
import { randomUUID } from "crypto";
import { extractPrompt } from "../utils/prompt-parsing/extract-prompt";
import { ensureSession } from "../services/session";
import { Readable } from "stream";
import { stringifyContent, isFinalResponse, Event } from "@google/adk";

export function registerHomeRoute(fastify: FastifyInstance, runner: InMemoryRunner) {
    fastify.get('/', async (request, reply) => {
        request.log.info('Request received');
        return { hello: 'world' };
    });

    fastify.post('/', async (request: FastifyRequest, reply) => {

        try {
            const body = request.body as Record<string, unknown>;
            const prompt = extractPrompt(body);

            const inputSessionId = typeof body.sessionId === 'string' ? body.sessionId : undefined;
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
    yield textMessageStartEvent(messageId);

    let fullContent = '';

    for await (const event of result) {
        // Log event structure for debugging
        request.log.info(
            {
                eventAuthor: (event as { author?: string }).author,
                hasContent: !!(event as { content?: unknown }).content,
                hasParts: !!(event as { content?: { parts?: unknown[] } }).content?.parts,
                partsCount: (event as { content?: { parts?: unknown[] } }).content?.parts?.length,
                isFinal: isFinalResponse(event),
                partial: (event as { partial?: boolean }).partial
            },
            'ADK event received'
        );

        const delta = stringifyContent(event);
        if (delta && delta.length > 0) {
            fullContent += delta;
            yield textMessageContentEvent(messageId, delta);
        }
    }

    if (fullContent.length === 0) {
        request.log.warn('No content was extracted from ADK events');
    }

    yield textMessageEndEvent(messageId);
    yield runFinishedEvent(threadId, runId);
}