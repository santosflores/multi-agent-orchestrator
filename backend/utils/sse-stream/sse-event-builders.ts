import { EventType } from '@ag-ui/core';
import { AgentState } from "../../types/agent";

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


/**
 * Creates a STATE_SNAPSHOT SSE event.
 */
export function stateSnapshotEvent(snapshot: AgentState, threadId?: string, runId?: string): string {
    return sseEvent({
        type: EventType.STATE_SNAPSHOT,
        snapshot,
        ...(threadId ? { threadId } : {}),
        ...(runId ? { runId } : {})
    });
}

/**
 * Creates a TOOL_CALL_START SSE event.
 */
export function toolCallStartEvent(toolCallId: string, toolCallName: string): string {
    return sseEvent({
        type: EventType.TOOL_CALL_START,
        toolCallId,
        toolCallName
    });
}

/**
 * Creates a TOOL_CALL_ARGS SSE event.
 */
export function toolCallArgsEvent(toolCallId: string, args: string): string {
    return sseEvent({
        type: EventType.TOOL_CALL_ARGS,
        toolCallId,
        delta: args
    });
}

/**
 * Creates a TOOL_CALL_END SSE event.
 */
export function toolCallEndEvent(toolCallId: string): string {
    return sseEvent({
        type: EventType.TOOL_CALL_END,
        toolCallId
    });
}

/**
 * Creates a TOOL_CALL_RESULT SSE event.
 */
export function toolCallResultEvent(messageId: string, toolCallId: string, result: string): string {
    return sseEvent({
        type: EventType.TOOL_CALL_RESULT,
        messageId,
        toolCallId,
        content: result
    });
}

/**
 * Creates a RUN_ERROR SSE event.
 */
export function runErrorEvent(code: string, message: string): string {
    return sseEvent({
        type: EventType.RUN_ERROR,
        code,
        message
    });
}

/**
 * Creates an ACTIVITY_SNAPSHOT SSE event.
 */
export function activitySnapshotEvent(messageId: string, activityType: string, content: Record<string, any>): string {
    return sseEvent({
        type: EventType.ACTIVITY_SNAPSHOT,
        messageId,
        activityType,
        content
    });
}
