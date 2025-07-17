import io from 'socket.io-client';

let socket = null;

export async function createAI(name)
{
	try {
		if (!name)
			throw new Error("Player needed for call to createAI");

		const player = name;
		const playerAI = name + "AI";
		let ballPos = null;
		let ballSpeed = null;
		let paddlePos = null;

		const socketConnection = new Promise((resolve, reject) => {
			socket = io('http://websocket:3008', {
				path: '/my-websocket/'
			});

			socket.on('connect', () => {
				console.log(`AI socket connected for ${playerAI} with ID: ${socket.id}`);
				socket.emit('identify_player', { name: playerAI });
				resolve(socket);
			});

			socket.on('connect_error', (err) => {
				console.error(`AI socket connection error for ${playerAI}: ${err.message}`);
				reject(new Error(`Socket connection error: ${err.message}`));
			});

			socket.on('IAState', (data) => {
				ballPos = data.ball;
				ballSpeed = data.ballspeed;
				paddlePos = data.platform;
			});
		})

		await socketConnection;

		let gameOn = true;

		const response = await fetch(`http://game:3004/api/game/start`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ player1: player, player2: playerAI, maxScore: 5 })
		});

		socket.on('gameDefeatOver', () => {
			gameOn = false;
		})

		if (!response.ok) {
			const err = await response.text();
			throw new Error(err);
		}

		socket.emit('join', { name: playerAI });
		const offset = 2.1;

		await new Promise(r => setTimeout(r, 1000));
		socket.emit('acceptGame');
		while (gameOn)
		{
			const goalZ = ballPos.z;
			let timeoutOffset = 0;
			if (paddlePos.z < goalZ - offset) {
				socket.emit('keydown', { playerName: playerAI, key: 'ArrowLeft' });
				while (paddlePos.z < goalZ - offset && timeoutOffset < 1000)
				{
					timeoutOffset += 10;
					await new Promise(r => setTimeout(r, 10));
				}
				socket.emit('keyup', { playerName: playerAI, key: 'ArrowLeft' });
			}
			else if (paddlePos.z > goalZ + offset) {
				socket.emit('keydown', { playerName: playerAI, key: 'ArrowRight' });
				while (paddlePos.z > goalZ + offset && timeoutOffset < 1000)
				{
					timeoutOffset += 10;
					await new Promise(r => setTimeout(r, 10));
				}
				socket.emit('keyup', { playerName: playerAI, key: 'ArrowRight' });
			}
			await new Promise(r => setTimeout(r, 1000 - timeoutOffset));
		}
	} catch (error) {
		console.log(`Error while starting match between AI and ${player}: ${error.message}.`);
	}
}
