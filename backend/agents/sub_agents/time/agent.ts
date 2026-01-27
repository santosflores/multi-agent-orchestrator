import { FunctionTool, LlmAgent } from "@google/adk";
import { ToolResponse } from "../../../types/agent";
import { z } from "zod";
import { AGENT_MODEL } from "../../../config/agent";
import { lookupViaCity } from "city-timezones";
import { DateTime } from "luxon";


// Agent configuration
const AGENT_NAME = 'currentTime';
const AGENT_DESCRIPTION = 'Current time agent';
const AGENT_INSTRUCTION = 'You are a time agent that can get the current time in a given location.';


/**
 * Get the current time in a given location
 * @param location The location to get the time for
 * @returns The current time in the given location
 */
export const getCurrentTimeHandler = ({ location }: { location: string }): ToolResponse => {
    console.log('Resolving current time for location:', location);

    // Try to find the city in the timezone database
    // Handle formats like "Monterrey, MX" or "Tokyo"
    const cleanLocation = location.replace(/,.*$/, '').trim();
    const cityMatches = lookupViaCity(cleanLocation);

    let timezone = cityMatches.length > 0 ? cityMatches.pop()?.timezone : null;

    // Fallback search if the first word didn't work (e.g. "San Francisco")
    if (!timezone && cleanLocation.includes(' ')) {
        const firstWord = cleanLocation.split(' ')[0]!;
        const firstWordMatches = lookupViaCity(firstWord);
        if (firstWordMatches.length > 0) {
            timezone = firstWordMatches.pop()?.timezone;
        }
    }

    if (!timezone) {
        return {
            status: 'error',
            message: `Could not resolve timezone for location: ${location}. Please provide a city name.`,
            data: {
                location
            }
        };
    }

    // Get current time in that timezone
    const now = DateTime.now().setZone(timezone);

    return {
        status: 'success',
        data: {
            time: now.toFormat('HH:mm:ss'),
            location,
            timezone
        }
    };
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

