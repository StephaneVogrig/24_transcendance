import Fastify from 'fastify';
import { Server } from 'socket.io';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

const clientOrigin = `http://10.11.5.2:5173`;
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

// API endpoint to handle games
fastify.get('/api/websocket', async (request, reply) => { 
  return { message: 'Hello from WebSocket Service!' };
});

fastify.post('/api/websocket/redirect', async (request, reply) => {
    const { name, gameId } = request.body;
    console.log(`Received request to redirect player ${name} to game ${gameId}`);
    if (!name || !gameId) {
        return reply.status(400).send({ error: 'Player name and game ID are required' });
    }
    const socketId = user.get(name);
    if (!socketId) {
        return reply.status(404).send({ error: `Player ${name} not found` });
    }
    console.log(`Redirecting player ${name} with socket ID ${socketId} to game ${gameId}`);
    io.to(socketId).emit('redirect', { gameId: gameId });
    return reply.status(200).send({ message: `Player ${name} redirected to game ${gameId}` });
});


// Function to send input to the game logic service

async function sendInput(socketId, key, action) {
    try {
        const response = await fetch(`http://game:3004/api/game/input`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player: socketId,
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
            // console.log(`getstate: ${JSON.stringify(gameState)}`);

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

const user = new Map();

const gameSessions = new Map();

io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join', async (data) => {
        const name = data.name;
        if (!name || typeof name !== 'string' || name.length < 3 || name.length > 20) {
            console.error(`Invalid player name: ${name}`);
            socket.emit('error', { message: 'Player name must be a string between 3 and 20 characters.' });
            return;
        }
        console.log(`Player ${name} joined with socket ID: ${socket.id}`);
        user.set(name, socket.id);
    });

    // if (startSuccess) {
    //     newGame.status = 'playing';
    //     io.to(gameId).emit('message', 'La partie commence !');
    //     // console.log(`Game ${gameId} started successfully.`);

    //     newGame.intervalId = setInterval(async () => {
    //         await getstate(gameId, player1SocketId);
    //     }, 10);
    // }

    socket.on('keydown', (data) => {
        sendInput(socket.id, data.key, 'keydown');
    });

    socket.on('keyup', (data) => {
        sendInput(socket.id, data.key, 'keyup');
    });

    // socket.on('disconnect', () => {
    //     io.to(otherPlayerSocketId).emit('gameOver');
    // });
});

const start = async () => {
    try {
        await fastify.listen({ port: 3008, host: '0.0.0.0' });
        // console.log(`Fastify and Socket.IO server listening on port 3008`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
