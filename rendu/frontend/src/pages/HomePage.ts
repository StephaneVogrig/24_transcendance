import { getSocket, getSocket2 } from '../websocket/websocket';
import { socketJoin, socketConnect, socketSetup } from '../websocket/socketSetRedirect.ts';
import { bottomBtn } from './components/bottomBtn';
import { joinButton } from './components/joinButton';
import { locale } from '../i18n';
import { BabylonGame } from '../3d/main3d.ts';

// import { createAuthButtonContainer } from '../auth/googleAuth';
import { createAuthButtonContainer } from '../auth/authStateChange';


import { showTournamentWaitingModal, showWaitingGameModal, showLanguageSelectionModal } from './HomePageUtils/HomePageModals';
import { navigate } from '../router';

import { createNavLink, sendRegister } from './HomePageUtils/HomePageUtils.ts';
import { modalMessage } from './components/modalMessage.ts';

let socket = getSocket();
let isWaitingForGame = false;

let playOnline: HTMLButtonElement;
let playAI: HTMLButtonElement;
let playLocal: HTMLButtonElement;
let playTournament: HTMLButtonElement;

export function disableJoining()
{
	isWaitingForGame = true;
	playOnline.disabled = true;
	playAI.disabled = true;
	playTournament.disabled = true;
	playLocal.disabled = true;
}

export function enableJoining() {
	isWaitingForGame = false;
    playOnline.disabled = false;
    playAI.disabled = false;
    playTournament.disabled = false;
    playLocal.disabled = false;
}

export const HomePage = (): HTMLElement => {
	const content = document.createElement('div');
	content.className = 'mx-auto max-w-7xl h-full grid grid-rows-[auto_1fr_auto] gap-8';

	// Navigation
	const nav = document.createElement('nav');
	nav.className = 'flex flex-col space-y-4';

	// Champ nom
	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = 'Pseudo...';
	input.maxLength = 25;
	input.className = 'mb-6 px-4 py-3 rounded-xl text-lg text-black w-50 border-4 border-cyan-400 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300 shadow-[0_0_10px_#00ffff]';
	input.addEventListener('input', () => {
		const isEmpty = (input.value.trim().length < 3 || input.value.length > 25) || isWaitingForGame;
		playOnline.disabled = isEmpty;
		playTournament.disabled = isEmpty;
	});
	input.addEventListener('keydown', (e) => {
		if (e.key === ' ') {
			e.preventDefault();
		}
	});

	nav.appendChild(input);

	const playDiv = document.createElement('div');
	playDiv.className = 'mt-16';
	nav.appendChild(playDiv);

    // Play text
	const playTitle = document.createElement('h2');
	playTitle.className = ' text-center text-3xl font-extrabold text-blue-400 mb-4 mt-8';
	playTitle.textContent = locale.play;
	playDiv.appendChild(playTitle);

	const playNav = document.createElement('div');
	playNav.className = 'grid gap-4 sm:grid-cols-3';
	playDiv.appendChild(playNav);

    // Button Online
	playOnline = joinButton(locale.online);
	playNav.appendChild(playOnline);

    // Button Local
	playLocal = joinButton(locale.local);
	playLocal.disabled = false;
	playNav.appendChild(playLocal);

    // Button Solo
	playAI = joinButton(locale.solo);
	playAI.disabled = false;
	playNav.appendChild(playAI);

    // Button Join next tournament
	playTournament = joinButton(locale.join_tournament);
	nav.appendChild(playTournament);

    // Button Tournament list
	nav.appendChild(createNavLink(locale.matchDisplay, '/MatchDisplay'));

	// Button Language
	const languageButton = createNavLink(locale.language, '/');
	languageButton.addEventListener('click', showLanguageSelectionModal);
	nav.appendChild(languageButton);

	content.appendChild(nav);

	// Button Login withGoogle/Profile
	// affiche  -> GoogleConnect si pas user connecté
	// 			-> Profil si user
	const authContainer = createAuthButtonContainer();
	nav.appendChild(authContainer);

	// about
	content.appendChild(bottomBtn(locale.about, '/about'));

	// Buton Online listener
	playOnline.addEventListener('click', async () => {
        try {
            const name = input.value.trim();

            await socketSetup(socket, 'online', name);
            await sendRegister(`matchmaking/join`, { name: name });
			disableJoining();
		    showWaitingGameModal(socket);
		} catch (error) {
			console.info((error as Error).message);
			socket.off('redirect');
            modalMessage(locale.Sorry, `${(error as Error).message}`);
		}
	});

	// Buton Local listener
	playLocal.addEventListener('click', async () => {
	    try {
            // setup socket2 -----------------------
            const socket2 = getSocket2();
            await socketConnect(socket2);
            BabylonGame.getInstance().setSocket2(socket2);
            socket2.once('redirect', (data: { gameId: string, playerName: string }) => {
                socket2.emit('acceptGame');
            });
            await socketJoin(socket2, socket2.id as string);

            await socketSetup(socket, 'local');
            await sendRegister(`game/start`, { player1: socket.id, player2: socket2.id, maxScore: 5 });
			disableJoining();
		} catch (error) {
			console.info(`local: ${(error as Error).message}`);
			socket.off('redirect');
            modalMessage(locale.Sorry, `${(error as Error).message}`);
		}
	});

	// Buton Solo listener
	playAI.addEventListener('click', async () => {
        try {
            await socketSetup(socket, 'solo');
            await sendRegister('ai/create', { name: socket.id });
			disableJoining();
		} catch (error) {
			console.info(`solo: ${(error as Error).message}`);
			socket.off('redirect');
            modalMessage(locale.Sorry, `${(error as Error).message}`);
		}
	});

	// Buton Join tournament listener
	playTournament.addEventListener('click', async () => {
		try {
            const name = input.value.trim();
            await socketSetup(socket, 'tournament', name);
            const tournament = await sendRegister('tournament/join', { name: name });
			disableJoining();
			showTournamentWaitingModal(tournament.id, socket);
		} catch (error) {
			console.info(`${(error as Error).message}`);
			socket.off('redirect');
            modalMessage(locale.Sorry, `${(error as Error).message}`);
		}
	});

	return content;
}
