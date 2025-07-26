import Fastify from 'fastify';
import * as Tournament from './tournament.js'
import * as Utils from './utils.js';
import cors from '@fastify/cors'

const fastify = Fastify({ logger: true });

const HOST_IP = process.env.HOST_IP;
fastify.register(cors, {
	origin: [
		`http://${HOST_IP}:5173`,
		'http://localhost:5173'
	],
	methods: ['GET', 'POST'],
	credentials: true
});

const start = async () => {
  try {
	await fastify.listen({ port: 3007, host: '0.0.0.0' });
	console.log(`Tournament service listening on port 3007`);
  } catch (err) {
	fastify.log.error(err);
	process.exit(1);
  }
};

fastify.get('/api/tournament', async (request, reply) => { 
  return { message: 'Hello from Tournament Service!' };
});

fastify.get('/api/tournament/get', async (request, reply) => {
	const { id } = request.query;
	if (typeof id === 'undefined' || isNaN(Number(id)))
		return reply.status(400).send({ error: 'Missing or invalid id.' });
	const tournament = Tournament.getTournament(id);
	reply.status(200).send(Utils.readTournament(tournament));
});

fastify.get('/api/tournament/playerInTournament', async (request, reply) => {
	const { player } = request.query;
	if (!player || typeof player !== 'string')
		return reply.status(400).send({ error: 'Missing or invalid player.' });
	const exists = Tournament.playerExistsInAnyTournament(player);
	console.log(`boolean: ${exists}`);
	return reply.status(200).send({ exists });
});

fastify.post('/api/tournament/create', async (request, reply) => {
	if (!request.body || typeof request.body.name !== 'string')
		return reply.status(400).send({ error: 'Missing or invalid name.' });
	const name = request.body.name;
	try
	{
		const tournament = await Tournament.createTournament(name);
		return reply.send(tournament);
	} catch (err)
	{
		return reply.status(400).send({ error: err.message });
	}
});

fastify.post('/api/tournament/join', async (request, reply) => {
	if (!request.body || typeof request.body.name !== 'string')
		return reply.status(400).send({ error: 'Missing or invalid name.' });
	const name = request.body.name;
	try
	{
		const tournament = await Tournament.joinTournament(name);
		return reply.send(tournament);
	} catch (err)
	{
		return reply.status(400).send({ error: err.message });
	}
});

fastify.post('/api/tournament/raw', async (request, reply) => {
	try
	{
		Tournament.addRawTournament(request.body.tournament);
		reply.status(200).send("OK");
	} catch (err)
	{
		return reply.status(400).send({ error: err.message });
	}
});

fastify.post('/api/tournament/advance', async (request, reply) => {
	if (!request.body || typeof request.body.id !== 'number')
	{
		reply.status(400).send({ error: 'Missing or invalid id.' });
		return;
	}
	const tournament = Tournament.TOURNAMENT_LIST[request.body.id];
	if (!tournament)
	{
		reply.status(400).send({error: `ID ${request.body.id} is invalid.`});
		return;
	}
	const newTournament = Tournament.advanceToNextRound(request.body.id);
	reply.status(200).send(Utils.readRound(newTournament));
});

fastify.get('/api/tournament/winner', async (request, reply) => {
	const { id } = request.query;
	if (typeof id === 'undefined' || isNaN(Number(id)))
		return reply.status(400).send({ error: 'Missing or invalid id.' });
	const winner = Tournament.getWinner(id);
	reply.status(200).send({name: winner.name, score: winner.score});
});

fastify.get('/api/tournament/round', async (request, reply) => {
	const { id } = request.query;
	if (typeof id === 'undefined' || isNaN(Number(id)))
		return reply.status(400).send({ error: 'Missing or invalid id.' });
	const round = Tournament.getCurrentRound(id);
	reply.status(200).send(Utils.readRound(round));
});

fastify.post('/api/tournament/playerscores', async (request, reply) => {
	const { players } = request.body;
	if (!players)
		return reply.status(400).send({ error: 'Missing or invalid players.' });
	const success = Tournament.updatePlayerScores(players);
	if (!success)
		reply.status(404).send();
	else
		reply.status(200).send({ message: 'Score updated successfully!' });
});

fastify.get('/api/tournament/getAll', async (request, reply) => {
	try {
		const tournaments = await Tournament.getTournament();
		console.log('tournaments:', tournaments);
		console.log('tournaments type:', typeof tournaments);
		console.log('tournaments is array:', Array.isArray(tournaments));
		
		if (!Array.isArray(tournaments)) {
			return reply.status(500).send({ error: 'getAllTournaments did not return an array' });
		}
		
		const result = tournaments.map(Utils.readTournament);
		console.log('result:', result);
		reply.status(200).send(result);
	} catch (error) {
		console.error('Error in /api/tournament/getAll:', error);
		reply.status(500).send({ error: 'Internal server error', details: error.message });
	}
});


start();
