import { FunctionTool, LlmAgent } from "@google/adk";
import { z } from "zod";
import { config } from "dotenv";

// Load environment variables
config();

// Agent configuration
const AGENT_NAME = 'currentTime';
const AGENT_DESCRIPTION = 'Current time agent';
const AGENT_INSTRUCTION = 'You are a time agent that can get the current time in a given location.';
const AGENT_MODEL = process.env.FLASH_MODEL || 'gemini-3-flash-preview';

/**
 * Get the current time in a given location
 * @param location The location to get the time for
 * @returns The current time in the given location
 */
export const getCurrentTimeHandler = ({ location }: { location: string }) => {
    console.log('Getting current time for location:', location);
    return `The current time in ${location} is ${new Date().toLocaleTimeString()}.`;
};

/**
 * Get the current time tool
 * @returns The current time tool
 */
export const getCurrentTimeTool = new FunctionTool({
    name: 'getCurrentTime',
    description: 'Get the current time',
    parameters: z.object({
        location: z.string().describe('The location to get the time for'),
    }),
    execute: getCurrentTimeHandler
});

/**
 * Current time agent
 * @returns The current time agent
 */
export const currentTimeAgent = new LlmAgent({
    name: AGENT_NAME,
    model: AGENT_MODEL,
    description: AGENT_DESCRIPTION,
    instruction: AGENT_INSTRUCTION,
    tools: [getCurrentTimeTool]
});

