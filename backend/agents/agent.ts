import { LlmAgent } from '@google/adk';
import { weatherAgent } from './sub_agents/weather/agent';
import { currentTimeAgent } from './sub_agents/time/agent';
import { config } from 'dotenv';

config();

const AGENT_MODEL = process.env.AGENT_MODEL || 'gemini-3-flash-preview';
const AGENT_NAME = 'orchestrator';
const AGENT_DESCRIPTION = 'Orchestrator agent';
const AGENT_INSTRUCTION = `You are an orchestrator agent that can delegate tasks to subagents. 
                  Delegate weather related tasks to the weather agent and time related 
                  tasks to the time agent.`;

export const orchestratorAgent = new LlmAgent({
    model: AGENT_MODEL,
    name: AGENT_NAME,
    description: AGENT_DESCRIPTION,
    instruction: AGENT_INSTRUCTION,
    subAgents: [weatherAgent, currentTimeAgent]
});
