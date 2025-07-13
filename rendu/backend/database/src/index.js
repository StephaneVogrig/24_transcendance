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
				await db.run('INSERT INTO `tournaments` (id, data) VALUES (?, ?)', [tournament.id, JSON.stringify(tournament)]);
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

		fastify.get('/api/database/tournament/get', async (request, reply) => {
			const { id } = request.query;
			if (typeof id === 'undefined' || isNaN(Number(id)))
				return reply.status(400).send({ error: 'Missing or invalid id.' });
			try
			{
				const tournament = await db.all(`SELECT * FROM tournaments WHERE id = ?`, [id]);
				reply.status(200).send(tournament);
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
				await db.run('DELETE FROM `tournaments` WHERE id = ?', [id]);
				reply.status(201).send({message: 'Tournament deleted.'});
			} catch (err)
			{
				reply.status(500).send({error: err.message});
			}
		});

		fastify.post('/api/database/tournament/modify', async (request, reply) => {
			const { tournament } = request.body;
			if (typeof tournament.id === 'undefined' || isNaN(Number(tournament.id)))
				return reply.status(400).send({ error: 'Missing or invalid id.' });
			try
			{
				await db.run('UPDATE `tournaments` SET data = ? WHERE id = ? ', [JSON.stringify(tournament), tournament.id]);
				reply.status(201).send({message: 'Tournament modified.'});
			} catch (err)
			{
				reply.status(500).send({error: err.message});
			}
		});

		// Route pour créer ou mettre à jour un utilisateur OAuth (Auth0)
		fastify.post('/api/database/user/oauth', async (request, reply) => {
			const { auth0_id, email, name, picture, provider = 'auth0' } = request.body;
			
			if (!auth0_id || !email || !name) {
				return reply.status(400).send({ error: 'Missing required fields: auth0_id, email, name' });
			}
			
			try {
				// Vérifier si l'utilisateur existe déjà
				const existingUser = await db.get('SELECT * FROM `users` WHERE auth0_id = ?', [auth0_id]);
				
				if (existingUser) {
					// Mettre à jour l'utilisateur existant
					await db.run(
						'UPDATE `users` SET email = ?, username = ?, picture = ?, updated_at = CURRENT_TIMESTAMP WHERE auth0_id = ?',
						[email, name, picture, auth0_id]
					);
					
					const updatedUser = await db.get('SELECT * FROM `users` WHERE auth0_id = ?', [auth0_id]);
					return reply.status(200).send({ 
						message: 'User updated successfully', 
						user: updatedUser 
					});
				} else {
					// Créer un nouvel utilisateur
					await db.run(
						'INSERT INTO `users` (username, email, auth0_id, picture, provider) VALUES (?, ?, ?, ?, ?)',
						[name, email, auth0_id, picture, provider]
					);
					
					const newUser = await db.get('SELECT * FROM `users` WHERE auth0_id = ?', [auth0_id]);
					return reply.status(201).send({ 
						message: 'User created successfully', 
						user: newUser 
					});
				}
			} catch (err) {
				console.error('Database error:', err);
				return reply.status(500).send({ error: err.message });
			}
		});

		// Route pour récupérer un utilisateur par Auth0 ID
		fastify.get('/api/database/user/oauth/:auth0_id', async (request, reply) => {
			const { auth0_id } = request.params;
			
			if (!auth0_id) {
				return reply.status(400).send({ error: 'Missing auth0_id parameter' });
			}
			
			try {
				const user = await db.get('SELECT * FROM `users` WHERE auth0_id = ?', [auth0_id]);
				
				if (!user) {
					return reply.status(404).send({ error: 'User not found' });
				}
				
				return reply.status(200).send({ user });
			} catch (err) {
				console.error('Database error:', err);
				return reply.status(500).send({ error: err.message });
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
