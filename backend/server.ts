import 'dotenv/config';
import Fastify from 'fastify';
import { startTracing } from './tracing';
import { InMemoryRunner, LoggingPlugin, setLogLevel, LogLevel } from '@google/adk';
import { orchestratorAgent } from './agents/agent';
import { registerRoutes } from './routes';

setLogLevel(LogLevel.INFO);
startTracing();

import { TracingPlugin } from './plugins/tracing_plugin';

const runner = new InMemoryRunner({
    agent: orchestratorAgent,
    plugins: [new LoggingPlugin(), new TracingPlugin()],
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
