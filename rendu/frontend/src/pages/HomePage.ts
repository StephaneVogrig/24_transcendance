import { getSocket, setPlayerName } from '../websocket/websocket';
import { bottomBtn } from './components/bottomBtn';
import { joinButton } from './components/joinButton';
import { locale } from '../i18n';
import { io, Socket } from "socket.io-client";
import { BabylonGame } from '../3d/main3d.ts';

import { authGoogleButton } from '../auth/auth0Service';

import { registerUsernameToDb, deleteUsernameFromDb} from './HomePageUtils/dbServices.ts';
import { showGameModal, showTournamentModal, showWaitingGameModal, showLanguageSelectionModal } from './HomePageUtils/HomePageModals';
import { API_BASE_URL, BASE_URL } from '../config.ts';
import { navigate } from '../router';

import { isAnActivePlayer, createNavLink } from './HomePageUtils/HomePageUtils.ts';

let socket = getSocket();
let socket2: Socket | undefined;
let isGameStarted = { value: false };
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

function cleanupSockets() {
    socket.off('redirect');
    socket.off('connect');
    if (socket2)
	{
        socket2.off('connect');
        socket2.disconnect();
        socket2 = undefined;
    }
}

function startGame(players: string) {
	showGameModal(players, socket, isGameStarted);
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
		if (e.key === ' ' || e.key === 'Tab') {
			e.preventDefault();
		}
	});

	nav.appendChild(input);

	const playDiv = document.createElement('div');
	playDiv.className = 'mt-16';
	nav.appendChild(playDiv);

	const playTitle = document.createElement('h2');
	playTitle.className = ' text-center text-3xl font-extrabold text-blue-400 mb-4 mt-8';
	playTitle.textContent = locale.play;
	playDiv.appendChild(playTitle);

	const playNav = document.createElement('div');
	playNav.className = 'grid gap-4 sm:grid-cols-3';
	playDiv.appendChild(playNav);

	playOnline = joinButton(locale.online);
	playNav.appendChild(playOnline);

	playLocal = joinButton(locale.local);
	playLocal.disabled = false;
	playNav.appendChild(playLocal);

	playAI = joinButton(locale.solo);
	playAI.disabled = false;
	playNav.appendChild(playAI);

	playTournament = joinButton(locale.join_tournament);
	nav.appendChild(playTournament);

	nav.appendChild(createNavLink(locale.matchDisplay, '/MatchDisplay'));

	// language button
	const languageButton = createNavLink(locale.language, '/');
	nav.appendChild(languageButton);
	content.appendChild(nav);

	// login/logout button
	if ( localStorage.getItem('@@auth0spajs@@::VksN5p5Q9jbXcBAOw72RLLogClp44FVH::@@user@@') === null )
	{
		authGoogleButton(nav, document.createElement('div'));
	}
	else
	{
		const profileButton = document.createElement('button');
		profileButton.className = 'btn btn-secondary max-w-40 mx-auto text-center bg-green-400 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200';
		profileButton.textContent = locale.profile || 'Profile'; 
		profileButton.addEventListener('click', () => {
            navigate('/profile');
		});
		nav.appendChild(profileButton);
	}

	// about
	content.appendChild(bottomBtn(locale.about, '/about'));

	// Join game button
	let name: string;
	playOnline.addEventListener('click', async () => {
		name = input.value.trim();

		const isActive = await isAnActivePlayer(name);// le joueur est-il dans la liste des joueurs actifs 
		if (!isActive) 
		{
			alert(locale.UserInOnlineGame || 'Username already in online game');
			return;
		}

		await registerUsernameToDb(name);
		const button = showWaitingGameModal(socket);
		isGameStarted.value = false;
		console.log('isGameStarted set to :', isGameStarted);
		console.log(`Rejoindre une partie avec le nom: ${name}`);

		setPlayerName(name);

		if (!socket.connected)
			socket = getSocket();

		socket.emit('join', { name: name });

		console.log(`redirecting to game with name: ${name}`);
		socket.off('redirect');
		socket.on('redirect', (data: { gameId: string, playerName: string }) => {
			console.log(`HomePage: Redirecting to game ${data.gameId} for player ${data.playerName}`);
			button.remove();
			startGame(data.gameId);
		});

		try {
			console.log(`Envoi de la requête pour rejoindre une partie avec le nom: ${name}`);
			const response = await fetch(`${API_BASE_URL}/matchmaking/join`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name })
			});

			if (!response.ok) {
				console.error('Erreur lors de la requête de matchmaking:', response.statusText);
				throw new Error('Failed to join the game');
			}
			disableJoining();
		} catch (error) {
			alert(`Erreur lors de la création 1: ${(error as Error).message}`);
			name = '';
			button.remove();
		}
	});

	// Local button
	playLocal.addEventListener('click', async () => {
	try {
		socket.off('redirect');
		socket.off('connect');

		let socket2 = io(`${BASE_URL}`, {
			path: '/api/websocket/my-websocket/'
		});
		
		await Promise.all([
			new Promise<void>((resolve) => {
				if (socket.connected)
					resolve();
				else
				{
					socket.on('connect', () => {
						console.log('Player 1 socket connected for local play');
						socket.off('connect');
						resolve();
					});
					socket.connect();
				}
			}),
			new Promise<void>((resolve) => {
				socket2.on('connect', () => {
					console.log('Player 2 socket connected for local play');
					socket2.off('connect');
					
					socket2.emit('identify_player', { name: socket2.id });
					BabylonGame.getInstance().setSocket2(socket2);
					resolve();
				});
			})
		]);

		if (socket.id)
			setPlayerName(socket.id);

		socket.on('redirect', (data: { gameId: string, playerName: string }) => {
			console.log(`HomePage: Redirecting to game ${data.gameId} for player ${data.playerName}`);
			socket.off('redirect');
			startGame("you and your friend");
			socket2.emit('join', { name: socket2.id });
			socket2.emit('acceptGame');
		});

		const response = await fetch(`${API_BASE_URL}/game/start`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ player1: socket.id, player2: socket2.id, maxScore: 5 })
		});

		if (!response.ok) {
			const err = await response.text();
			throw new Error(err);
		}

		} catch (error) {
			alert(`Erreur lors de la création 2: ${(error as Error).message}`);
			socket.off('redirect');
			socket.off('connect');
		}
	});

	// Play AI
	playAI.addEventListener('click', async () => {
	try {
		socket.off('redirect');
		socket.off('connect');

		if (socket2 && socket2.connected) {
            socket2.disconnect();
            socket2 = undefined;
        }

		if (!socket.connected) {
			await new Promise<void>((resolve) => {
				if (socket.connected)
					resolve();
				else
				{
					socket.on('connect', () => {
						console.log('Player 1 socket connected for local play');
						socket.off('connect');
						resolve();
					});
					socket.connect();
				}
			});
		}
		const name = socket.id;
		if (name)
			setPlayerName(name);

		socket.on('redirect', (data: { gameId: string, playerName: string }) => {
			console.log(`HomePage-AI: Redirecting to game ${data.gameId} for player ${data.playerName}`);
			socket.off('redirect');
			startGame("you and AI");
		});

		socket.emit('join', { name });

		try {
			const response = await fetch(`${API_BASE_URL}/ai/create`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({name})
			});

			if (!response.ok) {
				const err = await response.text();
				throw new Error(err);
			}
		} catch (err) {
			console.log(`Error while starting match between AI and ${name}: ${(err as Error).message}.`);
		}

		console.log(`Partie IA créée avec ${name}`);
		} catch (error) {
			alert(`Erreur lors de la création 3: ${(error as Error).message}`);
			socket.off('redirect');
			socket.off('connect');
		}
	});

	// Tournament button
	playTournament.addEventListener('click', async () => {
		const name = input.value.trim();

		const isActive = await isAnActivePlayer(name); // le joueur est-il dans la liste des joueurs actifs 
		if (!isActive) 
		{
			alert(locale.UserInTournament || 'Username already in tournament');
			return;
		}

		try {
			if (!socket.connected) {
				await new Promise<void>((resolve) => {
					if (socket.connected)
						resolve();
					else
					{
						socket.on('connect', () => {
							console.log('Player 1 socket connected for local play');
							socket.off('connect');
							resolve();
						});
						socket.connect();
					}
				});
			}
			setPlayerName(name);
			await registerUsernameToDb(name);

			socket.emit('join', { name: name });

			socket.off('redirect');
			socket.on('redirect', (data: { gameId: string, playerName: string }) => {
				console.log(`HomePage: Redirecting to game ${data.gameId} for player ${data.playerName}`);
				if (modal)
					modal.remove();
				startGame(data.gameId);
			});

			let modal: HTMLDivElement;
			const response = await fetch(`${API_BASE_URL}/tournament/join`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name })
			});

			if (!response.ok) {
				const err = await response.text();
				throw new Error(err);
			}

			const data = await response.json();
			console.log('Tournoi rejoins:', data);

			if (data.playerCount < 4)
				modal = showTournamentModal(data.id, socket);
			disableJoining();
		} catch (error) {
			alert(`Erreur lors de la création 4: ${(error as Error).message}`);
		}
	});

	// Language button
	languageButton.addEventListener('click', showLanguageSelectionModal);
	return content;
}
