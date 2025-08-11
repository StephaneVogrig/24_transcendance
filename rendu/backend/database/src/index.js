import { fastify, log, schemas } from '../shared/fastify.js';
import { initDatabase } from './db.js';
import fs from 'fs';

const db = await initDatabase();

// Initialize db with sql file (if table is already created, does nothing)
const sql = fs.readFileSync('./init.sql').toString();
await db.exec(sql);

fastify.post('/addUser', {schema: schemas.usernameBody}, async (request, reply) => {
    const { username } = request.body;
    try {
        await db.run('INSERT INTO `players` (username) VALUES (?)', [username]);

        log.debug(`player '${username}' inserted successfully`);
        reply.status(201).send({message: 'Player registered.'});
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            log.info(`Registration attempt with existing username: ${username}`);
            return reply.status(409).send({
                message: 'Username already exists',
                error: 'DUPLICATE_USERNAME'
            });
        }
        throw error;
    }
});

fastify.get('/getUser', {schema: schemas.usernameQuery}, async (request, reply) => {
    const { username } = request.query;
    const player = await db.get('SELECT * FROM `players` WHERE `username` = ?', [username]);
    log.debug(player, `getUser '${username}' done`);
    reply.status(200).send({player});
});

fastify.post('/removeUser', {schema: schemas.usernameBody}, async (request, reply) => {
    const { username } = request.body;
    await db.run('DELETE FROM `players` WHERE `username` = ?', [username]);
    log.debug(`player '${username}' deleted successfully`)
    reply.status(200).send({message: "Player removed."});
});

fastify.post('/tournament/create', async (request, reply) => {
    const { tournament } = request.body;
    if (!tournament)
        return reply.status(400).send({error: 'Missing tournament data.'});

    await db.run('INSERT INTO `tournaments` (id, data) VALUES (?, ?)', [tournament.id, JSON.stringify(tournament)]);
    log.debug(tournament, `tournament '${tournament.id}' inserted successfully`);
    reply.status(200).send({message: 'Tournament registered.'});
});

// Route pour récupérer les tournois ouverts
fastify.get('/tournament/getOpened', async (request, reply) => {
    const tournaments = await db.all(`SELECT * FROM tournaments WHERE json_extract(data, '$.status') = 'open'`);
    log.debug(tournaments, `tournament getOpened`);
    reply.status(200).send(tournaments);
});

//	 Route pour récupérer un tournoi par ID
fastify.get('/tournament/get', async (request, reply) => {
    const { id } = request.query;
    if (typeof id === 'undefined' || isNaN(Number(id)))
        return reply.status(400).send({ error: 'Missing or invalid id.' });

    const tournament = await db.all(`SELECT * FROM tournaments WHERE id = ?`, [id]);
    log.debug(tournament, `tournament get`);
    reply.status(200).send(tournament);
});

// Route pour supprimer un tournoi
fastify.post('/tournament/delete', async (request, reply) => {
    const { id } = request.body;
    if (typeof id === 'undefined' || isNaN(Number(id)))
        return reply.status(400).send({ error: 'Missing or invalid id.' });

    await db.run('DELETE FROM `tournaments` WHERE id = ?', [id]);
    log.debug(`tournament '${id}' deleted successfully`);
    reply.status(201).send({message: 'Tournament deleted.'});
});

//	Route pour modifier un tournoi
fastify.post('/tournament/modify', async (request, reply) => {
    const { tournament } = request.body;
    if (typeof tournament.id === 'undefined' || isNaN(Number(tournament.id)))
        return reply.status(400).send({ error: 'Missing or invalid id.' });

    await db.run('UPDATE `tournaments` SET data = ? WHERE id = ? ', [JSON.stringify(tournament), tournament.id]);
    log.debug(tournament, `tournament '${tournament.id}' updated successfully`);
    reply.status(201).send({message: 'Tournament modified.'});
});


