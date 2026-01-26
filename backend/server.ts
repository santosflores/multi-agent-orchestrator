import Fastify from 'fastify';
import { config } from 'dotenv';

config();

const fastify = Fastify({
    logger: true
});

fastify.get('/', async (request, reply) => {
    request.log.info('Request received');
    return { hello: 'world' };
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
