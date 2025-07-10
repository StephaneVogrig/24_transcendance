import Fastify from 'fastify';
import * as Tournament from './tournament.js'
import * as Utils from './utils.js';
import cors from '@fastify/cors'

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
	origin: 'http://10.11.5.7:5173',
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
		const tournament = Tournament.findTournament();
		await Tournament.joinTournament(tournament.id, name);
		return reply.send(tournament);
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

// fastify.post('/api/tournament/start', async (request, reply) => {
// 	if (!request.body || typeof request.body.id !== 'number')
// 	{
// 		reply.status(400).send({ error: 'Missing or invalid id.' });
// 		return;
// 	}
// 	const tournament = Tournament.TOURNAMENT_LIST[request.body.id];
// 	if (!tournament)
// 	{
// 		reply.status(400).send({error: `ID ${request.body.id} is invalid.`});
// 		return;
// 	}
// 	const startedTournament = Tournament.startTournament(tournament);
// 	reply.status(200).send(Utils.readRound(startedTournament));
// });

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

fastify.post('/api/tournament/playerscore', async (request, reply) => {
	if (!request.body || typeof request.body.id !== 'number')
	{
		reply.status(400).send({ error: 'Missing or invalid id.' });
		return;
	}
	else if (!request.body.name || typeof request.body.name !== 'string')
	{
		reply.status(400).send({ error: 'Missing or Invalid player name.' });
		return;
	}
	else if (typeof request.body.score !== 'number')
	{
		reply.status(400).send({ error: 'Missing or Invalid player score.' });
		return;
	}
	Tournament.updatePlayerScore(request.body.id, request.body.name, request.body.score);
	reply.status(200).send({ message: 'Score updated successfully!' });
});

start();
