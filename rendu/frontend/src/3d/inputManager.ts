import { Socket } from "socket.io-client";
import { teamPing, updateBallAndPlatforms, setCameraPosition } from './scenes/sceneGame';
import { getSocket, getPlayerName } from '../websocket/websocket';
import { gameStatusUpdate, updateScores, setPlayerName, gameOver, gameOverDefault, gameOverTournament } from '../pages/GamePage';
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

		let gameStatus = '';

		this.socket.on('gameState', (data) => {
			if (!data || !data.ball || !data.player1?.paddle || !data.player2?.paddle || !data.score || !data.gameStatus) {
				console.warn(`socket.on gameState, invalid data.`, data);
				return;
			}
			const ballPos = {
				x: data.ball._x / 2.5,
				y: 0,
				z: data.ball._y / 2.5
			};
			const platform1Pos = {
				x: data.player1.paddle._x / 2.5 + 0.5,
				y: 0,
				z: data.player1.paddle._y / 2.5
			};
			const platform2Pos = {
				x: data.player2.paddle._x / 2.5 - 0.5,
				y: 0,
				z: data.player2.paddle._y / 2.5
			};
			updateBallAndPlatforms(ballPos, platform1Pos, platform2Pos);
			updateScores(data.score[0], data.score[1]);
			if (gameStatus != data.gameStatus || data.gameStatus === 'waiting') {
				gameStatus = data.gameStatus;
				gameStatusUpdate(gameStatus);
			}
		});

		this.socket.on('gameOver', (data: { type : string, winner: { name: string, score: number }, score: [number, number] }) => {
			if (data.type === 'default')
				gameOverDefault(data.winner.name, data.score);
			if (data.type === 'leave')
				gameOver();
			if (data.type === 'tournament')
				gameOverTournament(data.winner.name, data.score);
			if (data.type !== 'tournament')
			{
				if (this.socket2)
					this.socket2.disconnect();
				this.socket.disconnect();
			}
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
		window.addEventListener("keyup", (event) => {
			if (event.code === "Digit1" || event.code === "Numpad1")
				setCameraPosition(Math.PI, 2*Math.PI/5, 50);
			else if (event.code === "Digit2" || event.code === "Numpad2")
				setCameraPosition(Math.PI/2, Math.PI, 0);
		});
	}
}
