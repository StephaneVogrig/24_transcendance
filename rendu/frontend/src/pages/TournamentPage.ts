import { getSocket, setPlayerName } from '../websocket/websocket';
import { startGame } from './ChoiceGamePage.ts';
import { navigate } from '../router'

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

  const joinBtn = createButton('Rejoindre un tournoi', '/tournament/join', 'bg-green-600 hover:bg-green-700');

  // bouton retour a l'accueil
  const returnHome = createButton('Retour a l\'accueil', '/', 'bg-yellow-600 hover:bg-green-700');
  returnHome.addEventListener('click', async () => {
	navigate('/');
  })


  // Initially disable buttons since input is empty
  joinBtn.disabled = true;

  // Enable/disable buttons based on input value
  input.addEventListener('input', () => {
    const isEmpty = input.value.trim().length < 3;
    joinBtn.disabled = isEmpty;
  });

  buttonContainer.appendChild(joinBtn);
  buttonContainer.appendChild(returnHome);
  mainDiv.appendChild(buttonContainer);

  joinBtn.addEventListener('click', async () => {
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
			console.log(`TournamentPage: Redirecting to game ${data.gameId} for player ${data.playerName}`);
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

  return mainDiv;
};
