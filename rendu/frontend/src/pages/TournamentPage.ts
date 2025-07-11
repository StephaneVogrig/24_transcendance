import { getSocket, setPlayerName } from '../websocket/websocket';
import { startGame } from './ChoiceGamePage.ts';
import { navigate } from '../router'

export const TournamentPage = (): HTMLElement => {
  // Main container
  const mainDiv = document.createElement('div');
  mainDiv.className = 'flex flex-col items-center';

  // Title
  const h1 = document.createElement('h1');
  h1.className = 'text-6xl font-bold mb-8 animate-bounce';
  h1.textContent = 'Tournois Pong 🔥';
  mainDiv.appendChild(h1);

  // Input textbox
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Entrez votre nom...';
  input.className = 'mb-6 px-4 py-3 rounded-xl text-lg text-black w-80 focus:outline-none';
  mainDiv.appendChild(input);

  // Buttons container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'flex flex-col space-y-4';

  // Utility function to create a button
  const createButton = (text: string, route: string, className: string): HTMLButtonElement => {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `${className} px-6 py-3 rounded-xl text-lg font-semibold shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`;
    button.setAttribute('data-route', route);
    return button;
  };

  const createBtn = createButton('Créer un tournoi', '/tournament/create', 'bg-blue-600 hover:bg-blue-700');
  const joinBtn = createButton('Rejoindre un tournoi', '/tournament/join', 'bg-green-600 hover:bg-green-700');

  // bouton retour a l'accueil
  const returnHome = createButton('Retour a l\'accueil', '/', 'bg-yellow-600 hover:bg-green-700');
  returnHome.addEventListener('click', async () => {
	navigate('/');
  })


  // Initially disable buttons since input is empty
  createBtn.disabled = true;
  joinBtn.disabled = true;

  // Enable/disable buttons based on input value
  input.addEventListener('input', () => {
    const isEmpty = input.value.trim().length < 3;
    createBtn.disabled = isEmpty;
    joinBtn.disabled = isEmpty;
  });

  buttonContainer.appendChild(createBtn);
  buttonContainer.appendChild(joinBtn);
  buttonContainer.appendChild(returnHome);
  mainDiv.appendChild(buttonContainer);

   // Handle POST request on "Créer un tournoi"
  createBtn.addEventListener('click', async () => {
    const name = input.value.trim();
    try {
		const response = await fetch(`http://${window.location.hostname}:3007/api/tournament/create`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		});

		if (!response.ok) {
			const err = await response.text();
			throw new Error(err);
		}

		let socket = getSocket();
		setPlayerName(name);
		
		if (!socket.connected) {
			console.log("Socket not yet connected, waiting for 'connect' event...");
			socket = getSocket();
		}

		socket.emit('join', { name: name });

		socket.on('redirect', (data: { gameId: string, playerName: string }) => {
			console.log(`TournamentPage: Redirecting to game ${data.gameId} for player ${data.playerName}`);
			startGame();
		});

		const data = await response.json();
		console.log('Tournoi créé:', data);

		// Optional: Redirect to the tournament view or show success
		alert(`Tournoi créé avec succès ! ID: ${data.id}`);
		} catch (error) {
		alert(`Erreur lors de la création: ${(error as Error).message}`);
		}
  });

  joinBtn.addEventListener('click', async () => {
    const name = input.value.trim();
    try {

		const response = await fetch(`http://${window.location.hostname}:3007/api/tournament/join`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		});

		if (!response.ok) {
			const err = await response.text();
			throw new Error(err);
		}

		let socket = getSocket();
		setPlayerName(name);
		
		if (!socket.connected) {
			console.log("Socket not yet connected, waiting for 'connect' event...");
			socket = getSocket();
		}

		socket.emit('join', { name: name });

		socket.on('redirect', (data: { gameId: string, playerName: string }) => {
			console.log(`TournamentPage: Redirecting to game ${data.gameId} for player ${data.playerName}`);
			startGame();
		});

		const data = await response.json();
		console.log('Tournoi rejoins:', data);

		// Optional: Redirect to the tournament view or show success
		alert(`Tournoi rejoins avec succès ! ID: ${data.id}`);
	} catch (error) {
		alert(`Erreur lors de la création: ${(error as Error).message}`);
	}
  });

  return mainDiv;
};
