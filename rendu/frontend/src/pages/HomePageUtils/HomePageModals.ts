import { navigate } from '../../router';
import { langBtn } from '../components/langBtn';
import type { Socket } from "socket.io-client";
import { enableJoining } from '../HomePage';

interface MutableBoolean {
    value: boolean;
}

/**
 * Modal for game found.
 */
export function showGameModal(players: string, socket: Socket, isGameStartedRef: MutableBoolean) {
    if (isGameStartedRef.value) {
        console.log('Game already started, skipping modal display.');
        return;
    }
    isGameStartedRef.value = true;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
    modalOverlay.id = 'gameFoundModalOverlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-gray-800 p-8 rounded-lg shadow-2xl text-center flex flex-col items-center gap-6';

    const title = document.createElement('h2');
    title.className = 'text-5xl font-extrabold text-gray-100 mb-4 tracking-wide';
    title.textContent = 'Game found!';
    modalContent.appendChild(title);

    const message = document.createElement('p');
    message.className = 'text-2xl text-gray-100 font-medium max-w-2xl';
    message.textContent = 'Thanks for waiting! Find your opponent and start the game between ' + players + '!';
    modalContent.appendChild(message);

    const joinLink = document.createElement('a');
    joinLink.setAttribute('data-route', '/game');
    joinLink.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    joinLink.textContent = 'Join the game';
    joinLink.addEventListener('click', (event) => {
        event.preventDefault();
        isGameStartedRef.value = false;
        modalOverlay.remove();
        socket.emit('acceptGame');
        navigate('/game');
        enableJoining();
    });

    modalContent.appendChild(joinLink);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

/**
 * Modal for waiting tournament.
 */
export function showTournamentModal(id: number, socket: Socket): HTMLDivElement {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
    modalOverlay.id = 'tournamentFoundModalOverlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-gray-800 p-8 rounded-lg shadow-2xl text-center flex flex-col items-center gap-6';

    const title = document.createElement('h2');
    title.className = 'text-5xl font-extrabold text-gray-100 mb-4 tracking-wide';
    title.textContent = 'Tournament';
    modalContent.appendChild(title);

    const message = document.createElement('p');
    message.className = 'text-2xl text-gray-100 font-medium max-w-2xl';
    message.textContent = `Tournament joined ! ID: ${id}. Please wait for other players to join.`;
    modalContent.appendChild(message);

    const quitButton = document.createElement('a');
    quitButton.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    quitButton.textContent = 'Leave';
    quitButton.addEventListener('click', () => {
        socket.disconnect();
        modalOverlay.remove();
        enableJoining();
    });
    modalContent.appendChild(quitButton);

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    return modalOverlay;
}

/**
 * Modal for waiting oponent to start game.
 */
export function showWaitingGameModal(socket: Socket): HTMLDivElement {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
    modalOverlay.id = 'waitingGameModalOverlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-gray-800 p-8 rounded-lg shadow-2xl text-center flex flex-col items-center gap-6';

    const title = document.createElement('h2');
    title.className = 'text-5xl font-extrabold text-gray-100 mb-4 tracking-wide';
    title.textContent = 'Game';
    modalContent.appendChild(title);

    const message = document.createElement('p');
    message.className = 'text-2xl text-gray-100 font-medium max-w-2xl';
    message.textContent = 'Waiting for opponent...';
    modalContent.appendChild(message);

    const quitButton = document.createElement('a');
    quitButton.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    quitButton.textContent = 'Leave';
    quitButton.addEventListener('click', () => {
        socket.disconnect();
        modalOverlay.remove();
        enableJoining();
    });
    modalContent.appendChild(quitButton);

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    return modalOverlay;
}

/**
 * Modal for language selection.
 */
export async function showLanguageSelectionModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'languageModal';
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-gray-800 p-6 rounded-lg shadow-2xl text-center flex flex-col items-center gap-4';
    modalOverlay.appendChild(modalContent);

    modalContent.appendChild(langBtn('en'));
    modalContent.appendChild(langBtn('fr'));
    modalContent.appendChild(langBtn('es'));

    const exitBtn = document.createElement('button');
    exitBtn.className = `text-blue-600 text-lg font-semibold transition-transform transform hover:scale-110`;
    exitBtn.textContent = 'exit';
    modalContent.appendChild(exitBtn);

    exitBtn.addEventListener('click', () => {
        modalOverlay.remove();
    });

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
    document.body.appendChild(modalOverlay);
}
