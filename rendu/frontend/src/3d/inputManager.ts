import { Socket } from "socket.io-client";
import { updateBallAndPlatforms } from './scenes/sceneGame';
import { updateScores, gameOver } from '../pages/GamePage';
import { teamPing } from './scenes/sceneGame';
import { gameStatusUpdate } from '../pages/GamePage';
import { getSocket, getPlayerName } from '../websocket/websocket';
import { gameDefeatOver } from '../pages/GamePage';
import { setPlayerName } from '../pages/GamePage';
import { navigate } from '../router';

export class InputManager {

	private isLeftPressed = false;
	private isRightPressed = false;
	private isLeftPressed2 = false;
	private isRightPressed2 = false;
    private socket: Socket;
    private socket2: Socket | undefined;

	constructor() {
		console.log(`Restoring socket for getPlayerName(): ${getPlayerName()}`);
		this.socket = getSocket();
		this.init();
		console.log("InputManager initialized");
	}

	public setHomeLink(homeLink: HTMLAnchorElement) {
		homeLink.addEventListener('click', (event) => {
			event.preventDefault();
			if (this.socket) {
				this.socket.disconnect();
			}
			navigate('/');
		});
	}

	public setSocket2(socket: Socket) {
		this.socket2 = socket;
		if (this.socket2)
		{
			window.addEventListener("keydown", (event) => {
				if ((event.code === "KeyA" || event.code === "KeyW") && !this.isLeftPressed2) {
					this.isLeftPressed2 = true;
					if (this.socket2)
						this.socket2.emit('keydown', { key: 'ArrowLeft' });
				}
				if ((event.code === "KeyD" || event.code === "KeyS") && !this.isRightPressed2) {
					this.isRightPressed2 = true;
					if (this.socket2)
						this.socket2.emit('keydown', { key: 'ArrowRight' });
				}
			});
			window.addEventListener("keyup", (event) => {
				if (event.code === "KeyA" || event.code === "KeyW") {
					if (this.socket2)
						this.socket2.emit('keyup', { key: 'ArrowLeft' });
					this.isLeftPressed2 = false;
				}
				if (event.code === "KeyD" || event.code === "KeyS") {
					if (this.socket2)
						this.socket2.emit('keyup', { key: 'ArrowRight' });
					this.isRightPressed2 = false;
			}
			});
		}
	}

	private init() {
		// this.socket.on('message', (data) => {
		// 	console.log(`Message from server: ${data}`);
		// });

		this.socket.on('updatePositions', (data: { ball: { x: number, y: number, z: number }, platform1: { x: number, y: number, z: number }, platform2: { x: number, y: number, z: number } }) => {
			// console.log('Received position update:', data);
			updateBallAndPlatforms(data.ball, data.platform1, data.platform2);
		});
		this.socket.on('scoreUpdate', (data: { player1Score: number, player2Score: number }) => {
			// console.log('Score update received:', data);
			updateScores(data.player1Score, data.player2Score);
		});
		this.socket.on('gameOver', () => {
			gameOver();
			if (this.socket2)
				this.socket2.disconnect();
			this.socket.disconnect();
		});

		this.socket.on('gameDefeatOver', (data: { winner: { name: string, score: number }, score: [number, number] }) => {
			console.log('Game defeat over received:', data);
			gameDefeatOver(data.winner.name, data.score);
			if (this.socket2)
				this.socket2.disconnect();
			this.socket.disconnect();
		});

		this.socket.on('teamPing', (data: { team: string }) => {
			// console.debug(`Received team ping for team: ${data.team}`);
			if (data.team === 'left') {
				teamPing(-1);
			} else if (data.team === 'right') {
				teamPing(1);
			}
			// setPlayerName(data.name);
		});

		this.socket.on('nameAccepted', (data: { name: string }) => {
			console.log(`Name accepted: ${data.name}`);
			setPlayerName(data.name);
		});

		let gameStatus = '';

		this.socket.on('gameStatusUpdate', (data: { gameStatus: string }) => {
			if (gameStatus != data.gameStatus || data.gameStatus === 'waiting') {
				gameStatus = data.gameStatus;
				gameStatusUpdate(gameStatus);
			}
		});

		window.addEventListener("popstate", () => {
			if (this.socket) {
				this.socket.disconnect();
				// console.log("Popstate event triggered:", event);
			}
		});

		// Player 1
		window.addEventListener("keydown", (event) => {
			if ((event.code === "ArrowLeft" || event.code === "ArrowUp") && !this.isLeftPressed) {
				this.isLeftPressed = true;
				this.socket.emit('keydown', { key: 'ArrowLeft' });
			}
			if ((event.code === "ArrowRight" || event.code === "ArrowDown") && !this.isRightPressed) {
				this.isRightPressed = true;
				this.socket.emit('keydown', { key: 'ArrowRight' });
			}
		});
		window.addEventListener("keyup", (event) => {
			if (event.code === "ArrowLeft" || event.code === "ArrowUp") {
				this.socket.emit('keyup', { key: 'ArrowLeft' });
				this.isLeftPressed = false;
			}
			if (event.code === "ArrowRight" || event.code === "ArrowDown") {
				this.socket.emit('keyup', { key: 'ArrowRight' });
				this.isRightPressed = false;
		  }
		});
	}
}
