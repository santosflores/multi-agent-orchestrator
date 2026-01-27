import React from "react";
import { RenderMessageProps, UserMessage } from "@copilotkit/react-ui";
import { AssistantMessage } from "./AssistantMessage";
import { ActivityMessage } from "./ActivityMessage";
import { ToolMessage } from "./ToolMessage";

export const RenderMessage = (props: RenderMessageProps) => {
    const { message } = props;

    switch (message.role) {
        case "user":
            return <UserMessage {...props} message={message as any} rawData={message} ImageRenderer={props.ImageRenderer!} />;

        case "assistant":
            return <AssistantMessage {...props} />;

        case "activity":
            return <ActivityMessage {...props} />;

        case "tool":
            return <ToolMessage {...props} />;

        default:
            console.log("RenderMessage: Unhandled role", message.role, message);
            return null;
    }
};
