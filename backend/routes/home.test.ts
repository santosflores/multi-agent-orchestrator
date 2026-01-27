import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { registerHomeRoute } from './home';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { InMemoryRunner } from '@google/adk';

// Mock dependencies
vi.mock('../services/session', () => ({
    ensureSession: vi.fn().mockResolvedValue({
        sessionId: 'mock-session-id',
        userId: 'mock-user-id'
    })
}));

vi.mock('crypto', () => ({
    randomUUID: vi.fn()
        .mockReturnValueOnce('mock-message-id')
        .mockReturnValueOnce('mock-run-id')
}));

import { ensureSession } from '../services/session';

// Helper to create mock Fastify instance
function createMockFastify() {
    const routes: Record<string, { get?: Function; post?: Function }> = {};

    return {
        get: vi.fn((path: string, handler: Function) => {
            routes[path] = { ...routes[path], get: handler };
        }),
        post: vi.fn((path: string, handler: Function) => {
            routes[path] = { ...routes[path], post: handler };
        }),
        getHandler: (method: 'get' | 'post', path: string) => routes[path]?.[method]
    } as unknown as FastifyInstance & { getHandler: (method: 'get' | 'post', path: string) => Function | undefined };
}

// Helper to create mock runner
function createMockRunner(events: AsyncIterable<unknown> = emptyAsyncIterable()): InMemoryRunner {
    return {
        appName: 'test-app',
        runAsync: vi.fn().mockReturnValue(events),
        sessionService: {
            createSession: vi.fn().mockResolvedValue({ id: 'new-session' })
        }
    } as unknown as InMemoryRunner;
}

// Helper to create mock request
function createMockRequest(body: Record<string, unknown> = {}): FastifyRequest {
    return {
        body,
        log: {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        }
    } as unknown as FastifyRequest;
}

// Helper to create mock reply
function createMockReply() {
    const reply = {
        header: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        status: vi.fn().mockReturnThis()
    };
    return reply as unknown as FastifyReply & {
        header: Mock;
        send: Mock;
        status: Mock
    };
}

// Helper for empty async iterable
async function* emptyAsyncIterable(): AsyncIterable<unknown> {
    // yields nothing
}

// Helper to create async iterable from array
async function* arrayToAsyncIterable<T>(items: T[]): AsyncIterable<T> {
    for (const item of items) {
        yield item;
    }
}

// Helper to consume readable stream to string
async function consumeStream(stream: AsyncIterable<string>): Promise<string[]> {
    const chunks: string[] = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return chunks;
}

