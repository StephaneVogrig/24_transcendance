import { WebSocketBridge } from '../websocket/bridge';

export const ChoiceGamePage = (): HTMLElement => {

  const mainDiv = document.createElement('div');
  mainDiv.className = 'min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white';

  const h1 = document.createElement('h1');
  h1.className = 'text-6xl font-bold mb-8 animate-bounce';
  h1.textContent = 'Matchmaking Pong 🔥';
  mainDiv.appendChild(h1);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Entrez votre nom...';
  input.className = 'mb-6 px-4 py-3 rounded-xl text-lg text-black w-80 focus:outline-none';
  mainDiv.appendChild(input);

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
  mainDiv.appendChild(buttonContainer);

  createBtn.addEventListener('click', async () => {
    const name = input.value.trim();
    console.log(`Rejoindre une partie avec le nom: ${name}`);
    try {
      const webSocketBridge = new WebSocketBridge(name);
      await webSocketBridge.init(name);
      console.log(`Envoi de la requête pour rejoindre une partie avec le nom: ${name}`);
      const response = await fetch(`http://${window.location.hostname}:3005/api/matchmaking/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

    } catch (error) {
      alert(`Erreur lors de la création: ${(error as Error).message}`);
    }
  });

  return mainDiv;
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
    homeLink.href = '/game';
    homeLink.setAttribute('data-route', '/game');
    homeLink.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    homeLink.textContent = 'Join the game';
    
    modalContent.appendChild(homeLink);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

export function startGame() {
    showGameModal();
}