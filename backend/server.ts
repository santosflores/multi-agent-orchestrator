import 'dotenv/config';
import Fastify from 'fastify';
import { InMemoryRunner } from '@google/adk';
import { orchestratorAgent } from './agents/agent';
import { registerHomeRoute } from './routes/home';

const runner = new InMemoryRunner({
    agent: orchestratorAgent,
});

const fastify = Fastify({
    logger: true
});

registerHomeRoute(fastify, runner);

const start = async () => {
    try {
        console.log("Starting backend server...");
        await fastify.listen({ port: 8000 });
        console.log("Backend server listening on port 8000");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
