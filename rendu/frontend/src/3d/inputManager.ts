import { io } from "socket.io-client";
import { updateBallAndPlatforms } from './scenes/scene1';
import { updateScores } from '../pages/GamePage';
import { teamPing } from './scenes/scene1';


export class InputManager {

	private isLeftPressed = false;
	private isRightPressed = false;

	constructor() {
		this.init();
	}

	private init() {
		const socket = io(`http://${window.location.hostname}:3000`, {
		path: '/api/websocket/my-websocket/'
	  	});
		socket.on('connect', () => {
			console.log('Connecté au serveur Socket.IO !');
			socket.emit('message', 'Hello server from Socket.IO client!');
		});
		socket.on('message', (data) => {
			console.log(`Message from server: ${data}`);
		});

		socket.on('updatePositions', (data: { ball: { x: number, y: number, z: number }, platform1: { x: number, y: number, z: number }, platform2: { x: number, y: number, z: number } }) => {
			console.log('Received position update:', data);
			updateBallAndPlatforms(data.ball, data.platform1, data.platform2);
		});
		socket.on('scoreUpdate', (data: { player1Score: number, player2Score: number }) => {
			console.log('Score update received:', data);
			updateScores(data.player1Score, data.player2Score);
		});

		socket.on('teamPing', () => {
			console.debug(`Received team ping for team`);
			teamPing();
		});

		window.addEventListener("keydown", (event) => {
			if (event.code === "ArrowLeft" && !this.isLeftPressed) {
				console.log("Left arrow key pressed");
				this.isLeftPressed = true;
				socket.emit('keydown', { key: 'ArrowLeft' });
			}
			if (event.code === "ArrowRight" && !this.isRightPressed) {
				console.log("Right arrow key pressed");
				this.isRightPressed = true;
				socket.emit('keydown', { key: 'ArrowRight' });
			}
		});
		window.addEventListener("keyup", (event) => {
			if (event.code === "ArrowLeft") {
				console.log("Left arrow key released");
				socket.emit('keyup', { key: 'ArrowLeft' });
				this.isLeftPressed = false;
			}
			if (event.code === "ArrowRight") {
				console.log("Right arrow key released");
				socket.emit('keyup', { key: 'ArrowRight' });
				this.isRightPressed = false;
		  }
		});
	}
}
