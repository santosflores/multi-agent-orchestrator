
import { InMemoryRunner, LlmAgent } from '@google/adk';
import { orchestratorAgent } from './agents/agent';

const runner = new InMemoryRunner({
    agent: orchestratorAgent,
});

async function inspectSession() {
    const session = await runner.sessionService.createSession({
        appName: 'test',
        userId: 'user1'
    });

    console.log('Session keys:', Object.keys(session));
    console.log('Session JSON:', JSON.stringify(session, null, 2));
}

inspectSession().catch(console.error);
