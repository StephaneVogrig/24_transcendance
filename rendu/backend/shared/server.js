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

start();
