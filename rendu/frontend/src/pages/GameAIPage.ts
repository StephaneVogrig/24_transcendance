import { getSocket, setPlayerName } from '../websocket/websocket.ts';
import { startGame } from './ChoiceGamePage.ts';

export const GameAIPage = (): HTMLElement => {
  // Main container
  const mainDiv = document.createElement('div');
  mainDiv.className = 'min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white';

  // Title
  const h1 = document.createElement('h1');
  h1.className = 'text-6xl font-bold mb-8 animate-bounce';
  h1.textContent = 'Jouer contre IA';
  mainDiv.appendChild(h1)

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

  const createBtn = createButton('Lancer', '/gameai/start', 'bg-blue-600 hover:bg-blue-700');

  // Initially disable buttons since input is empty
  createBtn.disabled = true;

  // Enable/disable buttons based on input value
  input.addEventListener('input', () => {
    const isEmpty = input.value.trim().length < 3;
    createBtn.disabled = isEmpty;
  });

  buttonContainer.appendChild(createBtn);
  mainDiv.appendChild(buttonContainer);

   // Handle POST request on "Créer un tournoi"
  createBtn.addEventListener('click', async () => {
    const name = input.value.trim();
    try {
		let socket = getSocket();
		setPlayerName(name);
		
		if (!socket.connected) {
			console.log("Socket not yet connected, waiting for 'connect' event...");
			socket = getSocket();
		}

		socket.emit('join', { name: name });

		socket.on('redirect', (data: { gameId: string, playerName: string }) => {
			console.log(`GameAIPage: Redirecting to game ${data.gameId} for player ${data.playerName}`);
			startGame();
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

  return mainDiv;
};
