import Fastify from 'fastify';
import { Server } from 'socket.io';
import cors from '@fastify/cors';
import * as dotenv from 'dotenv';

dotenv.config();

const APP_HOST = process.env.HOST || 'localhost';

const fastify = Fastify({ logger: true });

const clientOrigin = `http://10.12.1.3:5173`;
fastify.register(cors, {
    origin: clientOrigin,
    methods: ['GET', 'POST'],
    credentials: true
});

const io = new Server(fastify.server, {
    cors: {
        origin: clientOrigin,
        methods: ['GET', 'POST'],
        credentials: true
    },
    path: '/my-websocket/'
});

interface GameSession {
    player1SocketId: string;
    player2SocketId: string | null;
    gameId: string;
    intervalId: NodeJS.Timeout | null;
    status: 'waiting' | 'playing' | 'ended';
}

const activeGames = new Map<string, GameSession>();
let waitingPlayerSocketId: string | null = null;


async function sendInput(socketId, key, action) {
    try {
        const response = await fetch(`http://game:3004/api/game/input`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                socketId: socketId,
                key: key,
                action: action,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            console.error('Input: Failed to send to game logic:', response.status);
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error('Input: Error communicating with game logic service:', error);
        return false;
    }
}

async function sendjoin(player1, player2) {
    try {
        console.log(`join: Sending join request for players: ${player1}, ${player2}`);
        const response = await fetch(`http://game:3004/api/game/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player1: player1,
                player2: player2,
                timestamp: Date.now()
            })
        });
        if (!response.ok) {
            console.error('join: Failed to send to game logic:', response.status, await response.text());
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error('join: Error communicating with game logic service:', error);
        return false;
    }
}

async function sendstart(player1, player2) {
    try {
        const response = await fetch(`http://game:3004/api/game/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player1: player1,
                player2: player2,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            console.error('start :Failed to send to game logic:', response.status);
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error('start: Error communicating with game logic service:', error);
        return false;
    }
}

async function getstate(gameId: string, socketId: string) {
    try {
        const response = await fetch(`http://game:3004/api/game/state?socketId=${socketId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return null;
        } 

        const responseData = await response.json();

        if (responseData.success && responseData.gameState) {
            const gameState = responseData.gameState;
            // console.log(`getstate: ${JSON.stringify(gameState)}`);

            const ballPos = {
                x: gameState._ball._pos._x * 2,
                y: 0,
                z: gameState._ball._pos._y * 2
            };

            let platform1Pos = null;
            if (gameState._leftTeam && gameState._leftTeam.length > 0 && gameState._leftTeam[0]._hitbox && gameState._leftTeam[0]._hitbox._pos) {
                platform1Pos = {
                    x: gameState._leftTeam[0]._hitbox._pos._x * 2 + 0.5,
                    y: 0,
                    z: gameState._leftTeam[0]._hitbox._pos._y * 2 + 2.5
                };
            }

            let platform2Pos = null;
            if (gameState._rightTeam && gameState._rightTeam.length > 0 && gameState._rightTeam[0]._hitbox && gameState._rightTeam[0]._hitbox._pos) {
                platform2Pos = {
                    x: gameState._rightTeam[0]._hitbox._pos._x * 2 + 0.5,
                    y: 0,
                    z: gameState._rightTeam[0]._hitbox._pos._y * 2 + 2.5
                };
            }
            const paddleName = "paddle." + socketId;
            console.log(`gameState.leftTeam: ${JSON.stringify(gameState._leftTeam[0]._hitbox._name)}, user socketId: ${paddleName}`);
            if (gameState._leftTeam && gameState._leftTeam.length > 0 && paddleName === gameState._leftTeam[0]._hitbox._name) {
                console.debug(`state: Emitting teamPing to left team for socketId: ${socketId}`);
                io.to(socketId).emit('teamPing');
            }
            if (ballPos && platform1Pos && platform2Pos) {
                io.to(gameId).emit('updatePositions', {
                    ball: ballPos,
                    platform1: platform1Pos,
                    platform2: platform2Pos
                });
            }
            if (gameState._score) {
                const player1Score = gameState._score[0];
                const player2Score = gameState._score[1];
                io.to(gameId).emit('scoreUpdate', {
                    player1Score: player1Score,
                    player2Score: player2Score
                });
            }
            return responseData.gameState;
        } else {
            return null;
        }
    } catch (error) {
        console.error('state: Error communicating with game logic service:', error);
        return null;
    }
}

io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    if (waitingPlayerSocketId === null) {
        waitingPlayerSocketId = socket.id;
        socket.emit('message', 'En attente d\'un autre joueur...');
        console.log(`Player ${socket.id} is now waiting for an opponent.`);
    } else {
        const player1SocketId = waitingPlayerSocketId;
        const player2SocketId = socket.id;
        
        waitingPlayerSocketId = null;

        const gameId = [player1SocketId, player2SocketId].sort().join('-');

        const newGame: GameSession = {
            player1SocketId: player1SocketId,
            player2SocketId: player2SocketId,
            gameId: gameId,
            intervalId: null,
            status: 'waiting'
        };
        activeGames.set(gameId, newGame);

        io.sockets.sockets.get(player1SocketId)?.join(gameId);
        io.sockets.sockets.get(player2SocketId)?.join(gameId);

        console.log(`Matching players ${player1SocketId} and ${player2SocketId} for game ${gameId}`);

        const createSuccess = await sendjoin(player1SocketId, player2SocketId);
        if (!createSuccess) {
            io.to(gameId).emit('message', 'Échec de la création de la partie. Veuillez réessayer.');
            console.error(`Failed to create game for ${gameId}. Disconnecting players.`);
            io.sockets.sockets.get(player1SocketId)?.disconnect(true);
            io.sockets.sockets.get(player2SocketId)?.disconnect(true);
            activeGames.delete(gameId);
            return;
        }

        const startSuccess = sendstart(player1SocketId, player2SocketId);
        
        if (startSuccess) {
            newGame.status = 'playing';
            io.to(gameId).emit('message', 'La partie commence !');
            console.log(`Game ${gameId} started successfully.`);

            newGame.intervalId = setInterval(async () => {
                await getstate(gameId, player1SocketId); 
            }, 10);
        } else {
            io.to(gameId).emit('message', 'Échec du démarrage de la partie. Veuillez réessayer.');
            console.error(`Failed to start game ${gameId}. Disconnecting players.`);
            io.sockets.sockets.get(player1SocketId)?.disconnect(true);
            io.sockets.sockets.get(player2SocketId)?.disconnect(true);
            activeGames.delete(gameId);
        }
    }

    socket.on('message', (data: string) => {
        console.log(`Message from client ${socket.id}:`, data);

        const gameId = getGameIdBySocketId(socket.id);
        if (gameId) {
            io.to(gameId).emit('message', `[${socket.id.substring(0, 4)}] : ${data}`);
        } else {
            socket.emit('message', 'Vous n\'êtes pas dans une partie.');
        }
    });

    socket.on('keydown', (data: { key: string }) => {
        sendInput(socket.id, data.key, 'keydown');
    });

    socket.on('keyup', (data: { key: string }) => {
        sendInput(socket.id, data.key, 'keyup');
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        let disconnectedGameId: string | null = null;
        activeGames.forEach((game, gameId) => {
            if (game.player1SocketId === socket.id || game.player2SocketId === socket.id) {
                disconnectedGameId = gameId;
            }
        });

        if (disconnectedGameId) {
            const game = activeGames.get(disconnectedGameId)!;

            if (game.intervalId) {
                clearInterval(game.intervalId);
            }
            activeGames.delete(disconnectedGameId);

            const otherPlayerSocketId = game.player1SocketId === socket.id ? game.player2SocketId : game.player1SocketId;
            if (otherPlayerSocketId && io.sockets.sockets.has(otherPlayerSocketId)) {
                io.to(otherPlayerSocketId).emit('message', 'Votre adversaire s\'est déconnecté. La partie est terminée.');
                io.to(otherPlayerSocketId).emit('gameOver');
                io.sockets.sockets.get(otherPlayerSocketId)?.disconnect(true);
            }
            console.log(`Game ${disconnectedGameId} ended due to player disconnect.`);
        } else if (waitingPlayerSocketId === socket.id) {
            waitingPlayerSocketId = null;
            console.log(`Waiting player ${socket.id} disconnected.`);
        }
    });
});

function getGameIdBySocketId(socketId: string): string | null {
    for (const [gameId, gameSession] of activeGames.entries()) {
        if (gameSession.player1SocketId === socketId || gameSession.player2SocketId === socketId) {
            return gameId;
        }
    }
    return null;
}

const start = async () => {
    try {
        await fastify.listen({ port: 3008, host: '0.0.0.0' });
        console.log(`Fastify and Socket.IO server listening on port 3008`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
