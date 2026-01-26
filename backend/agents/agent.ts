import { LlmAgent } from '@google/adk';
import { weatherAgent } from './sub_agents/weather/agent';
import { currentTimeAgent } from './sub_agents/time/agent';

export const orchestratorAgent = new LlmAgent({
    model: 'gemini-3-flash-preview',
    name: 'orchestrator',
    description: 'Orchestrator agent',
    instruction: `You are an orchestrator agent that can delegate tasks to subagents. 
                  Delegate weather related tasks to the weather agent and time related 
                  tasks to the time agent.`,
    subAgents: [weatherAgent, currentTimeAgent]
})