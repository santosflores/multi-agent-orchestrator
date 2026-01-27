import React, { FC, memo } from "react";
import ReactMarkdown, { Options, Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const defaultComponents: Components = {
    a({ children, ...props }) {
        return (
            <a className="text-blue-600 hover:underline" {...props} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        );
    },
    code({ children, className, ...props }) {
        const match = /language-(\w+)/.exec(className || "");
        const isInline = !match && !String(children).includes("\n");

        if (isInline) {
            return (
                <code className="bg-gray-100 rounded px-1 py-0.5 text-sm" {...props}>
                    {children}
                </code>
            );
        }

        return (
            <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto my-2">
                <code className={className} {...props}>
                    {children}
                </code>
            </pre>
        );
    }
    // Add other overrides if needed to match CopilotKit styles
};

const MemoizedReactMarkdown: FC<Options> = memo(
    ReactMarkdown,
    (prevProps, nextProps) =>
        prevProps.children === nextProps.children && prevProps.components === nextProps.components
);

type MarkdownProps = {
    content: string;
    components?: Components;
};

export const Markdown = ({ content, components }: MarkdownProps) => {
    return (
        <div className="prose prose-sm max-w-none">
            <MemoizedReactMarkdown
                components={{ ...defaultComponents, ...components }}
                remarkPlugins={[remarkGfm]}
            >
                {content}
            </MemoizedReactMarkdown>
        </div>
    );
};
