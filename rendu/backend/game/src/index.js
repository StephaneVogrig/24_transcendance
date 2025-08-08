import { fastify, log } from '../shared/fastify.js'
import * as GameManager from './gameManager.js';

fastify.post('/start', async (request, reply) => {
    const { player1, player2, maxScore } = request.body;
    if (!player1 || !player2 || !maxScore) {
		console.log(`${player1} and ${player2} " | " ${maxScore}`);
        return reply.status(400).send({ error: 'Both player1 and player2 are required' });
    }
    log.debug(request.body, "requested start game");
    try {
        GameManager.addMatch(player1, player2, maxScore);
        log.debug(request.body, "Game started");
        return reply.status(200).send({ message: `Game started between ${player1} and ${player2}` });
    } catch (error) {
        log.error(error, `start error`);
        return reply.status(400).send({ error: error.message });
    }
});

fastify.post('/input', async (request, reply) => {
    const { player, key, action } = request.body;
    console.log(`Received input from player ${player}: key=${key}, action=${action}`);
    if (!player || !key || !action)
        return reply.status(400).send({ error: 'Player, key, and action are required' });
    const match = GameManager.findMatch(player);
    if (!match)
        return reply.status(404).send({ error: `No match found for player ${player}` });
    match.inputManager(player, key, action);
});

fastify.post('/stop', async (request, reply) => {
    const { player } = request.body;
    if (!player) {
        return reply.status(400).send({ error: 'Player is required' });
    }
    log.debug(request.body, "requested stop");

    try {
        await GameManager.stopMatch(player);
        return reply.status(200).send({ message: `Game stopped for player ${player}` });
    } catch (error) {
        return reply.status(404).send({ error: error.message });
    }
});

fastify.get('/gameOver', async (request, reply) => {
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

fastify.get('/state', async (request, reply) => {
    const { player } = request.query;
    if (!player)
        return reply.status(400).send({ error: 'Player is required' });
    const match = GameManager.findMatch(player);
    if (!match)
        return reply.status(404).send({ error: `No match found for player ${player}` });
    const gameState = {
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
    return reply.status(200).send({gameState: gameState});
});
