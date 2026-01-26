import { FunctionTool, LlmAgent } from "@google/adk";
import { z } from "zod";

export const getCurrentTimeHandler = ({ location }: { location: string }) => {
    return `The current time in ${location} is ${new Date().toLocaleTimeString()}.`;
};

export const getCurrentTimeTool = new FunctionTool({
    name: 'getCurrentTime',
    description: 'Get the current time',
    parameters: z.object({
        location: z.string().describe('The location to get the time for'),
    }),
    execute: getCurrentTimeHandler
});

export const currentTimeAgent = new LlmAgent({
    name: 'currentTime',
    model: 'gemini-3-flash-preview',
    description: 'Current time agent',
    instruction: 'You are a time agent that can get the current time in a given location.',
    tools: [getCurrentTimeTool]
});

