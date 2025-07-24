import Fastify from 'fastify';
import * as GameManager from './gameManager.js';
import cors from '@fastify/cors'

const fastify = Fastify({ logger: true });

fastify.get('/api/auth', async (request, reply) => { 
  return { message: 'Hello from Game Service!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3004, host: '0.0.0.0' });
    console.log(`Game service listening on port 3004`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

const HOST_IP = process.env.HOST_IP;

fastify.register(cors, {
	origin: [
		`http://${HOST_IP}:5173`,
		'http://localhost:5173'
	],
	methods: ['GET', 'POST'],
	credentials: true
});

fastify.post('/api/game/start', async (request, reply) => {
    const { player1, player2, maxScore } = request.body;
    if (!player1 || !player2 || !maxScore) {
		console.log(`${player1} and ${player2} " | " ${maxScore}`);
        return reply.status(400).send({ error: 'Both player1 and player2 are required' });
    }
    try {
        GameManager.addMatch(player1, player2, maxScore);
    } catch (error) {
        return reply.status(400).send({ error: error.message });
    }
    console.log(`Starting game between ${player1} and ${player2}`);
    return reply.status(200).send({ message: `Game started between ${player1} and ${player2}` });
});

fastify.post('/api/game/input', async (request, reply) => {
    const { player, key, action } = request.body;
    console.log(`Received input from player ${player}: key=${key}, action=${action}`);
    if (!player || !key || !action)
        return reply.status(400).send({ error: 'Player, key, and action are required' });
    const match = GameManager.findMatch(player);
    if (!match)
        return reply.status(404).send({ error: `No match found for player ${player}` });
    match.inputManager(player, key, action);
});

fastify.post('/api/game/stop', async (request, reply) => {
    const { player } = request.body;
    if (!player) {
        return reply.status(400).send({ error: 'Player is required' });
    }
    try {
        GameManager.stopMatch(player);
    } catch (error) {
        return reply.status(404).send({ error: error.message });
    }
    return reply.status(200).send({ message: `Game stopped for player ${player}` });
});

fastify.get('/api/game/gameOver', async (request, reply) => {
    const { player } = request.query;
    if (!player)
        return reply.status(400).send({ error: 'Player is required' });
    const match = GameManager.findMatch(player);
    if (!match)
        return reply.status(404).send({ error: `No match found for player ${player}` });
    if (match.gameStatus === 'finished') {
        const state = {
            winner: {
                name: match.player1.getScore() > match.player2.getScore() ? match.player1.getName() : match.player2.getName(),
                score: Math.max(match.player1.getScore(), match.player2.getScore())
            },
            score: [match.player1.getScore(), match.player2.getScore()],
            gameStatus: match.gameStatus
        };
        return reply.status(200).send({ state: state });
    }
    return reply.status(400).send({ error: 'Game is not finished yet' });
});

fastify.get('/api/game/state', async (request, reply) => {
    const { player } = request.query;
    if (!player)
        return reply.status(400).send({ error: 'Player is required' });
    const match = GameManager.findMatch(player);
    if (!match)
        return reply.status(404).send({ error: `No match found for player ${player}` });
    const state = {
        player1: {
            name: match.player1.getName(),
            paddle: match.player1.getPaddle().getPosition()
        },
        player2: {
            name: match.player2.getName(),
            paddle: match.player2.getPaddle().getPosition()
        },
        ball: match.ball.getPosition(),
		ballspeed: match.ball.getSpeed(),
        score: [match.player1.getScore(), match.player2.getScore()],
        gameStatus: match.gameStatus
    };
    return reply.status(200).send({state: state});
});

start();