describe('registerHomeRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('route registration', () => {
        it('registers a GET handler on "/"', () => {
            const mockFastify = createMockFastify();
            const mockRunner = createMockRunner();

            registerHomeRoute(mockFastify as unknown as FastifyInstance, mockRunner);

            expect(mockFastify.get).toHaveBeenCalledWith('/', expect.any(Function));
        });

        it('registers a POST handler on "/"', () => {
            const mockFastify = createMockFastify();
            const mockRunner = createMockRunner();

            registerHomeRoute(mockFastify as unknown as FastifyInstance, mockRunner);

            expect(mockFastify.post).toHaveBeenCalledWith('/', expect.any(Function));
        });
    });

    describe('GET / handler', () => {
        it('returns { hello: "world" }', async () => {
            const mockFastify = createMockFastify();
            const mockRunner = createMockRunner();
            registerHomeRoute(mockFastify as unknown as FastifyInstance, mockRunner);

            const handler = mockFastify.getHandler('get', '/');
            const mockRequest = createMockRequest();
            const mockReply = createMockReply();

            const result = await handler!(mockRequest, mockReply);

            expect(result).toEqual({ hello: 'world' });
        });

        it('logs the request', async () => {
            const mockFastify = createMockFastify();
            const mockRunner = createMockRunner();
            registerHomeRoute(mockFastify as unknown as FastifyInstance, mockRunner);

            const handler = mockFastify.getHandler('get', '/');
            const mockRequest = createMockRequest();
            const mockReply = createMockReply();

            await handler!(mockRequest, mockReply);

            expect(mockRequest.log.info).toHaveBeenCalledWith('Request received');
        });
    });

    describe('POST / handler', () => {
        it('calls ensureSession with runner, sessionId and userId from body', async () => {
            const mockFastify = createMockFastify();
            const mockRunner = createMockRunner();
            registerHomeRoute(mockFastify as unknown as FastifyInstance, mockRunner);

            const handler = mockFastify.getHandler('post', '/');
            const mockRequest = createMockRequest({
                prompt: 'Hello agent',
                threadId: 'existing-session',
                userId: 'existing-user'
            });
            const mockReply = createMockReply();

            await handler!(mockRequest, mockReply);

            expect(ensureSession).toHaveBeenCalledWith(
                mockRunner,
                'existing-session',
                'existing-user'
            );
        });

        it('calls runner.runAsync with correct parameters', async () => {
            const mockFastify = createMockFastify();
            const mockRunner = createMockRunner();
            registerHomeRoute(mockFastify as unknown as FastifyInstance, mockRunner);

            const handler = mockFastify.getHandler('post', '/');
            const mockRequest = createMockRequest({ prompt: 'Test prompt' });
            const mockReply = createMockReply();

            await handler!(mockRequest, mockReply);

            expect(mockRunner.runAsync).toHaveBeenCalledWith({
                userId: 'mock-user-id',
                sessionId: 'mock-session-id',
                newMessage: {
                    role: 'user',
                    parts: [{ text: 'Test prompt' }]
                }
            });
        });

        it('sends a stream in the reply', async () => {
            const mockFastify = createMockFastify();
            const mockRunner = createMockRunner();
            registerHomeRoute(mockFastify as unknown as FastifyInstance, mockRunner);

            const handler = mockFastify.getHandler('post', '/');
            const mockRequest = createMockRequest({ prompt: 'Hello' });
            const mockReply = createMockReply();

            await handler!(mockRequest, mockReply);

            expect(mockReply.send).toHaveBeenCalled();
            // The argument should be a Readable stream
            const streamArg = mockReply.send.mock.calls[0]![0];
            expect(streamArg).toBeDefined();
            expect(typeof streamArg[Symbol.asyncIterator]).toBe('function');
        });

        it('handles sessionId and userId as undefined when not strings', async () => {
            const mockFastify = createMockFastify();
            const mockRunner = createMockRunner();
            registerHomeRoute(mockFastify as unknown as FastifyInstance, mockRunner);

            const handler = mockFastify.getHandler('post', '/');
            const mockRequest = createMockRequest({
                prompt: 'Test',
                sessionId: 123, // Not a string
                userId: { id: 'abc' } // Not a string
            });
            const mockReply = createMockReply();

            await handler!(mockRequest, mockReply);

            expect(ensureSession).toHaveBeenCalledWith(
                mockRunner,
                undefined,
                undefined
            );
        });

        it('returns 500 error when an exception occurs', async () => {
            const mockFastify = createMockFastify();
            const mockRunner = createMockRunner();

            // Make ensureSession throw an error
            (ensureSession as Mock).mockRejectedValueOnce(new Error('Session error'));

            registerHomeRoute(mockFastify as unknown as FastifyInstance, mockRunner);

            const handler = mockFastify.getHandler('post', '/');
            const mockRequest = createMockRequest({ prompt: 'Test' });
            const mockReply = createMockReply();

            await handler!(mockRequest, mockReply);

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });

    describe('stream output format', () => {
        it('produces SSE events in correct order when no content', async () => {
            const mockFastify = createMockFastify();
            const mockRunner = createMockRunner(emptyAsyncIterable());
            registerHomeRoute(mockFastify as unknown as FastifyInstance, mockRunner);

            const handler = mockFastify.getHandler('post', '/');
            const mockRequest = createMockRequest({ prompt: 'Hello' });
            const mockReply = createMockReply();

            await handler!(mockRequest, mockReply);

            const stream = mockReply.send.mock.calls[0]![0];
            const chunks = await consumeStream(stream);

            // Should have: RUN_STARTED, STATE_SNAPSHOT, RUN_FINISHED
            // TEXT_MESSAGE_START/END are skipped because no content is yielded
            expect(chunks).toHaveLength(3);

            // Verify event types in order
            expect(chunks[0]).toContain('"type":"RUN_STARTED"');
            expect(chunks[1]).toContain('"type":"STATE_SNAPSHOT"');
            expect(chunks[2]).toContain('"type":"RUN_FINISHED"');
        });

        it('logs warning when no content extracted', async () => {
            const mockFastify = createMockFastify();
            const mockRunner = createMockRunner(emptyAsyncIterable());
            registerHomeRoute(mockFastify as unknown as FastifyInstance, mockRunner);

            const handler = mockFastify.getHandler('post', '/');
            const mockRequest = createMockRequest({ prompt: 'Hello' });
            const mockReply = createMockReply();

            await handler!(mockRequest, mockReply);

            // Consume the stream to trigger the warning
            const stream = mockReply.send.mock.calls[0]![0];
            await consumeStream(stream);

            expect(mockRequest.log.warn).toHaveBeenCalledWith('No content was extracted from ADK events');
        });
    });
});
