import Fastify from 'fastify';

const serviceName = 'scores';
const serviceport = 3006;

const fastify = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:HH:MM:ss.l',
                singleLine: true,
                ignore: 'pid,hostname'
            }
        }
    },
});

// API endpoint to check the availability and operational status of the service.
fastify.get('/health', async (request, reply) => {
    return {
        service: serviceName,
        port: serviceport,
        status: 'healthy',
        uptime: process.uptime()
    };
});

const start = async () => {
    try {
        await fastify.listen({ port: serviceport, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
