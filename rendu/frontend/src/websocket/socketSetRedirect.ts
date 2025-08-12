import type { Socket } from "socket.io-client";
import { showGameFoundModal } from '../pages/HomePageUtils/HomePageModals';
import { locale } from '../i18n';

export function socketSetRedirect(socket: Socket, gameType: string) {
    socket.off('redirect');
    socket.on('redirect', (data: { gameId: string, playerName: string }) => {
        console.debug(`Redirecting to game ${data.gameId} for player ${data.playerName}`);
        const modal = document.getElementById('waitingModal') as HTMLDivElement;
        if (modal)
            modal.remove();
        let titleGame: string;
        if (gameType === 'solo')
            titleGame = 'you and ai'
        else if (gameType === 'local')
            titleGame = 'player left and player right'
        else
            titleGame = data.gameId;
        showGameFoundModal(titleGame, socket);
    });
    console.debug(`'redirect' event registerd to socket`);
}

export function socketJoin(socket: Socket, name: string, timeout = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(locale.SERVER_TIMEOUT));
        }, timeout);
        socket.emit('join', { name }, (response: {success: boolean, error: string}) => {
            clearTimeout(timeoutId);
            if (response && response.success){
                console.debug('Socket joined');
                resolve(response);
            }
            else {
                if (response && response.error)
                    reject(new Error(locale[response.error]));
                else
                    reject(new Error(locale.INVALID_SERVER_RESPONSE));
            }
        });
    });
}

export async function socketConnect(socket: Socket) {
    await new Promise<void>((resolve) => {
        if (socket.connected)
            // no need to disconnect ????
            resolve();
        else
        {
            socket.once('connect', () => {
                resolve();
            });
            socket.connect();
        }
    });
}

export async function socketSetup(socket: Socket, gameType: string, name?: string) {
        console.debug(`socket setting up for ${gameType}`);

        await socketConnect(socket);
        const playerName = name ?? socket.id ?? (() => {
            // no need to disconnect ????
            throw new Error('Unable to determine player name: socket.id is undefined');
        })();
        socketSetRedirect(socket, gameType);
        await socketJoin(socket, playerName);
}
