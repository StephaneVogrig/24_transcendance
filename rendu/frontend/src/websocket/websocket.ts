import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;
let playerName: string | null = null;

export const getSocket = (): Socket => {
    if (!socketInstance || !socketInstance.connected) {
        if (!socketInstance) {
            socketInstance = io(`http://${window.location.hostname}:3000`, {
                path: '/api/websocket/my-websocket/'
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

export const setPlayerName = (name: string) => {
    playerName = name;
    if (socketInstance && socketInstance.connected)
        socketInstance.emit('identify_player', { name: playerName });
};

export const getPlayerName = (): string | null => {
    return playerName;
};
