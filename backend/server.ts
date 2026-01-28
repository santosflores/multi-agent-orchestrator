import 'dotenv/config';
import Fastify from 'fastify';
import { InMemoryRunner, LoggingPlugin, setLogLevel, LogLevel } from '@google/adk';
import { orchestratorAgent } from './agents/agent';
import { registerRoutes } from './routes';

setLogLevel(LogLevel.INFO);

const runner = new InMemoryRunner({
    agent: orchestratorAgent,
    plugins: [new LoggingPlugin()],
});

const fastify = Fastify({
    logger: true
});

registerRoutes(fastify, runner);

const start = async () => {
    try {
        fastify.log.info("Starting backend server...");
        await fastify.listen({ port: 8000 });
        fastify.log.info("Backend server listening on port 8000");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
