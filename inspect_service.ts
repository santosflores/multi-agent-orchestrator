
import { InMemoryRunner } from '@google/adk';
import { orchestratorAgent } from './backend/agents/agent';

const runner = new InMemoryRunner({
    agent: orchestratorAgent,
});

console.log(Object.getPrototypeOf(runner.sessionService));
