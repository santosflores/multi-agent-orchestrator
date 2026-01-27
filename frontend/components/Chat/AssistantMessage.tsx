import React, { useState } from "react";
import { Markdown } from "./Markdown";
import { ToolCalls } from "./ToolCalls";
import { useChatContext } from "@copilotkit/react-ui";

// Define interface locally if import fails or as a fallback
interface AssistantMessageProps {
    message?: any;
    inProgress?: boolean; // Changed from isLoading
    isLoading?: boolean; // Keep for backward compatibility if needed
    isCurrentMessage?: boolean;
}

export const AssistantMessage = (props: AssistantMessageProps) => {
    const {
        message,
        inProgress,
        isLoading,
        isCurrentMessage,
    } = props;

    // Use inProgress if available, fallback to isLoading
    const isThinking = (inProgress || isLoading) && isCurrentMessage;

    const content = message?.content || "";
    // Fix: access toolCalls (camelCase) which is standard in CopilotKit/AG-UI types
    const actualToolCalls = message?.toolCalls || message?.tool_calls || (message?.function_call ? [{ ...message.function_call, id: "call_" + Math.random(), type: "function" }] : []) || [];

    const hasContent = !!content;
    const hasToolCalls = actualToolCalls.length > 0;

    if (!hasContent && !hasToolCalls && !isThinking) return null;

    return (
        <div className="flex flex-col gap-2">
            {/* Tool Calls Block */}
            {hasToolCalls && (
                <div className="w-full max-w-full">
                    <ToolCalls toolCalls={actualToolCalls} />
                </div>
            )}

            {/* Text Content */}
            {hasContent && (
                <div className="copilotKitMessage copilotKitAssistantMessage">
                    <Markdown content={content} />
                    {/* Controls (Copy, Regenerate etc) could be added here if needed, 
              but simplified for now as I do not have access to all icons/logic easily.
              If user wants them, I will add them. 
          */}
                </div>
            )}

            {isThinking && (
                <div className="flex items-center gap-2 text-gray-400 text-sm italic ml-2">
                    <span>Thinking</span>
                    <span className="animate-pulse">...</span>
                </div>
            )}

        </div>
    );
};
