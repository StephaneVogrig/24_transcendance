import { Socket } from "socket.io-client";
import { updateBallAndPlatforms } from './scenes/sceneGame';
import { updateScores, gameOver } from '../pages/GamePage';
import { teamPing } from './scenes/sceneGame';
import { gameStatusUpdate } from '../pages/GamePage';
import { getSocket, getPlayerName } from '../websocket/websocket';
import { navigate } from '../router';


export class InputManager {

	private isLeftPressed = false;
	private isRightPressed = false;
    private socket: Socket;

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
			navigate('/choice-game');
		});
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
		});

		this.socket.on('teamPing', (data: { team: string }) => {
			// console.debug(`Received team ping for team: ${data.team}`);
			if (data.team === 'left') {
				teamPing(-1);
			} else if (data.team === 'right') {
				teamPing(1);
			}
		});

		let gameStatus = '';

		this.socket.on('gameStatusUpdate', (data: { gameStatus: string }) => {
			if (gameStatus != data.gameStatus || data.gameStatus === 'waiting') {
				gameStatus = data.gameStatus;
				gameStatusUpdate(gameStatus);
			}
		});

		window.addEventListener("popstate", (event) => {
			if (this.socket) {
				this.socket.disconnect();
				// console.log("Popstate event triggered:", event);
			}
		});
		window.addEventListener("keydown", (event) => {
			if (event.code === "ArrowLeft" && !this.isLeftPressed) {
				// console.log("Left arrow key pressed");
				this.isLeftPressed = true;
				this.socket.emit('keydown', { key: 'ArrowLeft' });
			}
			if (event.code === "ArrowRight" && !this.isRightPressed) {
				// console.log("Right arrow key pressed");
				this.isRightPressed = true;
				this.socket.emit('keydown', { key: 'ArrowRight' });
			}
		});
		window.addEventListener("keyup", (event) => {
			if (event.code === "ArrowLeft") {
				// console.log("Left arrow key released");
				this.socket.emit('keyup', { key: 'ArrowLeft' });
				this.isLeftPressed = false;
			}
			if (event.code === "ArrowRight") {
				// console.log("Right arrow key released");
				this.socket.emit('keyup', { key: 'ArrowRight' });
				this.isRightPressed = false;
		  }
		});
	}
}
