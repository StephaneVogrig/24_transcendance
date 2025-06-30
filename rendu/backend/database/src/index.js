import Fastify from 'fastify';
import bcrypt from 'bcrypt';
import { initDatabase } from './db.js';
import cors from '@fastify/cors'
import fs from 'fs';

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
	origin: 'http://localhost:5173',
	methods: ['GET', 'POST'],
	credentials: true
});

fastify.get('/api/database', async (request, reply) => { 
	return { message: 'Hello from Database Service!' };
});

const start = async () => {
	try {
		const db = await initDatabase();

		// Initialize db with sql file (if table is already created, does nothing)
		const sql = fs.readFileSync('./init.sql').toString();
		await db.exec(sql);

		fastify.post('/api/database/login', async (request, reply) => {
			const { username, password } = request.body;
			if (!username || !password)
				return reply.status(400).send({error: 'Missing username and/or password.'});
			try
			{
				const user = await db.get('SELECT * FROM `users` WHERE username = ?', [username]);
				if (!user)
					return reply.status(401).send({error: `Username doesn't exist.`});
				const checkPassword = await bcrypt.compare(password, user.password);
				if (!checkPassword)
					return reply.status(401).send({error: `Password is invalid.`});
				return reply.status(200).send({message: 'Login successful!', username: user.username});
			} catch (err)
			{
				return reply.status(500).send({error: err.message});
			}
		});

		fastify.post('/api/database/register', async (request, reply) => {
			const { username, password } = request.body;
			if (!username || !password)
				return reply.status(400).send({error: 'Missing username and/or password.'});
			try
			{
				const cryptedPass = await bcrypt.hash(password, 10);
				await db.run('INSERT INTO `users` (username, password) VALUES (?, ?)', [username, cryptedPass]);
				reply.status(201).send({message: 'User registered.'});
			}
			catch (err)
			{
				if (err.message.includes('UNIQUE constraint failed: users.username'))
      				reply.status(400).send({error: 'Username already exists.'});
				else
					reply.status(500).send({error: err.message});
			}
		});

		fastify.post('/api/database/tournament/create', async (request, reply) => {
			const { tournament } = request.body;
			if (!tournament)
				return reply.status(400).send({error: 'Missing tournament data.'});
			try
			{
				await db.run('INSERT INTO `tournaments` (data) VALUES (?)', [JSON.stringify(tournament)]);
				reply.status(201).send({message: 'Tournament registered.'});
			} catch (err)
			{
				reply.status(500).send({error: err.message});
			}
		});

		fastify.get('/api/database/tournament/getOpened', async (request, reply) => {
			try
			{
				const tournaments = await db.all(`SELECT * FROM tournaments WHERE json_extract(data, '$.status') = 'open'`);
				reply.status(200).send(tournaments);
			} catch (err)
			{
				reply.status(500).send({error: err.message});
			}
		});
		
		fastify.post('/api/database/tournament/delete', async (request, reply) => {
			const { id } = request.body;
			if (typeof id === 'undefined' || isNaN(Number(id)))
				return reply.status(400).send({ error: 'Missing or invalid id.' });
			try
			{
				await db.run('DELETE FROM `tournaments` WHERE id=(?)', [id + 1]);
				reply.status(201).send({message: 'Tournament deleted.'});
			} catch (err)
			{
				reply.status(500).send({error: err.message});
			}
		});

		await fastify.listen({ port: 3003, host: '0.0.0.0' });
		console.log(`Database service listening on port 3003`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
