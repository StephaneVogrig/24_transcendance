import Fastify from 'fastify';

const fastify = Fastify({
	logger: {
		level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
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

const log = fastify.log;

fastify.setErrorHandler(function (error, request, reply) {
    if (error.validation) {
        const details = error.validation.map(e => `${e.instancePath} ${e.message}`).join(', ');
        log.warn(`Validation failed for route ${request.routeOptions.url}: ${details}`);

        return reply.status(400).send({ error: 'Invalid data' });
    } else {
        log.error({
            message: error.message,
            stack: error.stack
        }, `Server error occurred on route ${request.routeOptions?.url}`);

        return reply.status(error.statusCode || 500).send({error: 'An internal server error occurred.'});
    }
});

import * as schemas from './schemas.js';
export { fastify, log, schemas };
