import { ToolCalls } from "./ToolCalls";

export const ActivityMessage = (props: any) => {
    const { message } = props;

    // Check if it's a tool call activity
    // Based on @ag-ui/core schema, content is a record.
    // We assume LangGraphHttpAgent maps tool calls to an activity with identifiable data.

    // If explicitly a tool call
    if (message.activityType === "toolCall" || message.activityType === "functionCall") {
        const toolCall = {
            id: message.id,
            type: "function",
            function: {
                name: message.content.name || "unknown",
                arguments: typeof message.content.arguments === 'string'
                    ? message.content.arguments
                    : JSON.stringify(message.content.arguments)
            }
        };

        return (
            <div className="w-full mb-2">
                <ToolCalls toolCalls={[toolCall]} />
            </div>
        );
    }

    // Fallback for other activities or debugging
    return (
        <div className="text-xs text-gray-400 mb-2 border-l-2 border-gray-300 pl-2">
            <div className="font-semibold">{message.activityType || "Activity"}</div>
            <pre className="overflow-auto max-w-full">
                {JSON.stringify(message.content, null, 2)}
            </pre>
        </div>
    );
};
