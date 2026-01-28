
import { InMemoryRunner } from '@google/adk';
import { orchestratorAgent } from './agents/agent';

const runner = new InMemoryRunner({
    agent: orchestratorAgent,
});

console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(runner.sessionService)));
