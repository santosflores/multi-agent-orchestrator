
import {
    BasePlugin,
    InvocationContext,
    Event,
    BaseAgent,
    CallbackContext,
    LlmRequest,
    LlmResponse,
    BaseTool,
    ToolContext
} from '@google/adk';
import { trace, Span } from '@opentelemetry/api';
import { Content } from '@google/genai';

/**
 * A plugin that adds events and attributes to the active OpenTelemetry span
 * for various ADK lifecycle events.
 */
export class TracingPlugin extends BasePlugin {
    constructor(name: string = 'tracing-plugin') {
        super(name);
    }

    private getActiveSpan(): Span | undefined {
        return trace.getActiveSpan();
    }

    async onUserMessageCallback({ invocationContext, userMessage }: {
        invocationContext: InvocationContext;
        userMessage: Content;
    }): Promise<Content | undefined> {
        this.getActiveSpan()?.addEvent('onUserMessage', {
            'userMessage': JSON.stringify(userMessage)
        });
        return userMessage;
    }

    async beforeRunCallback({ invocationContext }: {
        invocationContext: InvocationContext;
    }): Promise<Content | undefined> {
        this.getActiveSpan()?.addEvent('beforeRun');
        return undefined;
    }

    async onEventCallback({ invocationContext, event }: {
        invocationContext: InvocationContext;
        event: Event;
    }): Promise<Event | undefined> {
        this.getActiveSpan()?.addEvent('onEvent', {
            'event.author': event.author,
            'event.data': JSON.stringify(event)
        });
        return event;
    }

    async beforeAgentCallback({ agent, callbackContext }: {
        agent: BaseAgent;
        callbackContext: CallbackContext;
    }): Promise<Content | undefined> {
        this.getActiveSpan()?.addEvent('beforeAgent', {
            'agent.name': agent.name
        });
        return undefined;
    }

    async afterAgentCallback({ agent, callbackContext }: {
        agent: BaseAgent;
        callbackContext: CallbackContext;
    }): Promise<Content | undefined> {
        this.getActiveSpan()?.addEvent('afterAgent', {
            'agent.name': agent.name
        });
        return undefined;
    }

    async beforeModelCallback({ callbackContext, llmRequest }: {
        callbackContext: CallbackContext;
        llmRequest: LlmRequest;
    }): Promise<LlmResponse | undefined> {
        this.getActiveSpan()?.addEvent('beforeModel', {
            'model': llmRequest.model,
            'config': JSON.stringify(llmRequest.config)
        });
        return undefined;
    }

    async afterModelCallback({ callbackContext, llmResponse }: {
        callbackContext: CallbackContext;
        llmResponse: LlmResponse;
    }): Promise<LlmResponse | undefined> {
        this.getActiveSpan()?.addEvent('afterModel', {
            'response': JSON.stringify(llmResponse)
        });
        return llmResponse;
    }

    async beforeToolCallback({ tool, toolArgs, toolContext }: {
        tool: BaseTool;
        toolArgs: Record<string, unknown>;
        toolContext: ToolContext;
    }): Promise<Record<string, unknown> | undefined> {
        this.getActiveSpan()?.addEvent('beforeTool', {
            'tool.name': tool.name,
            'tool.args': JSON.stringify(toolArgs)
        });
        return undefined;
    }

    async afterToolCallback({ tool, toolArgs, toolContext, result }: {
        tool: BaseTool;
        toolArgs: Record<string, unknown>;
        toolContext: ToolContext;
        result: Record<string, unknown>;
    }): Promise<Record<string, unknown> | undefined> {
        this.getActiveSpan()?.addEvent('afterTool', {
            'tool.name': tool.name,
            'tool.result': JSON.stringify(result)
        });
        return undefined;
    }

    async onModelErrorCallback({ callbackContext, llmRequest, error }: {
        callbackContext: CallbackContext;
        llmRequest: LlmRequest;
        error: Error;
    }): Promise<LlmResponse | undefined> {
        const span = this.getActiveSpan();
        if (span) {
            span.recordException(error);
            span.setStatus({ code: 2, message: error.message }); // 2 = ERROR
            span.addEvent('onModelError');
        }
        return undefined;
    }

    async onToolErrorCallback({ tool, toolArgs, toolContext, error }: {
        tool: BaseTool;
        toolArgs: Record<string, unknown>;
        toolContext: ToolContext;
        error: Error;
    }): Promise<Record<string, unknown> | undefined> {
        const span = this.getActiveSpan();
        if (span) {
            span.recordException(error);
            span.setStatus({ code: 2, message: error.message }); // 2 = ERROR
            span.addEvent('onToolError', {
                'tool.name': tool.name
            });
        }
        return undefined;
    }
}
