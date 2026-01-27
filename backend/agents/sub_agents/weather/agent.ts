import { FunctionTool, LlmAgent } from '@google/adk';
import { ToolResponse } from '../../../types/agent';
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
const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;

export const getCurrentWeatherHandler = async ({ location }: { location: string }): Promise<ToolResponse> => {
    console.log('Getting current weather for location:', location);

    if (!OPEN_WEATHER_API_KEY) {
        console.error('OPEN_WEATHER_API_KEY is not set');
        return {
            status: 'error',
            message: 'Internal server error: API key not configured'
        };
    }

    try {
        // Step 1: Geocoding API to get coordinates
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OPEN_WEATHER_API_KEY}`;
        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            console.error(`Geocoding API failed: ${geoResponse.statusText}`);
            return {
                status: 'error',
                message: 'Failed to fetch coordinates'
            };
        }

        const geoData = await geoResponse.json();

        if (!Array.isArray(geoData) || geoData.length === 0) {
            console.warn(`Location not found: ${location}`);
            return {
                status: 'error',
                message: `Location not found: ${location}`
            };
        }

        const { lat, lon, name } = geoData[0];
        console.log(`Resolved ${location} to ${name} (${lat}, ${lon})`);

        // Step 2: Weather API 2.5 to get weather
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            console.error(`Weather API failed: ${weatherResponse.statusText}`);
            return {
                status: 'error',
                message: 'Failed to fetch weather data'
            };
        }

        const weatherData = await weatherResponse.json();

        // Extract current weather
        const temperature = weatherData.main.temp;
        const condition = weatherData.weather && weatherData.weather.length > 0 ? weatherData.weather[0].description : 'unknown';

        return {
            status: 'success',
            data: {
                location: name,
                temperature: Math.round(temperature),
                condition: condition
            }
        };

    } catch (error: any) {
        console.error('Error fetching weather:', error);
        return {
            status: 'error',
            message: `Failed to get weather: ${error.message}`
        };
    }
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
