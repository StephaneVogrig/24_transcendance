import { fastify, log } from '../shared/fastify.js';
import { Server } from 'socket.io';

const io = new Server(fastify.server, {
	path: '/my-websocket/'
});

let playerNameToSocketId = new Map();
let socketIdToPlayerName = new Map();
let gameSessions = new Map();
let pendingRedirectAcceptances = new Map();

async function waitForRedirectAcceptance(playerName, timeout = 60000) {
	return new Promise((resolve, reject) => {
		pendingRedirectAcceptances.set(playerName, { resolve, reject });

		const timer = setTimeout(() => {
			if (pendingRedirectAcceptances.has(playerName)) {
				pendingRedirectAcceptances.delete(playerName);
				log.warn(`Redirect acceptance for player ${playerName} timed out.`);
				reject(new Error('Redirect acceptance timed out.'));
			}
		}, timeout);

		pendingRedirectAcceptances.get(playerName).cleanUp = () => clearTimeout(timer);
	});
}

fastify.post('/redirect', async (request, reply) => {
	const { name, gameId } = request.body;
	log.debug(request.body, `Received request to redirect player ${name} to game ${gameId}`);
	if (!name || !gameId) {
		return reply.status(400).send({ error: 'Player name and game ID are required' });
	}
	const socketId = playerNameToSocketId.get(name);
	if (!socketId) {
		log.warn(`Player ${name} not found in active connections. They might be reconnecting.`);
		return reply.status(404).send({ error: `Player ${name} not found or not currently connected to a known socket.` });
	}
	log.debug(`Redirecting player ${name} with socket ID ${socketId} to game ${gameId}`);
	
	io.to(socketId).emit('redirect', { gameId: gameId, playerName: name });
	await waitForRedirectAcceptance(name);
	return reply.status(200).send({ message: `Player ${name} redirected to game ${gameId}` });
});

fastify.post('/startGame', async (request, reply) => {
	const { player1Name, player2Name, gameId } = request.body;

	if (!player1Name || !player2Name || !gameId) {
		return reply.status(400).send({ error: 'player1Name, player2Name, and gameId are required' });
	}

	log.debug(`Received request to start game ${gameId} for ${player1Name} and ${player2Name}`);

	const player1SocketId = playerNameToSocketId.get(player1Name);
	const player2SocketId = playerNameToSocketId.get(player2Name);

	const player1Socket = io.sockets.sockets.get(player1SocketId);
	const player2Socket = io.sockets.sockets.get(player2SocketId);

	if (!player1Socket || !player2Socket) {
		log.warn(`Game ${gameId} cannot start: One or both players not connected.`);
		if (!player1Socket) io.to(playerNameToSocketId.get(player1Name)).emit('error', { message: 'Your opponent disconnected or connection issue.' });
		if (!player2Socket) io.to(playerNameToSocketId.get(player2Name)).emit('error', { message: 'Your opponent disconnected or connection issue.' });
		return reply.status(404).send({ error: 'One or both players are not connected.' });
	}

	if (gameSessions.has(gameId)) {
		log.warn(`Game ${gameId} already exists and is attempting to be started again.`);
		return reply.status(409).send({ error: `Game ${gameId} already in progress.` });
	}

	player1Socket.join(gameId);
	player2Socket.join(gameId);
	log.debug(`Players ${player1Name} (${player1Socket.id}) and ${player2Name} (${player2Socket.id}) joined room ${gameId}`);

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
	log.debug(`Game session ${gameId} registered.`);

	io.to(gameId).emit('gameStarted', { gameId: gameId, player1Name: player1Name, player2Name: player2Name });
	log.debug(`'gameStarted' event emitted to room ${gameId}`);

	return reply.status(200).send({ message: `Game session ${gameId} created and started for players ${player1Name} and ${player2Name}`, gameId });
});

