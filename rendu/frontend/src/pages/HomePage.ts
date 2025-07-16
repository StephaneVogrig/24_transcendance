import { getSocket, setPlayerName } from '../websocket/websocket';
import { navigate } from '../router';
import { bottomBtn } from './components/bottomBtn';
import { locale } from '../i18n';

let socket = getSocket();
let isGameStarted = false;
let isWaitingForGame = false;

function disableJoining(playAlone: HTMLButtonElement, playOnline: HTMLButtonElement, playTournament: HTMLButtonElement)
{
    isWaitingForGame = true;
    playOnline.disabled = true;
    playAlone.disabled = true;
    playTournament.disabled = true;
}

function enableJoining(playAlone: HTMLButtonElement, playOnline: HTMLButtonElement, playTournament: HTMLButtonElement)
{
    isWaitingForGame = false;
    playOnline.disabled = false;
    playAlone.disabled = false;
    playTournament.disabled = false;
}

function startGame(gameId: string) {
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
    title.textContent = 'Game found!';
    modalContent.appendChild(title);

    const message = document.createElement('p');
    message.className = 'text-2xl text-gray-100 font-medium max-w-2xl';
    message.textContent = 'Thanks for waiting! Find your opponent and start the game between ' + gameId + '!';
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

function showTournamentModal(id: number): HTMLDivElement {
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

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    return modalOverlay;
}

function showWaitingGameModal(): HTMLDivElement {
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

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    return modalOverlay;
}

export const HomePage = (): HTMLElement => {

    const content = document.createElement('div');
    content.className = 'mx-auto max-w-7xl h-full grid grid-rows-[auto_1fr_auto] gap-8';

    // Navigation
    const nav = document.createElement('nav');
    nav.className = 'flex flex-col space-y-4';

    // Fonction utilitaire pour créer un lien de navigation
    const createNavLink = (text: string, route: string): HTMLAnchorElement => {
        const link = document.createElement('a');
        link.href = '#'; // Le href est souvent un '#' ou le chemin réel pour l'accessibilité
        link.setAttribute('data-route', route);
        link.className = 'btn btn-secondary text-center';
        link.textContent = text;
        return link;
    };

    nav.appendChild(createNavLink('Se connecter', '/login'));

    // Champ nom
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Pseudo...';
    input.maxLength = 20;
    input.className = 'mb-6 px-4 py-3 rounded-xl text-lg text-black w-50 border-4 border-cyan-400 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300 shadow-[0_0_10px_#00ffff]';
    input.addEventListener('input', () => {
        const isEmpty = (input.value.trim().length < 3 || input.value.length > 20) || isWaitingForGame;
        playOnline.disabled = isEmpty;
        playAlone.disabled = isEmpty;
        playTournament.disabled = isEmpty;
        playLocal.disabled = isEmpty;
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Tab') {
            e.preventDefault();
        }
    });

    const createJoinButton = (title: string): HTMLButtonElement => {
        const button = document.createElement('button');
        button.textContent = title;
        button.className = 'btn btn-primary text-center';
        button.disabled = true;
        return button;
    }

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

    const playOnline = createJoinButton(locale.online);
    playNav.appendChild(playOnline);

    const playLocal = createJoinButton(locale.local);
    playNav.appendChild(playLocal);

    const playAlone = createJoinButton(locale.solo);
    playNav.appendChild(playAlone);

    const playTournament = createJoinButton(locale.join_tournament);
    nav.appendChild(playTournament);

    nav.appendChild(createNavLink(locale.leaderboard, '/leaderboard'));
	const languageButton = createNavLink(locale.language, '/');
    nav.appendChild(languageButton);

    content.appendChild(nav);

     // about
    content.appendChild(bottomBtn(locale.about, '/about'));

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
        const button = showWaitingGameModal();
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
            button.remove();
            startGame(data.gameId);
            enableJoining(playAlone, playOnline, playTournament);
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
            disableJoining(playAlone, playOnline, playTournament);
        } catch (error) {
            alert(`Erreur lors de la création: ${(error as Error).message}`);
            button.remove();
        }
    });

    // AI button
    playAlone.addEventListener('click', async () => {
    const name = input.value.trim();
    try {
        setPlayerName(name);

        if (!socket.connected) {
            console.log("Socket not yet connected, waiting for 'connect' event...");
            socket = getSocket();
        }

        socket.emit('join', { name: name });

        socket.on('redirect', (data: { gameId: string, playerName: string }) => {
            console.log(`GameAIPage: Redirecting to game ${data.gameId} for player ${data.playerName}`);
            startGame(data.gameId);
        });

        try {
            const response = await fetch(`http://${window.location.hostname}:3009/api/ai/create`, {
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
                if (modal)
                    modal.remove();
                startGame(data.gameId);
                enableJoining(playAlone, playOnline, playTournament);
            });

            let modal: HTMLDivElement;
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
                modal = showTournamentModal(data.id);
            disableJoining(playAlone, playOnline, playTournament);
        } catch (error) {
            alert(`Erreur lors de la création: ${(error as Error).message}`);
        }
    });


	// Language button
	languageButton.addEventListener('click', async () => {
		const modalOverlay = document.createElement('div');
		modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';

		const modalContent = document.createElement('div');
		modalContent.className = 'bg-gray-800 p-8 rounded-lg shadow-2xl text-center flex flex-col items-center gap-6';
		modalOverlay.appendChild(modalContent);

		const title = document.createElement('h2');
		title.className = 'text-5xl font-extrabold text-gray-100 mb-4 tracking-wide';
		title.textContent = 'Language';
		modalContent.appendChild(title);

		const exitBtn = document.createElement('button');
		exitBtn.textContent = 'exit';

		document.body.appendChild(modalOverlay);
		
	});
    return content;
}
