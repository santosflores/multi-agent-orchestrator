import React, { useState } from "react";

interface ToolCall {
    id: string;
    type: string;
    function: {
        name: string;
        arguments: string;
    };
}

interface ToolCallsProps {
    toolCalls: ToolCall[];
}

export const ToolCalls = ({ toolCalls }: ToolCallsProps) => {
    if (!toolCalls || toolCalls.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 mb-2">
            {toolCalls.map((toolCall) => (
                <ToolCallItem key={toolCall.id} toolCall={toolCall} />
            ))}
        </div>
    );
};

const ToolCallItem = ({ toolCall }: { toolCall: ToolCall }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const args = toolCall.function.arguments;

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
                <div className="flex items-center gap-2">
                    <span className="p-1 bg-blue-100 rounded text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                    </span>
                    <span className="font-medium text-sm text-gray-700 font-mono">
                        {toolCall.function.name}
                    </span>
                </div>
                <div className="text-gray-400">
                    {isExpanded ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Arguments</div>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto font-mono text-gray-800 whitespace-pre-wrap">
                        {tryFormatJSON(args)}
                    </pre>
                </div>
            )}
        </div>
    );
};

function tryFormatJSON(str: string) {
    try {
        return JSON.stringify(JSON.parse(str), null, 2);
    } catch (e) {
        return str;
    }
}
