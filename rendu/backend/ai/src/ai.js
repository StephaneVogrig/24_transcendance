import io from 'socket.io-client';
import { deleteAI } from './iaManager.js';

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
		// console.log(`> y_goal: ${y_goal}`);
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

export class AI {
	constructor(name) {
		console.log(`Creating AI instance for player: ${name}`);
		this.player = name;
		this.playerAI = name + "AI";
		this.socket = null;
		this.ballPos = null;
		this.ballSpeed = null;
		this.paddlePos = null;
		this.gameOn = true;
	}

	async start() {
		console.log(`start AI: ${this.playerAI}`);
		try {
			if (!this.player)
				throw new Error("Player needed for call to start");

			await new Promise((resolve, reject) => {
				this.socket = io('http://websocket:3008', {
					path: '/my-websocket/'
				});

				this.socket.on('connect', () => {
					// console.log(`AI socket connected for ${this.playerAI} with ID: ${this.socket.id}`);
					this.socket.emit('identify_player', { name: this.playerAI });
					resolve(this.socket);
				});

				this.socket.on('connect_error', (err) => {
					console.error(`AI socket connection error for ${this.playerAI}: ${err.message}`);
					reject(new Error(`Socket connection error: ${err.message}`));
				});

				this.socket.on('IAState', (data) => {
					this.ballPos = data.ball;
					this.ballSpeed = data.ballspeed;
					this.paddlePos = data.paddle;
				});

				this.socket.on('gameOverDefault', () => {
					this.gameOn = false;
				});

			})

			const response = await fetch(`http://game:3004/start`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ player1: this.player, player2: this.playerAI, maxScore: 5 })
			});

			if (!response.ok) {
				const err = await response.text();
				throw new Error(err);
			}

			this.socket.emit('join', { name: this.playerAI });

			await new Promise(r => setTimeout(r, 1000));
			this.socket.emit('acceptGame');

			while (this.gameOn)
			{
				let y_goal = calculateYgoal(this.ballSpeed, this.ballPos, this.paddlePos);

				// console.log(`y_goal: ${y_goal}`);
				// console.log(`paddlePos.y: ${paddlePos.y}`);
				let timeoutOffset = 0;
				const delay = 1000;
				const offset = 2.1;
				if (this.paddlePos.y < y_goal - offset) {
					this.socket.emit('keydown', { playerName: this.playerAI, key: 'ArrowLeft' });
					while (this.paddlePos.y < y_goal - offset && timeoutOffset < delay)
					{
						timeoutOffset += 10;
						await new Promise(r => setTimeout(r, 10));
					}
					this.socket.emit('keyup', { playerName: this.playerAI, key: 'ArrowLeft' });
				}
				else if (this.paddlePos.y > y_goal + offset) {
					this.socket.emit('keydown', { playerName: this.playerAI, key: 'ArrowRight' });
					while (this.paddlePos.y > y_goal + offset && timeoutOffset < delay)
					{
						timeoutOffset += 10;
						await new Promise(r => setTimeout(r, 10));
					}
					this.socket.emit('keyup', { playerName: this.playerAI, key: 'ArrowRight' });
				}
				await new Promise(r => setTimeout(r, delay - timeoutOffset));
			}
			deleteAI(this.playerAI);

		} catch (error) {
			console.log(`Error while starting match between AI and ${this.player}: ${error.message}.`);
		}
	}

	async stopAI() {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
		this.gameOn = false;
	}
}
