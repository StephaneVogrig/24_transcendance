import { fastify, log } from '../shared/fastify.js';
import { initDatabase } from './db.js';
import fs from 'fs';

const db = await initDatabase();

// Initialize db with sql file (if table is already created, does nothing)
const sql = fs.readFileSync('./init.sql').toString();
await db.exec(sql);

fastify.post('/addUser', async (request, reply) => {
    const { username } = request.body;
    if (!username || typeof username !== 'string')
        return reply.status(400).send({error: 'Missing or invalid username.'});
    try
    {
        await db.run('INSERT INTO `players` (username) VALUES (?)', [username]);
        reply.status(201).send({message: 'Player registered.'});
    } catch (err)
    {
        reply.status(500).send({error: err.message});
    }
});

fastify.get('/getUser', async (request, reply) => {
    const { username } = request.query;
    if (!username || typeof username !== 'string')
        return reply.status(400).send({error: 'Missing or invalid username.'});
    try
    {
        const player = await db.get('SELECT * FROM `players` WHERE `username` = ?', [username]);
        if (!player)
            return reply.code(204).send();
        reply.status(200).send({player});
    } catch (err)
    {
        reply.status(500).send({error: err.message});
    }
});

fastify.post('/removeUser', async (request, reply) => {
    const { username } = request.body;
    if (!username || typeof username !== 'string')
        return reply.status(400).send({error: 'Missing or invalid username.'});
    try
    {
        await db.run('DELETE FROM `players` WHERE `username` = ?', [username]);
        reply.status(200).send({message: "Player removed."});
    } catch (err)
    {
        reply.status(500).send({error: err.message});
    }
});

fastify.post('/tournament/create', async (request, reply) => {
    const { tournament } = request.body;
    if (!tournament)
        return reply.status(400).send({error: 'Missing tournament data.'});
    try
    {
        await db.run('INSERT INTO `tournaments` (id, data) VALUES (?, ?)', [tournament.id, JSON.stringify(tournament)]);
        reply.status(200).send({message: 'Tournament registered.'});
    } catch (err)
    {
        reply.status(500).send({error: err.message});
    }
});

// Route pour récupérer les tournois ouverts
fastify.get('/tournament/getOpened', async (request, reply) => {
    try
    {
        const tournaments = await db.all(`SELECT * FROM tournaments WHERE json_extract(data, '$.status') = 'open'`);
        reply.status(200).send(tournaments);
    } catch (err)
    {
        reply.status(500).send({error: err.message});
    }
});

//	 Route pour récupérer un tournoi par ID
fastify.get('/tournament/get', async (request, reply) => {
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

// Route pour supprimer un tournoi
fastify.post('/tournament/delete', async (request, reply) => {
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

//	Route pour modifier un tournoi
fastify.post('/tournament/modify', async (request, reply) => {
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

// Route pour récupérer les tournois ouverts
fastify.get('/tournament/getAll', async (request, reply) => {
    try {
        const tournaments = await db.all(`SELECT * FROM tournaments ORDER BY json_extract(data, '$.status') DESC`);
        reply.status(200).send(tournaments);
    } catch (err)
    {
        reply.status(500).send({error: err.message});
    }
});

// Route pour créer ou mettre à jour un utilisateur OAuth (Auth0)
fastify.post('/user/oauth', async (request, reply) => {
    const { provider_id, email, nickname, picture, provider } = request.body;

    if (!provider_id || !email || !nickname || !provider) {
        return reply.status(400).send({ error: 'Missing required fields: provider_id, email, nickname, provider' });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await db.get('SELECT * FROM `users` WHERE provider_id = ?', [provider_id]);

        if (existingUser) {
            // Utilisateur existe déjà, mettre à jour ses informations
            await db.run(
                'UPDATE `users` SET nickname = ?, email = ?, picture = ? WHERE provider_id = ?',
                [nickname, email, picture, provider_id]
            );

            const updatedUser = await db.get('SELECT * FROM `users` WHERE provider_id = ?', [provider_id]);
            return reply.status(200).send({
                message: 'User updated successfully',
                user: updatedUser
            });
        } else {
            // Créer un nouvel utilisateur
            await db.run(
                'INSERT INTO `users` (nickname, email, provider_id, picture, provider) VALUES (?, ?, ?, ?, ?)',
                [nickname, email, provider_id, picture, provider]
            );

            const newUser = await db.get('SELECT * FROM `users` WHERE provider_id = ?', [provider_id]);
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
fastify.get('/user/oauth/:provider_id', async (request, reply) => {
    const { provider_id } = request.params;

    if (!provider_id) {
        return reply.status(400).send({ error: 'Missing provider_id parameter' });
    }

    try {
        const user = await db.get('SELECT * FROM `users` WHERE provider_id = ?', [provider_id]);

        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        return reply.status(200).send({ user });
    } catch (err) {
        console.error('Database error:', err);
        return reply.status(500).send({ error: err.message });
    }
});
