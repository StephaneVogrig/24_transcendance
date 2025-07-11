import { getSocket, setPlayerName } from '../websocket/websocket';
import { navigate } from '../router';

export const ChoiceGamePage = (): HTMLElement => {

    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex flex-col items-center';

    // Titre
    const h1 = document.createElement('h1');
    h1.className = 'text-6xl font-bold mb-8 animate-bounce';
    h1.textContent = 'Matchmaking Pong 🔥';
    contentDiv.appendChild(h1);

    // Champ nom
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Entrez votre nom...';
    input.className = 'mb-6 px-4 py-3 rounded-xl text-lg text-black w-80 focus:outline-none';
    contentDiv.appendChild(input);

    // Bouton
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex flex-col space-y-4';
    const createButton = (text: string, className: string): HTMLButtonElement => {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `${className} px-6 py-3 rounded-xl text-lg font-semibold shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`;
        return button;
    };

    const createBtn = createButton('Rejoindre une partie', 'bg-blue-600 hover:bg-blue-700');
    createBtn.disabled = true;

    input.addEventListener('input', () => {
        const isEmpty = input.value.trim().length < 3;
        createBtn.disabled = isEmpty;
    });

    buttonContainer.appendChild(createBtn);
    contentDiv.appendChild(buttonContainer);

	// bouton retour a l'accueil
	const returnHome = createButton('Retour a l\'accueil', '/');
	returnHome.addEventListener('click', async () => {
	navigate('/');
	})
	contentDiv.appendChild(returnHome);

    let name: string;
    createBtn.addEventListener('click', async () => {
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
    let socket = getSocket();

    setPlayerName(name);

    if (!socket.connected)
        socket = getSocket();

    socket.emit('join', { name: name });

    console.log(`redirecting to game with name: ${name}`);
    socket.on('redirect', (data: { gameId: string, playerName: string }) => {
        console.log(`ChoiceGamePage: Redirecting to game ${data.gameId} for player ${data.playerName}`);
        startGame();
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

  return contentDiv;
};

function showGameModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
    modalOverlay.id = 'gameOverModalOverlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white p-8 rounded-lg shadow-2xl text-center flex flex-col items-center gap-6';
    
    const title = document.createElement('h2');
    title.className = 'text-5xl font-extrabold text-red-600 mb-4 tracking-wide';
    title.textContent = 'game found !';
    modalContent.appendChild(title);
    
    const message = document.createElement('p');
    message.className = 'text-2xl text-gray-800 font-medium';
    message.textContent = 'Thanks for waiting! Your game is starting now.';
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
        navigate('/game');
    });

    modalContent.appendChild(homeLink);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

let isGameStarted = false;

export function startGame() {
    if (isGameStarted) {
        console.log('Game already started, skipping modal display.');
        return;
    }
    isGameStarted = true;
    showGameModal();
}
