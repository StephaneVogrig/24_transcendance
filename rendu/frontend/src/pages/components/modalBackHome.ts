import { navigate } from '../../router';
import { locale } from '../../i18n';
import { enableJoining } from '../HomePage.ts';
// import { isGameOver } from '../GamePage.ts';

export function modalBackHome(title: string, content: string): HTMLDivElement {
    const gameFoundModalOverlay = document.getElementById('gameFoundModalOverlay');
    if (gameFoundModalOverlay)
    {
        gameFoundModalOverlay.remove();
        enableJoining();
    }

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
    modalOverlay.id = 'modalBackHome';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-gray-800 p-8 rounded-lg shadow-2xl text-center flex flex-col items-center gap-6';
    
    const titleParagraph = document.createElement('h2');
    titleParagraph.className = 'text-5xl font-extrabold text-gray-100 mb-4 tracking-wide';
    titleParagraph.textContent = title;
    modalContent.appendChild(titleParagraph);
    
    const message = document.createElement('p');
    message.className = 'text-2xl text-gray-100 font-medium max-w-2xl';
    message.textContent = content;
    modalContent.appendChild(message);

    const homeLink = document.createElement('button');
    homeLink.setAttribute('data-route', '/game');
    homeLink.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    homeLink.textContent = locale.back_home;
    homeLink.addEventListener('click', (event) => {
        event.preventDefault();
        modalOverlay.remove();
        navigate('/');
    });

    modalContent.appendChild(homeLink);

    modalOverlay.appendChild(modalContent);
    return modalOverlay;
}