// Route pour récupérer tous les tournois
fastify.get('/getAllInDB', async (request, reply) => {
    const tournaments = await db.all(`SELECT * FROM tournaments ORDER BY json_extract(data, '$.status') DESC`);
    log.debug(tournaments, `tournament get`);
    reply.status(200).send(tournaments);
});


// GOOGLE AUTHENTIFICATION ------------------------------------------------------------

// OK Route pour créer ou mettre à jour un utilisateur OAuth (Auth0)
fastify.post('/user/oauth', async (request, reply) => {
   
    console.log('Received user data 1:', request.body);
   
    const { provider_id, email, nickname, picture, givenName, familyName, provider } = request.body;

    console.log('Received user data 2:', request.body);

    if (!provider_id || !email || !nickname || !provider) {
        return reply.status(400).send({ error: 'Missing required fields: provider_id, email, nickname, provider' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.get('SELECT * FROM `users` WHERE provider_id = ?', [provider_id]);

    if (existingUser) 
    {
        // Utilisateur existe déjà, mettre à jour ses informations
        await db.run(
            'UPDATE `users` SET nickname = ?, email = ?, picture = ?, givenName = ?, familyName = ?, status = ? WHERE provider_id = ?',
            [nickname, email, picture, givenName, familyName, 'connected', provider_id]
        );

        const updatedUser = await db.get('SELECT * FROM `users` WHERE provider_id = ?', [provider_id]);
        log.debug(`user/oauth/ User ${nickname} updated successfully`);
        return reply.status(200).send({
            message: 'User updated successfully',
            user: updatedUser
        });
    }
    else {
        // Créer un nouvel utilisateur
        await db.run(
            'INSERT INTO `users` (nickname, email, provider_id, picture, givenName, familyName, provider) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nickname, email, provider_id, picture, givenName, familyName, provider]
        );

        const newUser = await db.get('SELECT * FROM `users` WHERE provider_id = ?', [provider_id]);
        log.debug(`user/oauth/ User ${nickname} created successfully`);
        return reply.status(201).send({
            message: 'User created successfully',
            user: newUser
        });
    }
});


// fastify.get('/user/oauth/:provider_id', async (request, reply) => {
//     const { provider_id } = request.params;
//     if (!provider_id) {
//         return reply.status(400).send({ error: 'Missing provider_id parameter' });
//     }

//     const user = await db.get('SELECT * FROM `users` WHERE provider_id = ?', [provider_id]);
//     if (!user) {
//         log.debug(request, `user/oauth/ User ${user} not found`);
//         return reply.status(404).send({ error: 'User not found' });
//     }

//     log.debug(request, `user/oauth/ User ${user} found`);
//     return reply.status(200).send({ user });
// });

// Route to get all active players
fastify.get('/getActivePlayers', async (request, reply) => {
    const players = await db.all('SELECT * FROM `players`');
    log.debug('Database: returning players:', players);
    reply.status(200).send(players);
});


// OK 
fastify.get('/getActiveUserInDB', async (request, reply) => {
    const userList = await db.all('SELECT * FROM `users` WHERE status = "connected"');
    log.debug(userList, `Connected users get`);
    reply.status(200).send(userList);
});


// OK 
fastify.get('/getAllUserInDB', async (request, reply) => {
   const userList = await db.all('SELECT * FROM `users`');
   log.debug(userList, `Users get`);
   reply.status(200).send(userList);
});


// ok
fastify.post('/updateUserLogStatusInDB', async (request, reply) => {
    const { nickname, status } = request.body;

    console.log('BACK Updating user status:', { nickname, status });

    if (!nickname || !status) 
        return reply.status(400).send({ error: 'Missing required fields: nickname, status' });

    try 
    {
        await db.run('UPDATE `users` SET status = ? WHERE nickname = ?', [status, nickname]);
        log.debug(`User ${nickname} status updated to ${status}`);
        return reply.status(200).send({ message: 'User status updated successfully' });
    }
    catch (error) 
    {
        log.error(`Error updating user status: ${error.message}`);
        return reply.status(500).send({ error: 'Failed to update user status' });
    }
});
