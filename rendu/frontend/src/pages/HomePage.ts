import { getSocket, setPlayerName } from '../websocket/websocket';
import { navigate } from '../router';

let socket = getSocket();
let isGameStarted = false;

export function startGame(gameId: string) {
	if (isGameStarted) {
		console.log('Game already started, skipping modal display.');
		return;
	}
	isGameStarted = true;
	showGameModal(gameId);
}

function showGameModal(gameId: string) {
	const modalOverlay = document.createElement('div');
	modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
	modalOverlay.id = 'gameOverModalOverlay';
	
	const modalContent = document.createElement('div');
	modalContent.className = 'bg-gray-800 p-8 rounded-lg shadow-2xl text-center flex flex-col items-center gap-6';

	const title = document.createElement('h2');
	title.className = 'text-5xl font-extrabold text-gray-100 mb-4 tracking-wide';
	title.textContent = 'game found !';
	modalContent.appendChild(title);
	
	const message = document.createElement('p');
	message.className = 'text-2xl text-gray-100 font-medium max-w-2xl';
	message.textContent = 'Thanks for waiting! Find your opponent and start the game between ' + gameId + ' !';
	modalContent.appendChild(message);

	const homeLink = document.createElement('a');
	homeLink.href = '#';
	homeLink.setAttribute('data-route', '/game');
	homeLink.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
	homeLink.textContent = 'Join the game';
	homeLink.addEventListener('click', (event) => {
		console.log('Game started, navigating to game page.');
		isGameStarted = false;
		console.log('isGameStarted set to :', isGameStarted);
		event.preventDefault();
		modalOverlay.remove(); 
		socket.emit('acceptGame');
		navigate('/game');
	});

	modalContent.appendChild(homeLink);
	modalOverlay.appendChild(modalContent);
	document.body.appendChild(modalOverlay);
}

function showTournamentModal(id: number) {
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
	message.textContent = 'Tournament joined ! ID: ' + id + ". Please wait for other players to join.";
	modalContent.appendChild(message);

	const closeBtn = document.createElement('button');
	closeBtn.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
	closeBtn.textContent = 'Close';
	closeBtn.addEventListener('click', (event) => {
		event.preventDefault();
		modalOverlay.remove(); 
	});

	modalContent.appendChild(closeBtn);
	modalOverlay.appendChild(modalContent);
	document.body.appendChild(modalOverlay);
}

export const HomePage = (): HTMLElement => {

	const contentDiv = document.createElement('div');
	contentDiv.className = 'flex flex-col items-center';

	// Navigation
	const nav = document.createElement('nav');
	nav.className = 'flex flex-col space-y-4';

	// Fonction utilitaire pour créer un lien de navigation
	const createNavLink = (text: string, route: string, className: string): HTMLAnchorElement => {
		const link = document.createElement('a');
		link.href = '#'; // Le href est souvent un '#' ou le chemin réel pour l'accessibilité
		link.setAttribute('data-route', route);
		link.className = className;
		link.textContent = text;
		return link;
	};

	// Champ nom
	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = 'Entrez votre nom...';
	input.className = 'mb-6 px-4 py-3 rounded-xl text-lg text-black w-50 focus:outline-none';
	input.addEventListener('input', () => {
        const isEmpty = input.value.trim().length < 3;
        playOnline.disabled = isEmpty;
        playAlone.disabled = isEmpty;
        playTournament.disabled = isEmpty;
    });
	contentDiv.appendChild(input);

	// Play online button
	const playOnline = document.createElement('button');
	playOnline.textContent = 'Jouer en ligne';
	playOnline.className = 'btn btn-primary';
	playOnline.disabled = true;
	nav.appendChild(playOnline);

	const playAlone = document.createElement('button');
	playAlone.textContent = 'Jouer solo';
	playAlone.className = 'btn btn-primary';
	playAlone.disabled = true;
	nav.appendChild(playAlone);

	// Play tournament button
	const playTournament = document.createElement('button');
	playTournament.textContent = 'Tournoi';
	playTournament.className = 'btn btn-primary';
	playTournament.disabled = true;
	nav.appendChild(playTournament);

	nav.appendChild(createNavLink('Profil', '/profile', 'btn btn-secondary'));
	nav.appendChild(createNavLink('Classement', '/leaderboard', 'btn btn-secondary'));
	nav.appendChild(createNavLink('À propos', '/about', 'btn btn-secondary'));
	nav.appendChild(createNavLink('Se connecter', '/login', 'btn btn-outline'));
	nav.appendChild(createNavLink('S\'inscrire', '/register', 'btn btn-outline'));

	contentDiv.appendChild(nav);

	// Join game button
	let name: string;
	playOnline.addEventListener('click', async () => {
		if (name) {
			console.log(`Leaving the game with name: ${name}`);
			try {
			const response = await fetch(`http://${window.location.hostname}:3005/api/matchmaking/leave`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name })
			});
			if (!response.ok) {
				console.error('Erreur lors de la requête de leave:', response.statusText);
			}
			console.log('Successfully left the game');
			} catch (error) {
			console.error('Error leaving game:', error);
			}
		}
		isGameStarted = false;
		console.log('isGameStarted set to :', isGameStarted);
		name = input.value.trim();
		console.log(`Rejoindre une partie avec le nom: ${name}`);

		setPlayerName(name);

		if (!socket.connected)
			socket = getSocket();

		socket.emit('join', { name: name });

		console.log(`redirecting to game with name: ${name}`);
		socket.on('redirect', (data: { gameId: string, playerName: string }) => {
			console.log(`HomePage: Redirecting to game ${data.gameId} for player ${data.playerName}`);
			startGame(data.gameId);
		});


		try {
			console.log(`Envoi de la requête pour rejoindre une partie avec le nom: ${name}`);
			const response = await fetch(`http://${window.location.hostname}:3005/api/matchmaking/join`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name })
			});

			if (!response.ok) {
				console.error('Erreur lors de la requête de matchmaking:', response.statusText);
				throw new Error('Failed to join the game');
			}

		} catch (error) {
		alert(`Erreur lors de la création: ${(error as Error).message}`);
		}
	});

	// Tournament button
	playTournament.addEventListener('click', async () => {
		const name = input.value.trim();
		try {
			setPlayerName(name);
			
			if (!socket.connected) {
				console.log("Socket not yet connected, waiting for 'connect' event...");
				socket = getSocket();
			}

			socket.emit('join', { name: name });

			socket.on('redirect', (data: { gameId: string, playerName: string }) => {
				console.log(`HomePage: Redirecting to game ${data.gameId} for player ${data.playerName}`);
				startGame(data.gameId);
			});

			const response = await fetch(`http://${window.location.hostname}:3007/api/tournament/join`, {
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
				showTournamentModal(data.id);
		} catch (error) {
			alert(`Erreur lors de la création: ${(error as Error).message}`);
		}
	});

	return contentDiv;
}
