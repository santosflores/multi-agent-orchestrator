import { FunctionTool, LlmAgent } from '@google/adk';
import { z } from 'zod';
import { AGENT_MODEL } from '../../../config/agent';

// Agent configuration
const AGENT_NAME = 'weather';
const AGENT_DESCRIPTION = 'Current weather agent';
const AGENT_INSTRUCTION = 'You are a weather agent that can get the current weather in a given location.';

/**
 * Handler for the getCurrentWeather tool
 * @param location - The location to get the weather for
 * @returns The current weather in the given location
 */
export const getCurrentWeatherHandler = ({ location }: { location: string }) => {
    console.log('Getting current weather for location:', location);
    return {
        status: 'success',
        data: {
            location,
            temperature: 22,
            condition: 'sunny'
        }
    };
};

/**
 * Get the current weather tool
 * @returns The current weather tool
 */
export const getCurrentWeatherTool = new FunctionTool({
    name: 'getCurrentWeather',
    description: 'Get the current weather',
    parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
    }),
    execute: getCurrentWeatherHandler
});

/**
 * Weather agent
 * @returns The weather agent
 */
export const weatherAgent = new LlmAgent({
    name: AGENT_NAME,
    model: AGENT_MODEL,
    description: AGENT_DESCRIPTION,
    instruction: AGENT_INSTRUCTION,
    tools: [getCurrentWeatherTool]
});
