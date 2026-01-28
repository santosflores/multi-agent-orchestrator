import React from "react";
import { RenderMessageProps } from "@copilotkit/react-ui";

export const ToolMessage = (props: RenderMessageProps) => {
    const { message } = props;

    // Tool messages usually contain the output of a tool call
    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 my-2 text-sm font-mono opacity-80 hover:opacity-100 transition-opacity">
            <div className="font-semibold text-gray-500 mb-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                Tool Output
            </div>
            <div className="text-gray-800 overflow-auto max-h-60">
                <pre className="whitespace-pre-wrap break-all">
                    {typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)}
                </pre>
            </div>
        </div>
    );
};
