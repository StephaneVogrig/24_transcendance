import io from 'socket.io-client';

let socket = null;

function calculateY(speed, pos, paddlePos)
{
	let y = 0;
	let dx = paddlePos.x - pos.x;
	let dy = dx * speed.y / speed.x;
	y = pos.y + dy;
	return y;
}

function calculateYgoal(ballSpeed, ballPos, paddlePos) { 
	let y_goal = 0;
	let speed = { x: ballSpeed.x, y: ballSpeed.y };
	let pos = { x: ballPos.x, y: ballPos.y };
	if (ballSpeed.x < 0)
	{
		// console.log(`ballspeed < 0 -----------------------`);

		y_goal = calculateY(speed, pos, paddlePos);
		console.log(`> y_goal: ${y_goal}`);
		while (y_goal < -25 || y_goal > 25)
		{
			if (speed.y = 0)
				break;

			let ywall = speed.y > 0 ? 25 : -25;

			pos.x += (ywall - pos.y) * speed.x / speed.y;
			pos.y = ywall;
			speed.y = -speed.y;
			y_goal = calculateY(speed, pos, paddlePos);
		}
	}
	return y_goal;
}

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
		let gameOn = true;

		await new Promise((resolve, reject) => {
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
				paddlePos = data.paddle;
			});

			socket.on('gameDefeatOver', () => {
				gameOn = false;
			});

		})

		const response = await fetch(`http://game:3004/api/game/start`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ player1: player, player2: playerAI, maxScore: 5 })
		});

		if (!response.ok) {
			const err = await response.text();
			throw new Error(err);
		}

		socket.emit('join', { name: playerAI });

		await new Promise(r => setTimeout(r, 1000));
		socket.emit('acceptGame');

		while (gameOn)
		{
			let y_goal = calculateYgoal(ballSpeed, ballPos, paddlePos);

			// console.log(`y_goal: ${y_goal}`);
			// console.log(`paddlePos.y: ${paddlePos.y}`);
			let timeoutOffset = 0;
			const delay = 1000;
			const offset = 2.1;
			if (paddlePos.y < y_goal - offset) {
				socket.emit('keydown', { playerName: playerAI, key: 'ArrowLeft' });
				while (paddlePos.y < y_goal - offset && timeoutOffset < delay)
				{
					timeoutOffset += 10;
					await new Promise(r => setTimeout(r, 10));
				}
				socket.emit('keyup', { playerName: playerAI, key: 'ArrowLeft' });
			}
			else if (paddlePos.y > y_goal + offset) {
				socket.emit('keydown', { playerName: playerAI, key: 'ArrowRight' });
				while (paddlePos.y > y_goal + offset && timeoutOffset < delay)
				{
					timeoutOffset += 10;
					await new Promise(r => setTimeout(r, 10));
				}
				socket.emit('keyup', { playerName: playerAI, key: 'ArrowRight' });
			}
			await new Promise(r => setTimeout(r, delay - timeoutOffset));
		}

	} catch (error) {
		console.log(`Error while starting match between AI and ${player}: ${error.message}.`);
	}
}
