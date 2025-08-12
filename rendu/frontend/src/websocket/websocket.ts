import { io, Socket } from "socket.io-client";
import { BASE_URL } from '../config.ts';

let socketInstance: Socket | null = null;
let socketId: string | undefined = undefined;

let playerName: string | null = null;
let playerSocket2: Socket | null = null;


let socket2Instance: Socket | null = null;
let socket2Id: string | undefined = undefined;

export const getSocket = (): Socket => {
    if (!socketInstance) {
        if (!socketInstance) {
            socketInstance = io(`${BASE_URL}`, {
                path: '/api/websocket/my-websocket/',
				forceNew: true,
                autoConnect: false,
                reconnection: false,
            });
            socketInstance.on('connect', () => {
                socketId = socketInstance?.id;
                console.log(`socket connected (${socketInstance?.id})`);
            });
            socketInstance.on('disconnect', () => {
                console.log(`socket disconnected (${socketId})`);
                socketId = undefined;
            });
        }
    }
    return socketInstance;
};

export const getSocket2 = (): Socket => {
    if (!socket2Instance) {
        if (!socket2Instance) {
            socket2Instance = io(`${BASE_URL}`, {
                path: '/api/websocket/my-websocket/',
				forceNew: true,
                autoConnect: false,
                reconnection: false,
            });
            socket2Instance.on('connect', () => {
                socket2Id = socket2Instance?.id;
                console.log(`socket connected (${socket2Instance?.id})`);
            });
            socket2Instance.on('disconnect', () => {
                console.log(`socket disconnected (${socket2Id})`);
                socket2Id = undefined;
            });
        }
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
