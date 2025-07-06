import { io } from "socket.io-client";
import { updateBallAndPlatforms } from './scenes/scene1';
import { updateScores, gameOver } from '../pages/GamePage';
import { teamPing } from './scenes/scene1';


export class InputManager {

	private isLeftPressed = false;
	private isRightPressed = false;

	constructor() {
		this.init();
	}

	private init() {
		// const socket = io(`http://${window.location.hostname}:3000`, {
		path: '/api/websocket/my-websocket/'
	  	});
		socket.on('connect', () => {
			// console.log('Connecté au serveur Socket.IO !');
			socket.emit('message', 'Hello server from Socket.IO client!');
		});
		socket.on(_data) => {
			// console.log(_data}`);
		});

		socket.on(_data: { ball: { x: number, y: number, z: number }, platform1: { x: number, y: number, z: number }, platform2: { x: number, y: number, z: number } }) => {
			// console.log(_data);
			updateBallAndPlatforms(_data.platform2);
		});
		socket.on(_data: { player1Score: number, player2Score: number }) => {
			// console.log(_data);
			updateScores(_data.player2Score);
		});
		socket.on(_data) => {
			// console.log(_data);
			gameOver();
		});

		socket.on(_teamPing', () => {
			// console.debug(_team`);
			teamPing();
		});

		window.addEventListener(_event) => {
			if (socket) {
				socket.disconnect();
				console.log(_event);
			}
		});
		window.addEventListener(_event) => {
			if (_event.code === "ArrowLeft" && !this.isLeftPressed) {
				// console.log("Left arrow key pressed");
				this.isLeftPressed = true;
				socket.emit('keydown', { key: 'ArrowLeft' });
			}
			if (_event.code === "ArrowRight" && !this.isRightPressed) {
				// console.log("Right arrow key pressed");
				this.isRightPressed = true;
				socket.emit('keydown', { key: 'ArrowRight' });
			}
		});
		window.addEventListener(_event) => {
			if (_event.code === "ArrowLeft") {
				// console.log("Left arrow key released");
				socket.emit('keyup', { key: 'ArrowLeft' });
				this.isLeftPressed = false;
			}
			if (_event.code === "ArrowRight") {
				// console.log("Right arrow key released");
				socket.emit('keyup', { key: 'ArrowRight' });
				this.isRightPressed = false;
		  }
		});
	}
}
