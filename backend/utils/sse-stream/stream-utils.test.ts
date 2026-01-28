import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { streamAgentResponse } from './stream-utils';
import { FastifyRequest } from 'fastify';
import { Event, stringifyContent, getFunctionCalls, getFunctionResponses, Session, InMemoryRunner, createEvent } from '@google/adk';

// Mocks
vi.mock('crypto', () => ({
    randomUUID: vi.fn().mockImplementation(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 5))
}));

vi.mock('@google/adk', () => ({
    stringifyContent: vi.fn().mockReturnValue(''),
    getFunctionCalls: vi.fn().mockReturnValue([]),
    getFunctionResponses: vi.fn().mockReturnValue([]),
    createEvent: vi.fn().mockImplementation((params) => params), // Mock implementation
    InMemoryRunner: vi.fn(), // Mock constructor if needed
}));

describe('streamAgentResponse', () => {
    let mockRequest: FastifyRequest;
    let mockSession: Session;
    let mockRunner: InMemoryRunner;

    beforeEach(() => {
        mockRequest = {
            log: {
                warn: vi.fn(),
                error: vi.fn(),
                info: vi.fn(), // Added info mock
            }
        } as unknown as FastifyRequest;

        mockSession = {
            id: 'session-1',
            state: {},
            lastUpdateTime: 0,
            appName: 'test',
            userId: 'user-1',
            events: []
        };

        mockRunner = {
            agent: { name: 'test-agent' },
            sessionService: {
                appendEvent: vi.fn().mockResolvedValue({} as Event)
            }
        } as unknown as InMemoryRunner;

        vi.clearAllMocks();
        (stringifyContent as Mock).mockReturnValue('');
        (getFunctionCalls as Mock).mockReturnValue([]);
        (getFunctionResponses as Mock).mockReturnValue([]);
    });

    async function collectStream(generator: AsyncGenerator<string>) {
        const events: any[] = [];
        for await (const chunk of generator) {
            // Helper to parse SSE format roughly: "event: TYPE\ndata: JSON\n\n"
            const lines = chunk.trim().split('\n');
            const dataLine = lines.find(l => l.startsWith('data: '));
            if (dataLine) {
                events.push(JSON.parse(dataLine.substring(6)));
            }
        }
        return events;
    }

    it('should emit initial events run_started, state_snapshot but NOT text_message_start if no text', async () => {
        const emptyIter: AsyncIterable<Event> = {
            [Symbol.asyncIterator]: async function* () { }
        };

        const generator = streamAgentResponse(emptyIter, 'thread-1', mockRequest, mockSession, mockRunner);
        const events = await collectStream(generator);

        // Expect: Start, Initial Snapshot, Final Snapshot, RunFinished.
        expect(events.length).toBe(4);
        expect(events[0].type).toBe('RUN_STARTED');
        expect(events[1].type).toBe('STATE_SNAPSHOT');
        expect(events[2].type).toBe('STATE_SNAPSHOT');
        expect(events[3].type).toBe('RUN_FINISHED');
    });

    it('should emit text content events', async () => {
        const mockIter: AsyncIterable<Event> = {
            [Symbol.asyncIterator]: async function* () {
                yield {} as Event;
                yield {} as Event;
            }
        };

        (stringifyContent as Mock).mockReturnValueOnce('Hello').mockReturnValueOnce(' World');

        const generator = streamAgentResponse(mockIter, 'thread-1', mockRequest, mockSession, mockRunner);
        const events = await collectStream(generator);

        // Verify full sequence
        expect(events[0].type).toBe('RUN_STARTED');
        expect(events[1].type).toBe('STATE_SNAPSHOT');
        expect(events[2].type).toBe('TEXT_MESSAGE_START');

        expect(events[3].type).toBe('TEXT_MESSAGE_CONTENT');
        expect(events[3].delta).toBe('Hello');

        expect(events[4].type).toBe('TEXT_MESSAGE_CONTENT');
        expect(events[4].delta).toBe(' World');

        expect(events[5].type).toBe('TEXT_MESSAGE_END');
        expect(events[6].type).toBe('STATE_SNAPSHOT');
        expect(events[7].type).toBe('RUN_FINISHED');
    });

    it('should update state from tool calls', async () => {
        const toolCallEvent: any = {};

        (getFunctionCalls as Mock).mockReturnValue([{
            name: 'updateLocation',
            args: { location: 'New York' }
        }]);

        const mockIter: AsyncIterable<Event> = {
            [Symbol.asyncIterator]: async function* () {
                yield toolCallEvent;
            }
        };

        const generator = streamAgentResponse(mockIter, 'thread-1', mockRequest, mockSession, mockRunner);
        const events = await collectStream(generator);

        const snapshotEvents = events.filter(e => e.type === 'STATE_SNAPSHOT');
        expect(snapshotEvents.length).toBeGreaterThanOrEqual(2);

        const lastSnapshot = snapshotEvents[snapshotEvents.length - 1];
        expect(lastSnapshot.snapshot.location).toBe('New York');
        expect(mockRunner.sessionService.appendEvent).toHaveBeenCalled(); // Verify persistence
    });

    it('should update state from tool results (direct response)', async () => {
        const toolCallEvent: any = {};
        const toolResultEvent: any = {};

        // 1st yield: tool call
        (getFunctionCalls as Mock).mockReturnValueOnce([{
            name: 'updateLocation',
            args: {}
        }]);
        // 2nd yield: tool result
        (getFunctionCalls as Mock).mockReturnValueOnce([]);

        (getFunctionResponses as Mock).mockReturnValueOnce([]);
        (getFunctionResponses as Mock).mockReturnValueOnce([{
            name: 'updateLocation',
            response: { location: 'London' }
        }]);

        const mockIter: AsyncIterable<Event> = {
            [Symbol.asyncIterator]: async function* () {
                yield toolCallEvent;
                yield toolResultEvent;
            }
        };

        const generator = streamAgentResponse(mockIter, 'thread-1', mockRequest, mockSession, mockRunner);
        const events = await collectStream(generator);

        const snapshotEvents = events.filter(e => e.type === 'STATE_SNAPSHOT');
        const lastSnapshot = snapshotEvents[snapshotEvents.length - 1];
        expect(lastSnapshot.snapshot.location).toBe('London');
    });

    it('should update state from tool results (nested data)', async () => {
        const toolCallEvent: any = {};
        const toolResultEvent: any = {};

        (getFunctionCalls as Mock).mockReturnValueOnce([{ name: 'updateLocation', args: {} }]);
        (getFunctionCalls as Mock).mockReturnValueOnce([]);

        (getFunctionResponses as Mock).mockReturnValueOnce([]);
        (getFunctionResponses as Mock).mockReturnValueOnce([{
            name: 'updateLocation',
            response: {
                status: 'success',
                data: { location: 'Tokyo' }
            }
        }]);

        const mockIter: AsyncIterable<Event> = {
            [Symbol.asyncIterator]: async function* () {
                yield toolCallEvent;
                yield toolResultEvent;
            }
        };

        const generator = streamAgentResponse(mockIter, 'thread-1', mockRequest, mockSession, mockRunner);
        const events = await collectStream(generator);

        const snapshotEvents = events.filter(e => e.type === 'STATE_SNAPSHOT');
        const lastSnapshot = snapshotEvents[snapshotEvents.length - 1];
        expect(lastSnapshot.snapshot.location).toBe('Tokyo');
    });

    it('should handle errors gracefully', async () => {
        const mockIter: AsyncIterable<Event> = {
            [Symbol.asyncIterator]: async function* () {
                throw new Error('Test Error');
            }
        };

        const generator = streamAgentResponse(mockIter, 'thread-1', mockRequest, mockSession, mockRunner);
        const events = await collectStream(generator);

        const errorEvent = events.find(e => e.type === 'RUN_ERROR');
        expect(errorEvent).toBeDefined();
        expect(errorEvent.message).toBe('Test Error');
        expect(mockRequest.log.error).toHaveBeenCalled();
    }); // End existing tests

    it('should respect initial state from session', async () => {
        const emptyIter: AsyncIterable<Event> = {
            [Symbol.asyncIterator]: async function* () { }
        };

        mockSession.state = { location: 'Paris' };

        const generator = streamAgentResponse(emptyIter, 'thread-1', mockRequest, mockSession, mockRunner);
        const events = await collectStream(generator);

        expect(events[1].type).toBe('STATE_SNAPSHOT');
        expect(events[1].snapshot.location).toBe('Paris');
    });
});
