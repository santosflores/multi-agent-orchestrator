import { EventType } from '@ag-ui/core';

/**
 * Formats data as a Server-Sent Events (SSE) message.
 */
export function sseEvent(data: object): string {
    return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * Creates a RUN_STARTED SSE event.
 */
export function runStartedEvent(threadId: string, runId: string): string {
    return sseEvent({
        type: EventType.RUN_STARTED,
        threadId,
        runId
    });
}

/**
 * Creates a TEXT_MESSAGE_START SSE event.
 */
export function textMessageStartEvent(messageId: string): string {
    return sseEvent({
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: 'assistant'
    });
}

/**
 * Creates a TEXT_MESSAGE_CONTENT SSE event with a text delta.
 */
export function textMessageContentEvent(messageId: string, delta: string): string {
    return sseEvent({
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId,
        delta
    });
}

/**
 * Creates a TEXT_MESSAGE_END SSE event.
 */
export function textMessageEndEvent(messageId: string): string {
    return sseEvent({
        type: EventType.TEXT_MESSAGE_END,
        messageId
    });
}

/**
 * Creates a RUN_FINISHED SSE event.
 */
export function runFinishedEvent(threadId: string, runId: string): string {
    return sseEvent({
        type: EventType.RUN_FINISHED,
        threadId,
        runId
    });
}
