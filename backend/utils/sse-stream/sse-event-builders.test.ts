import { describe, it, expect } from 'vitest';
import { EventType } from '@ag-ui/core';
import {
    sseEvent,
    runStartedEvent,
    textMessageStartEvent,
    textMessageContentEvent,
    textMessageEndEvent,
    runFinishedEvent
} from './sse-event-builders';

describe('sseEvent', () => {
    it('formats data as SSE message with proper line endings', () => {
        const result = sseEvent({ type: 'test', value: 123 });
        expect(result).toBe('data: {"type":"test","value":123}\n\n');
    });
});

describe('runStartedEvent', () => {
    it('creates RUN_STARTED event with threadId and runId', () => {
        const result = runStartedEvent('thread-123', 'run-456');
        const parsed = JSON.parse(result.replace('data: ', '').trim());

        expect(parsed.type).toBe(EventType.RUN_STARTED);
        expect(parsed.threadId).toBe('thread-123');
        expect(parsed.runId).toBe('run-456');
    });
});

describe('textMessageStartEvent', () => {
    it('creates TEXT_MESSAGE_START event with messageId and assistant role', () => {
        const result = textMessageStartEvent('msg-789');
        const parsed = JSON.parse(result.replace('data: ', '').trim());

        expect(parsed.type).toBe(EventType.TEXT_MESSAGE_START);
        expect(parsed.messageId).toBe('msg-789');
        expect(parsed.role).toBe('assistant');
    });
});

describe('textMessageContentEvent', () => {
    it('creates TEXT_MESSAGE_CONTENT event with messageId and delta', () => {
        const result = textMessageContentEvent('msg-789', 'Hello, ');
        const parsed = JSON.parse(result.replace('data: ', '').trim());

        expect(parsed.type).toBe(EventType.TEXT_MESSAGE_CONTENT);
        expect(parsed.messageId).toBe('msg-789');
        expect(parsed.delta).toBe('Hello, ');
    });
});

describe('textMessageEndEvent', () => {
    it('creates TEXT_MESSAGE_END event with messageId', () => {
        const result = textMessageEndEvent('msg-789');
        const parsed = JSON.parse(result.replace('data: ', '').trim());

        expect(parsed.type).toBe(EventType.TEXT_MESSAGE_END);
        expect(parsed.messageId).toBe('msg-789');
    });
});

describe('runFinishedEvent', () => {
    it('creates RUN_FINISHED event with threadId and runId', () => {
        const result = runFinishedEvent('thread-123', 'run-456');
        const parsed = JSON.parse(result.replace('data: ', '').trim());

        expect(parsed.type).toBe(EventType.RUN_FINISHED);
        expect(parsed.threadId).toBe('thread-123');
        expect(parsed.runId).toBe('run-456');
    });
});
