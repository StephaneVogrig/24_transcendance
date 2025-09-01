import { navigate } from '../../router';
import { langBtn } from '../components/langBtn';
import type { Socket } from "socket.io-client";
import { enableJoining } from '../HomePage';
import { locale } from '../../i18n';

/**
 * Modal for game found.
 */
export function showGameFoundModal(players: string, socket: Socket) {
    const gameFoundModalOverlay = document.getElementById('gameFoundModalOverlay');
    if (gameFoundModalOverlay)
        gameFoundModalOverlay.remove();

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
    modalOverlay.id = 'gameFoundModalOverlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-gray-800 p-8 rounded-lg shadow-2xl text-center flex flex-col items-center gap-6';

    const title = document.createElement('h2');
    title.className = 'text-5xl font-extrabold text-gray-100 mb-4 tracking-wide';
    title.textContent = locale.game_found;
    modalContent.appendChild(title);

    const message = document.createElement('p');
    message.className = 'text-2xl text-gray-100 font-medium max-w-2xl';
    message.textContent = locale.thanks_for_waiting + ' ' + players + '!';
    modalContent.appendChild(message);

    const joinLink = document.createElement('button');
    joinLink.setAttribute('data-route', '/game');
    joinLink.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    joinLink.textContent = locale.join_game;
    joinLink.addEventListener('click', (event) => {
        event.preventDefault();
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
export function showTournamentWaitingModal(id: number, socket: Socket): HTMLDivElement {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
    modalOverlay.id = 'waitingModal';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-gray-800 p-8 rounded-lg shadow-2xl text-center flex flex-col items-center gap-6';

    const title = document.createElement('h2');
    title.className = 'text-5xl font-extrabold text-gray-100 mb-4 tracking-wide';
    title.textContent = 'Tournament';
    modalContent.appendChild(title);

    const message = document.createElement('p');
    message.className = 'text-2xl text-gray-100 font-medium max-w-2xl';
    message.textContent = `${locale.tournament_joined} ID: ${id}. ${locale.please_wait}`;
    modalContent.appendChild(message);

    const quitButton = document.createElement('button');
    quitButton.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    quitButton.textContent = locale.leave;
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
    modalOverlay.id = 'waitingModal';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-gray-800 p-8 rounded-lg shadow-2xl text-center flex flex-col items-center gap-6';

    const title = document.createElement('h2');
    title.className = 'text-5xl font-extrabold text-gray-100 mb-4 tracking-wide';
    title.textContent = locale.game;
    modalContent.appendChild(title);

    const message = document.createElement('p');
    message.className = 'text-2xl text-gray-100 font-medium max-w-2xl';
    message.textContent = locale.waiting_opponent;
    modalContent.appendChild(message);

    const quitButton = document.createElement('button');
    quitButton.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    quitButton.textContent = locale.leave;
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
    exitBtn.textContent = locale.exit;
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
