import { io, Socket } from "socket.io-client";
import { BASE_URL } from '../config.ts';

let socketInstance: Socket | null = null;
let playerName: string | null = null;
let playerSocket2: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socketInstance || !socketInstance.connected) {
        if (!socketInstance) {
            socketInstance = io(`${BASE_URL}`, {
                path: '/api/websocket/my-websocket/',
				forceNew: true
            });
        }
        if (!socketInstance.connected) {
            socketInstance.connect();
            socketInstance.on('connect', () => {
                console.log('Central Socket: Connecté au serveur Socket.IO !');
                if (playerName)
                    socketInstance!.emit('identify_player', { name: playerName });
            });
        }

        socketInstance.on('disconnect', () => {
            console.log('Central Socket: Déconnecté du serveur Socket.IO !');
        });
    }
    return socketInstance;
};

export const setSocket2 = (Socket: Socket) => {
    playerSocket2 = Socket;
};

export const setPlayerName = (name: string) => {
    playerName = name;
    if (socketInstance && socketInstance.connected)
        socketInstance.emit('identify_player', { name: playerName });
};

export const getSocket2 = (): Socket | null => {
    return playerSocket2;
};

export const getPlayerName = (): string | null => {
    return playerName;
};

export function socketJoin(socket: Socket, name: string, timeout = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Le serveur ne répond pas'));
        }, timeout);

        socket.emit('join', { name }, (response: {success: boolean, message: string}) => {
            clearTimeout(timeoutId);
            if (response && response.success) {
                resolve(response);
            } else {
                reject(new Error(response.message || 'Connexion error'));
            }
        });
    });
}
