import Fastify from 'fastify';
import { config } from 'dotenv';
import { InMemoryRunner } from '@google/adk';

import { orchestratorAgent } from './agents/agent';
import { registerHomeRoute } from './routes/home';

config();

const runner = new InMemoryRunner({
    agent: orchestratorAgent,
});

const fastify = Fastify({
    logger: true
});

registerHomeRoute(fastify, runner);

const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
