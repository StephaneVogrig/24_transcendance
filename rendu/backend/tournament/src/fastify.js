import Fastify from 'fastify';

export const fastify = Fastify({
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

export const log = fastify.log;
