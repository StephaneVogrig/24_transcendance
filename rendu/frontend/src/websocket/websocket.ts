import { io, Socket } from "socket.io-client";
import { BASE_URL } from '../config.ts';

let socketInstance: Socket | null = null;

let playerName: string | null = null;
let playerSocket2: Socket | null = null;

let socket2Instance: Socket | null = null;
let socket2Id: string | undefined = undefined;

function createSocket(): Socket {
    const newSocket = io(`${BASE_URL}`, {
        path: '/api/websocket/my-websocket/',
        forceNew: true,
        autoConnect: false,
        reconnection: false,
    });
    newSocket.on('connect', () => {
        socket2Id = newSocket?.id;
        console.log(`socket connected (${newSocket?.id})`);
    });
    newSocket.on('disconnect', () => {
        console.log(`socket disconnected (${socket2Id})`);
        socket2Id = undefined;
    });
    return newSocket;
}

export const getSocket = (): Socket => {
    if (!socketInstance) {
        socketInstance = createSocket();
    }
    return socketInstance;
};

export const getSocket2 = (): Socket => {
    if (!socket2Instance) {
        socket2Instance = createSocket();
    }
    return socket2Instance;
};

export const setSocket2 = (Socket: Socket) => {
    playerSocket2 = Socket;
};

export const setPlayerName = (name: string) => {
    playerName = name;
    if (socketInstance && socketInstance.connected)
        socketInstance.emit('identify_player', { name: playerName });
};

export const getPlayerName = (): string | null => {
    return playerName;
};
