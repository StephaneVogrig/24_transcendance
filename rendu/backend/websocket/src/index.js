import Fastify from 'fastify';
import { Server } from 'socket.io';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });


const HOST_IP = process.env.HOST_IP;
const HOST_ADRESS = `http://${HOST_IP}:5173`;

fastify.register(cors, {
    origin: [
        HOST_ADRESS,
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
});

const io = new Server(fastify.server, {
    cors: {
        origin: [
            HOST_ADRESS,
            'http://localhost:5173'
        ],
        methods: ['GET', 'POST'],
        credentials: true
    },
    path: '/my-websocket/'
});

let playerNameToSocketId = new Map();
let socketIdToPlayerName = new Map();
let gameSessions = new Map();
let pendingRedirectAcceptances = new Map();

fastify.get('/api/websocket', async (request, reply) => { 
  return { message: 'Hello from WebSocket Service!' };
});

async function waitForRedirectAcceptance(playerName, timeout = 15000) {
    return new Promise((resolve, reject) => {
        pendingRedirectAcceptances.set(playerName, { resolve, reject });

        const timer = setTimeout(() => {
            if (pendingRedirectAcceptances.has(playerName)) {
                pendingRedirectAcceptances.delete(playerName); // Nettoie la map
                console.warn(`Redirect acceptance for player ${playerName} timed out.`);
                reject(new Error('Redirect acceptance timed out.'));
            }
        }, timeout);

        pendingRedirectAcceptances.get(playerName).cleanUp = () => clearTimeout(timer);
    });
}

fastify.post('/api/websocket/redirect', async (request, reply) => {
    const { name, gameId } = request.body;
    console.log(`Received request to redirect player ${name} to game ${gameId}`);
    if (!name || !gameId) {
        return reply.status(400).send({ error: 'Player name and game ID are required' });
    }
    const socketId = playerNameToSocketId.get(name);
    if (!socketId) {
        console.warn(`Player ${name} not found in active connections. They might be reconnecting.`);
        return reply.status(404).send({ error: `Player ${name} not found or not currently connected to a known socket.` });
    }
    console.log(`Redirecting player ${name} with socket ID ${socketId} to game ${gameId}`);
    
    io.to(socketId).emit('redirect', { gameId: gameId, playerName: name });
    await waitForRedirectAcceptance(name);
    return reply.status(200).send({ message: `Player ${name} redirected to game ${gameId}` });
});

fastify.post('/api/websocket/startGame', async (request, reply) => {
    const { player1Name, player2Name, gameId } = request.body; 

    if (!player1Name || !player2Name || !gameId) {
        return reply.status(400).send({ error: 'player1Name, player2Name, and gameId are required' });
    }

    console.log(`Received request to start game ${gameId} for ${player1Name} and ${player2Name}`);

    const player1SocketId = playerNameToSocketId.get(player1Name);
    const player2SocketId = playerNameToSocketId.get(player2Name);

    const player1Socket = io.sockets.sockets.get(player1SocketId);
    const player2Socket = io.sockets.sockets.get(player2SocketId);

    if (!player1Socket || !player2Socket) {
        console.warn(`Game ${gameId} cannot start: One or both players not connected.`);
        if (!player1Socket) io.to(playerNameToSocketId.get(player1Name)).emit('error', { message: 'Your opponent disconnected or connection issue.' });
        if (!player2Socket) io.to(playerNameToSocketId.get(player2Name)).emit('error', { message: 'Your opponent disconnected or connection issue.' });
        return reply.status(404).send({ error: 'One or both players are not connected.' });
    }

    if (gameSessions.has(gameId)) {
        console.warn(`Game ${gameId} already exists and is attempting to be started again.`);
        return reply.status(409).send({ error: `Game ${gameId} already in progress.` });
    }

    player1Socket.join(gameId);
    player2Socket.join(gameId);
    console.log(`Players ${player1Name} (${player1Socket.id}) and ${player2Name} (${player2Socket.id}) joined room ${gameId}`);

    const gameInterval = setInterval(async () => {
        await getstate(gameId, player1Name); 
    }, 1000 / 60);

    gameSessions.set(gameId, {
        player1Name: player1Name,
        player2Name: player2Name,
        player1SocketId: player1Socket.id,
        player2SocketId: player2Socket.id,
        intervalId: gameInterval
    });
    console.log(`Game session ${gameId} registered.`);

    io.to(gameId).emit('gameStarted', { gameId: gameId, player1Name: player1Name, player2Name: player2Name });
    console.log(`'gameStarted' event emitted to room ${gameId}`);

    return reply.status(200).send({ message: `Game session ${gameId} created and started for players ${player1Name} and ${player2Name}`, gameId });
});


async function sendInput(playerName, key, action) {
    try {
        const response = await fetch(`http://game:3004/api/game/input`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player: playerName,
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

async function getstate(gameId, player) {
    try {
        const response = await fetch(`http://game:3004/api/game/state?player=${player}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return null;
        }

        const responseData = await response.json();

        if (responseData.state) {
            const gameState = responseData.state;

            const ballPos = {
                x: gameState.ball._x / 2.5,
                y: 0,
                z: gameState.ball._y / 2.5
            };

            let platform1Pos = null;
            if (gameState.player1 && gameState.player1.paddle){
                platform1Pos = {
                    x: gameState.player1.paddle._x / 2.5 + 0.5,
                    y: 0,
                    z: gameState.player1.paddle._y / 2.5
                };
            }

            let platform2Pos = null;
            if (gameState.player2 && gameState.player2.paddle) {
                platform2Pos = {
                    x: gameState.player2.paddle._x / 2.5 - 0.5,
                    y: 0,
                    z: gameState.player2.paddle._y / 2.5
                };
            }
            if (gameState.player1.name === player) {
                const player1SocketId = playerNameToSocketId.get(player); 
                if (player1SocketId) {
                    console.debug(`state: Emitting teamPing to left team for player: ${player} (socketId: ${player1SocketId})`);
                    io.to(player1SocketId).emit('teamPing');
                }
            }
            if (ballPos && platform1Pos && platform2Pos) {
                io.to(gameId).emit('updatePositions', {
                    ball: ballPos,
                    platform1: platform1Pos,
                    platform2: platform2Pos
                });
            }
            if (gameState.score) {
                const player1Score = gameState.score[0];
                const player2Score = gameState.score[1];
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

function stopGame(playerName) {
    try {
        const reponse = fetch(`http://game:3004/api/game/stop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player: playerName,
                timestamp: Date.now()
            })
        });
        if (!reponse.ok) {
            console.error('stopGame: Failed to send stop request to game logic:', reponse.status);
            return false;
        }
        return true;
    } catch (error) {
        console.error('stopGame: Error communicating with game logic service:', error);
        return false;
    }
}


io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.data.status = 'connected';

    socket.on('join', async (data) => {
        const name = data.name;
        if (!name || typeof name !== 'string' || name.length < 3 || name.length > 20) {
            console.error(`Invalid player name: ${name}`);
            socket.emit('error', { message: 'Player name must be a string between 3 and 20 characters.' });
            return;
        }
        console.log(`Player ${name} joined (matchmaking) with socket ID: ${socket.id}`);
        playerNameToSocketId.set(name, socket.id);
        socketIdToPlayerName.set(socket.id, name);
        socket.data.playerName = name;
    });

    socket.on('identify_player', (data) => {
        const name = data.name;
        if (!name || typeof name !== 'string' || name.length < 3 || name.length > 20) {
            console.error(`Invalid player name for identify_player: ${name}`);
            socket.emit('error', { message: 'Player name must be a string between 3 and 20 characters.' });
            return;
        }
        console.log(`Player ${name} identified (in-game) with new socket ID: ${socket.id}`);
        playerNameToSocketId.set(name, socket.id);
        socketIdToPlayerName.set(socket.id, name);
        socket.data.playerName = name;
    });

    socket.on('keydown', (data) => {
        const playerName = socket.data.playerName;
        
        if (!playerName) {
            console.error(`Keydown from unidentified socket: ${socket.id}. Data: ${JSON.stringify(data)}`);
            return;
        }
        console.log(`Key down: ${data.key} for player ${playerName}`);
        sendInput(playerName, data.key, 'keydown');
    });

    socket.on('keyup', (data) => {
        const playerName = socket.data.playerName;

        if (!playerName) {
            console.error(`Keyup from unidentified socket: ${socket.id}. Data: ${JSON.stringify(data)}`);
            return;
        }
        console.log(`Key up: ${data.key} for player ${playerName}`);
        sendInput(playerName, data.key, 'keyup');
    });

    socket.on('acceptGame', async () => {
        const playerName = socket.data.playerName;

        if (!playerName) {
            console.error(`acceptGame from unidentified socket: ${socket.id}`);
            return;
        }
        console.log(`Player ${playerName} accepted the game`);
        if (pendingRedirectAcceptances.has(playerName)) {
            const { resolve, cleanUp } = pendingRedirectAcceptances.get(playerName);
            pendingRedirectAcceptances.delete(playerName);
            resolve();
            if (cleanUp) cleanUp();
            console.log(`Redirect acceptance for player ${playerName} resolved.`);
        } else {
            console.warn(`Player ${playerName} accepted game but no pending redirect acceptance was found.`);
        }
        console.log(`Player ${playerName} status set to 'in-game' after accepting game.`);
    });

    socket.on('disconnect', () => {
        const disconnectedPlayerName = socketIdToPlayerName.get(socket.id);
        if (disconnectedPlayerName) {
            console.log(`Player ${disconnectedPlayerName} (socket ID: ${socket.id}) disconnected.`);
            playerNameToSocketId.delete(disconnectedPlayerName);
            socketIdToPlayerName.delete(socket.id);
            if (pendingRedirectAcceptances.has(disconnectedPlayerName)) {
                const { reject, cleanUp } = pendingRedirectAcceptances.get(disconnectedPlayerName);
                pendingRedirectAcceptances.delete(disconnectedPlayerName);
                if (cleanUp) cleanUp();
                console.warn(`Redirect acceptance for player ${disconnectedPlayerName} rejected due to disconnect.`);
            }
            for (const [gameId, session] of gameSessions.entries()) {
                if (session.player1SocketId === socket.id || session.player2SocketId === socket.id) {
                    console.log(`Player ${disconnectedPlayerName} was in game ${gameId}. Notifying other player.`);
                    const otherPlayerSocketId = session.player1SocketId === socket.id ? session.player2SocketId : session.player1SocketId;
                    io.to(otherPlayerSocketId).emit('error', { message: `Your opponent ${disconnectedPlayerName} has disconnected.` });
                    clearInterval(session.intervalId);
                    io.to(gameId).emit('gameOver', { message: `Game over. Player ${disconnectedPlayerName} has disconnected.` });
                    stopGame(disconnectedPlayerName);
                    gameSessions.delete(gameId);
                }
            }
        } else {
            console.log(`Unidentified socket disconnected: ${socket.id}`);
        }
    });
});

const start = async () => {
    try {
        await fastify.listen({ port: 3008, host: '0.0.0.0' });
        console.log(`Server listening at http://0.0.0.0:3008`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
