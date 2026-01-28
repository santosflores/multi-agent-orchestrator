import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock instances to track calls
const mockFastifyInstance = {
    get: vi.fn(),
    post: vi.fn(),
    listen: vi.fn().mockResolvedValue(undefined),
    log: {
        error: vi.fn(),
        info: vi.fn()
    }
};

const mockRunnerInstance = {
    appName: 'orchestrator',
    runAsync: vi.fn(),
    sessionService: {
        createSession: vi.fn()
    }
};

// Mock dependencies before importing server module
vi.mock('fastify', () => ({
    default: vi.fn(() => mockFastifyInstance)
}));

vi.mock('@google/adk', () => ({
    InMemoryRunner: vi.fn(function (this: typeof mockRunnerInstance) {
        Object.assign(this, mockRunnerInstance);
        return this;
    }),
    LoggingPlugin: vi.fn(),
    setLogLevel: vi.fn(),
    LogLevel: { INFO: 'INFO' }
}));

vi.mock('./agents/agent', () => ({
    orchestratorAgent: {
        name: 'orchestrator',
        model: 'gemini-3-flash-preview'
    }
}));

vi.mock('./routes/home', () => ({
    registerHomeRoute: vi.fn()
}));



import Fastify from 'fastify';
import { InMemoryRunner } from '@google/adk';
import { registerHomeRoute } from './routes/home';

import { orchestratorAgent } from './agents/agent';

describe('server.ts', () => {
    let mockProcessExit: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mock implementations
        mockFastifyInstance.listen.mockResolvedValue(undefined);
        // Mock process.exit to prevent test from exiting
        mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    });

    afterEach(() => {
        mockProcessExit.mockRestore();
        vi.resetModules();
    });

    describe('module initialization', () => {


        it('creates InMemoryRunner with orchestratorAgent', async () => {
            await import('./server.js');

            expect(InMemoryRunner).toHaveBeenCalledWith(expect.objectContaining({
                agent: orchestratorAgent,
                plugins: expect.any(Array)
            }));
        });

        it('creates Fastify instance with logger enabled', async () => {
            await import('./server.js');

            expect(Fastify).toHaveBeenCalledWith({
                logger: true
            });
        });

        it('registers home route with fastify and runner', async () => {
            await import('./server.js');

            expect(registerHomeRoute).toHaveBeenCalledWith(
                mockFastifyInstance,
                expect.any(Object)
            );
        });
    });

    describe('server start behavior', () => {
        it('listens on port 8000', async () => {
            await import('./server.js');

            // Give the async start() function time to execute
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockFastifyInstance.listen).toHaveBeenCalledWith({ port: 8000 });
        });

        it('logs error and exits with code 1 on failure', async () => {
            const mockError = new Error('Listen failed');
            mockFastifyInstance.listen.mockRejectedValueOnce(mockError);

            await import('./server.js');

            // Give the async start() function time to execute and fail
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockFastifyInstance.log.error).toHaveBeenCalledWith(mockError);
            expect(mockProcessExit).toHaveBeenCalledWith(1);
        });
    });
});