async function sendInput(playerName, key, action) {
	try {
		const response = await fetch(`http://game:3004/input`, {
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
			log.error('Input: Failed to send to game logic:', response.status);
			return false;
		} else {
			return true;
		}
	} catch (error) {
		log.error('Input: Error communicating with game logic service:', error);
		return false;
	}
}

async function getGameOver(player) {
	try {
		const response = await fetch(`http://game:3004/gameOver?player=${player}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			return null;
		}

		const responseData = await response.json();
		return responseData.state;
	} catch (error) {
		log.error('Error fetching game over state:', error);
		return null;
	}
}

async function isInTournament(playerName) {
	try {
		const response = await fetch(`http://tournament:3007/playerInTournament?name=${playerName}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) {
			return false;
		}
		const responseData = await response.json();
		return responseData.tournament !== undefined;
	} catch (error) {
		log.error('Error checking tournament status:', error);
		return false;
	}
}

async function getstate(gameId, player) {
	try {
		const response = await fetch(`http://game:3004/state?player=${player}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			return null;
		}

		const responseData = await response.json();

		if (!responseData.gameState) {
			return null;
		}

		const gameState = responseData.gameState;

		if (gameState.player1.name === player) {
			const player1SocketId = playerNameToSocketId.get(player);
			if (player1SocketId)
				io.to(player1SocketId).emit('teamPing', { team: 'left' });
			const player2SocketId = playerNameToSocketId.get(gameState.player2.name);
			if (player2SocketId)
				io.to(player2SocketId).emit('teamPing', { team: 'right' });
		}

		// HANDLE GAME STATUS
		if (gameState.gameStatus) {
			if (gameState.gameStatus === 'finished') {
				log.debug(`Game ${gameId} finished. Fetching game over state for player ${player}.`);
				const gameOverState = await getGameOver(player);
				if (gameOverState) {
					log.debug(`Game over state for player ${player}:`, gameOverState);
					io.to(gameId).emit('gameOver', {
						type: isInTournament(player) ? 'tournament' : 'default',
						winner: gameOverState.winner,
						score: gameOverState.score
					});
				}
			}
			io.to(gameId).emit('gameStatusUpdate', {
				gameStatus: gameState.gameStatus
			});
			if (gameState.gameStatus === 'finished') {
				log.debug(`Game ${gameId} finished. Stopping game loop.`);
				const session = gameSessions.get(gameId);
				if (session) {
					clearInterval(session.intervalId);
					gameSessions.delete(gameId);
					log.debug(`Game session ${gameId} cleared from memory.`);
				}
			}
		}

		io.to(gameId).emit('gameState', responseData.gameState);
        return responseData.gameState;

	} catch (error) {
		log.error('state: Error communicating with game logic service:', error);
		return null;
	}
}

async function stopGame(playerName) {
	try {
		const response = await fetch(`http://game:3004/stop`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				player: playerName,
				timestamp: Date.now()
			})
		});
		if (!response.ok) {
			log.error('stopGame: Failed to send stop request to game logic:', response.status);
			return false;
		}
		if (playerName)
		{
			log.debug(`stopGame called for player ${playerName}`);
			try
			{
				const response = await fetch(`http://database:3003/removeUser`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username: playerName })
				});
				if (!response.ok)
					log.debug(`Failed to delete user ${playerName} from db: ${response.status}`);
				else
					log.debug(`Deleted ${playerName} from db.`);
			}
			catch (error)
			{
				log.error(`Error removing ${playerName} in database:`, error);
			}
		}
		return true;
	} catch (error) {
		log.error('stopGame: Error communicating with game logic service:', error);
		return false;
	}
}

