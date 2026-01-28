import { InMemoryRunner } from "@google/adk";
import { FastifyInstance, FastifyRequest } from "fastify";
import { extractPrompt } from "../utils";
import { ensureSession } from "../services/session";
import { Readable } from "stream";
import { streamAgentResponse } from "../utils";

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

            const session = await ensureSession(runner, inputSessionId, inputUserId);
            const { id: sessionId, userId } = session;

            const result = runner.runAsync({
                userId,
                sessionId,
                newMessage: {
                    role: 'user',
                    parts: [{ text: prompt }],
                },
            });

            const stream = Readable.from(streamAgentResponse(result, sessionId, request, session, runner));

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