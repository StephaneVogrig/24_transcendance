import { fastify, log } from './fastify.js';
import * as Tournament from './tournament.js'
import * as Utils from './utils.js';

const serviceName = 'tournament';
const serviceport = process.env.PORT;

fastify.get('/health', async (request, reply) => {
  return {
    service: serviceName,
    port: serviceport,
    status: 'healthy',
    uptime: process.uptime()
  };
});

fastify.get('/get', async (request, reply) => {
    const { id } = request.query;
    if (typeof id === 'undefined' || isNaN(Number(id)))
        return reply.status(400).send({ error: 'Missing or invalid id.' });
    const tournament = Tournament.getTournament(id);
    reply.status(200).send(Utils.readTournament(tournament));
});

fastify.get('/playerInTournament', async (request, reply) => {
    const { name } = request.query;
    if (!name || typeof name !== 'string')
        return reply.status(400).send({ error: 'Missing or invalid player name.' });
    const tournament = Tournament.findTournamentWithPlayer(name);
    return reply.status(200).send({ tournament });
});

fastify.post('/create', async (request, reply) => {
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

fastify.post('/leave', async (request, reply) => {
    if (!request.body || typeof request.body.name !== 'string')
        return reply.status(400).send({ error: 'Missing or invalid name.' });
    const name = request.body.name;
    try
    {
        Tournament.leaveTournament(name);
        return reply.status(200).send();
    } catch (err)
    {
        return reply.status(400).send({ error: err.message });
    }
});

fastify.post('/join', async (request, reply) => {
    if (!request.body || typeof request.body.name !== 'string')
        return reply.status(400).send({ error: 'Missing or invalid name.' });
    const name = request.body.name;
    try
    {
        Utils.checkPlayerName(name);
        const tournament = await Tournament.joinTournament(name);
        return reply.send(tournament);
    } catch (err)
    {
        return reply.status(400).send({ error: err.message });
    }
});

fastify.post('/raw', async (request, reply) => {
    try
    {
        Tournament.addRawTournament(request.body.tournament);
        reply.status(200).send("OK");
    } catch (err)
    {
        return reply.status(400).send({ error: err.message });
    }
});

fastify.post('/advance', async (request, reply) => {
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
    const newTournament = await Tournament.advanceToNextRound(request.body.id);
    reply.status(200).send(Utils.readRound(newTournament));
});

fastify.get('/winner', async (request, reply) => {
    const { id } = request.query;
    if (typeof id === 'undefined' || isNaN(Number(id)))
        return reply.status(400).send({ error: 'Missing or invalid id.' });
    const winner = Tournament.getWinner(id);
    reply.status(200).send({name: winner.name, score: winner.score});
});

fastify.get('/round', async (request, reply) => {
    const { id } = request.query;
    if (typeof id === 'undefined' || isNaN(Number(id)))
        return reply.status(400).send({ error: 'Missing or invalid id.' });
    const round = Tournament.getCurrentRound(id);
    reply.status(200).send(Utils.readRound(round));
});

fastify.post('/playerscores', async (request, reply) => {
    const { players } = request.body;
    if (!players)
        return reply.status(400).send({ error: 'Missing or invalid players.' });
    const success = await Tournament.updatePlayerScores(players);
    if (!success)
        reply.status(404).send();
    else
        reply.status(200).send({ message: 'Score updated successfully!' });
});

fastify.get('/getAll', async (request, reply) => {
    try {
        const tournaments = Tournament.getTournament();
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
        console.error('Error in /getAll:', error);
        reply.status(500).send({ error: 'Internal server error', details: error.message });
    }
});
