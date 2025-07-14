
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

  

  return mainDiv;
};
