import { io } from "socket.io-client";
import { startGame } from '../pages/ChoiceGamePage';

export class WebSocketBridge {
    constructor() {
    }

    async init(name: string) {
        const socket = io(`http://${window.location.hostname}:3000`, {
            path: '/api/websocket/my-websocket/'
        });
        socket.on('connect', () => {
            socket.emit('message', 'Hello server from Socket.IO client!');
        });

        socket.emit('join', { name: name });
        socket.on('redirect', (data: { gameId: string }) => {
            console.log(`Redirecting to game ${data.gameId}`);
            startGame();
        });
    }
}