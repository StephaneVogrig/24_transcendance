import { app } from './main.js'

const serviceport = process.env.PORT;

const start = async () => {
	try {
		await app.listen({ port: serviceport, host: '0.0.0.0' });
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

const gracefulShutdown = async (signal) => {
	app.log.info(`Received ${signal}, shutting down gracefully`);

	try {
		await app.close();
		app.log.info('Server closed successfully');
		process.exit(0);
	} catch (error) {
		app.log.error('Error during shutdown:', error);
		process.exit(1);
	}
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
	app.log.error('Uncaught Exception:', error);
	gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
	app.log.error('Unhandled Rejection at:', promise, 'reason:', reason);
	gracefulShutdown('unhandledRejection');
});

start();
