import { FunctionTool, LlmAgent } from '@google/adk';
import { z } from 'zod';

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
    name: 'weather',
    model: 'gemini-3-flash-preview',
    description: 'Weather agent',
    instruction: 'You are a weather agent that can get the current weather in a given location.',
    tools: [getCurrentWeatherTool]
});