io.on('connection', async (socket) => {
	log.debug(`Socket connected: ${socket.id}`);
	socket.data.status = 'connected';

	socket.on('join', async (data, callback) => {
        const name = data.name;
		try
		{
            log.debug({name: 'socketOnJoin'}, `started for ${name}`);
			const response = await fetch(`http://database:3003/addUser`, {
				method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: name
                })
			});
			if (!response.ok)
            {
                let error = '';
                if (response.status === 400)
                    error = 'INVALID_NAME';
                else if (response.status === 409)
                    error = `ALREADY_USE`;
                else
                    error = `DATABASE_ERROR`;
                log.debug({name: 'socketOnJoin'}, `${error} : ${name}`);
                callback({ success: false, error: error});
            } else {
                log.debug({name: 'socketOnJoin'}, `Player ${name} joined with socket ID: ${socket.id}`);
                playerNameToSocketId.set(name, socket.id);
                socketIdToPlayerName.set(socket.id, name);
                socket.data.playerName = name;
                log.debug({name: 'socketOnJoin'}, `succesfully completed for ${name}`);
                callback({ success: true, error: '' });
            }
		}
		catch (error)
		{
	        log.debug({name: 'socketOnJoin', error: error}, `socketOn join error for ${name}`);
            callback({ success: false, message: error.message});
		}
	});

	socket.on('identify_player', (data) => {
		const name = data.name;
		if (!name || typeof name !== 'string' || name.length < 3 || name.length > 25) {
			log.error(`Invalid player name for identify_player: ${name}`);
			socket.emit('error', { message: 'Player name must be a string between 3 and 25 characters.' });
			return;
		}
		if (playerNameToSocketId.has(name)) {
			log.error(`Player name ${name} is already in use.`);
			socket.emit('error', { message: `Player name ${name} is already in use.` });
			return;
		}
		log.debug(`Player ${name} identified (in-game) with new socket ID: ${socket.id}`);
		playerNameToSocketId.set(name, socket.id);
		socketIdToPlayerName.set(socket.id, name);
		socket.data.playerName = name;
	});

	socket.on('keydown', (data) => {
		const playerName = socket.data.playerName;
		
		if (!playerName) {
			log.error(`Keydown from unidentified socket: ${socket.id}. Data: ${JSON.stringify(data)}`);
			return;
		}
		log.debug(`Key down: ${data.key} for player ${playerName}`);
		sendInput(playerName, data.key, 'keydown');
	});

	socket.on('keyup', (data) => {
		const playerName = socket.data.playerName;

		if (!playerName) {
			log.error(`Keyup from unidentified socket: ${socket.id}. Data: ${JSON.stringify(data)}`);
			return;
		}
		log.debug(`Key up: ${data.key} for player ${playerName}`);
		sendInput(playerName, data.key, 'keyup');
	});

	socket.on('acceptGame', async () => {
		const playerName = socket.data.playerName;

		if (!playerName) {
			log.error(`acceptGame from unidentified socket: ${socket.id}`);
			return;
		}
		log.debug(`Player ${playerName} accepted the game`);
		if (pendingRedirectAcceptances.has(playerName)) {
			const { resolve, cleanUp } = pendingRedirectAcceptances.get(playerName);
			pendingRedirectAcceptances.delete(playerName);
			resolve();
			if (cleanUp) cleanUp();
			log.debug(`Redirect acceptance for player ${playerName} resolved.`);
		} else {
			log.warn(`Player ${playerName} accepted game but no pending redirect acceptance was found.`);
		}
		log.debug(`Player ${playerName} status set to 'in-game' after accepting game.`);
		socket.emit('nameAccepted', { name: playerName });
	});

	socket.on('disconnect', async () => {
		const disconnectedPlayerName = socketIdToPlayerName.get(socket.id);
		if (disconnectedPlayerName)
		{
			playerNameToSocketId.delete(disconnectedPlayerName);
			socketIdToPlayerName.delete(socket.id);
			try
			{
				fetch(`http://matchmaking:3005/leave`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name: disconnectedPlayerName })
				});
			}
			catch (error) {}
			if (pendingRedirectAcceptances.has(disconnectedPlayerName)) {
				const { cleanUp } = pendingRedirectAcceptances.get(disconnectedPlayerName);
				pendingRedirectAcceptances.delete(disconnectedPlayerName);
				if (cleanUp) cleanUp();
				log.warn(`Redirect acceptance for player ${disconnectedPlayerName} rejected due to disconnect.`);
			}
			for (const [gameId, session] of gameSessions.entries()) {
				if (session.player1SocketId === socket.id || session.player2SocketId === socket.id) {
					log.debug(`Player ${disconnectedPlayerName} was in game ${gameId}. Notifying other player.`);
					const otherPlayerSocketId = session.player1SocketId === socket.id ? session.player2SocketId : session.player1SocketId;
					io.to(otherPlayerSocketId).emit('error', { message: `Your opponent ${disconnectedPlayerName} has disconnected.` });
					io.to(gameId).emit('gameOver', {
						type: await isInTournament(disconnectedPlayerName) ? 'tournament' : 'leave',
						winner: {
							name: session.player1Name === disconnectedPlayerName ? session.player2Name : session.player1Name
						},
						score: [0, 0]
					});
					clearInterval(session.intervalId);
					await stopGame(disconnectedPlayerName);
					gameSessions.delete(gameId);
				}
			}
			try
			{
				fetch(`http://database:3003/removeUser`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username: disconnectedPlayerName })
				});
			}
			catch (error) {}
			try
			{
				await fetch(`http://tournament:3007/leave`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name: disconnectedPlayerName })
				});
			}
			catch (error) {}
		}
		else
			log.debug(`Unidentified socket disconnected: ${socket.id}`);
	});
});
