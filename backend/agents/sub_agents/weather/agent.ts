import { FunctionTool, LlmAgent } from '@google/adk';
import { z } from 'zod';

// Agent configuration
const AGENT_NAME = 'weather';
const AGENT_DESCRIPTION = 'Current weather agent';
const AGENT_INSTRUCTION = 'You are a weather agent that can get the current weather in a given location.';
const AGENT_MODEL = process.env.FLASH_MODEL || 'gemini-3-flash-preview';

export const getCurrentWeatherHandler = ({ location }: { location: string }) => {
    return {
        status: 'success',
        data: {
            location,
            temperature: 22,
            condition: 'sunny'
        }
    };
};

export const getCurrentWeatherTool = new FunctionTool({
    name: 'getCurrentWeather',
    description: 'Get the current weather',
    parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
    }),
    execute: getCurrentWeatherHandler
});

export const weatherAgent = new LlmAgent({
    name: AGENT_NAME,
    model: AGENT_MODEL,
    description: AGENT_DESCRIPTION,
    instruction: AGENT_INSTRUCTION,
    tools: [getCurrentWeatherTool]
});
