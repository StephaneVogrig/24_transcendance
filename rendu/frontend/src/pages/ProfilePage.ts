import { isAuthenticated, getUser, logout} from '../auth/auth0Service';
import { navigate } from '../router';
import { locale } from '../i18n';

import { notConnected, Connected, animateLoading } from '../utils/ProfileUtils';


// Fonction utilitaire 
const createErrorMessage = (message: string, type: 'error' | 'warning' | 'info' = 'warning'): HTMLElement => {
    const container = document.createElement('div');
    const colorClass = {
        error: 'text-red-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600'
    }[type];
    
    container.className = `text-center ${colorClass}`;
    
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    container.appendChild(paragraph);
    
    return container;
};

const createElement = <K extends keyof HTMLElementTagNameMap>(tag: K, options: { text?: string; className?: string }): HTMLElementTagNameMap[K] => 
{
    const element = document.createElement(tag);
    if (options.text) element.textContent = options.text;
    if (options.className) element.className = options.className;
    return element;
};


export const ProfilePage = (): HTMLElement => {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6';

    // Conteneur principal
    const container = document.createElement('div');
    container.className = 'max-w-2xl mx-auto';
    mainDiv.appendChild(container);

    // Titre
    const title = document.createElement('h1');
    title.className = 'text-4xl font-bold text-center text-gray-800 mb-8';
    title.textContent = 'Statut d\'Authentification';
    container.appendChild(title);

    // Zone de statut
    const statusDiv = document.createElement('div');
    statusDiv.className = 'bg-white rounded-lg shadow-lg p-6 mb-6';
    container.appendChild(statusDiv);

    // Zone d'informations utilisateur
    const userInfoDiv = document.createElement('div');
    userInfoDiv.className = 'bg-white rounded-lg shadow-lg p-6 mb-6';
    container.appendChild(userInfoDiv);

    // Zone d'actions
    const actionsDiv = document.createElement('div'); 
    actionsDiv.className = 'bg-white rounded-lg shadow-lg p-6';
    container.appendChild(actionsDiv);

    // Fonction pour mettre à jour le statut
    const updateStatus = async () => {
        try {

            animateLoading(statusDiv); // Afficher l'indicateur de chargement

            userInfoDiv.innerHTML = '';
            actionsDiv.innerHTML = '';

            const authenticated = await isAuthenticated();// Vérifier l'authentification

            if (authenticated) // Utilisateur connecté
            {
                statusDiv.innerHTML = ''; // Clear previous content

                const statusTitle = createElement('h3', { text: '✅ Utilisateur Connecté',
                className: 'text-xl font-semibold text-center text-green-600 mb-2', });
                statusDiv.appendChild(statusTitle);

                try  // Récupérer les informations utilisateur
                {
                    const user = await getUser();
                    if (user)  // si utilisateur connecté
                    {
                        userInfoDiv.innerHTML = ''; // Clear previous content
                        Connected(user, userInfoDiv);
                    } 
                    else // si erreur lors de la récupération des informations utilisateur 
                    {
                        userInfoDiv.innerHTML =  '';
                        userInfoDiv.appendChild(createErrorMessage(locale.errorUserInfo, 'warning'));
                    }
                } 
                catch (error) 
                {
                    console.error(locale.errorUserInfo, error);
                    userInfoDiv.appendChild(createErrorMessage(locale.errorUserInfo, 'warning'));
                }

                // Actions pour utilisateur connecté
                actionsDiv.innerHTML = ''; // Clear previous content

                const actionsContainer = createElement('div', {className: 'flex flex-wrap gap-4'});

                const logoutButton = createElement('button', {text:locale.logout, className: 'px-6 py-2 bg-red-700 text-white rounded-lg'});
                logoutButton.id = 'logout-btn';

                actionsContainer.appendChild(logoutButton);
                actionsDiv.appendChild(actionsContainer);

                // Ajouter les événements
                const logoutBtn = actionsDiv.querySelector('#logout-btn') as HTMLButtonElement;

                logoutBtn?.addEventListener('click', async () => {
                    try 
                    {
                        logoutBtn.disabled = true;
                        // logoutBtn.textContent = 'Déconnexion...';
                        await logout();
                    } 
                    catch (error) {
                        console.error('Erreur lors de la déconnexion:', error);
                        logoutBtn.disabled = false;
                        // logoutBtn.textContent = 'Se Déconnecter';
                        alert('Erreur lors de la déconnexion');
                    }
                });
            } 
            else // Utilisateur non connecté
            {
                notConnected(statusDiv, userInfoDiv, actionsDiv);
        
                const loginBtn = actionsDiv.querySelector('#login-btn') as HTMLButtonElement;
                loginBtn?.addEventListener('click', () => navigate('/login'));
            }

        } 
        catch (error) {
            console.error('Erreur lors de la vérification du statut:', error);
            userInfoDiv.appendChild(createErrorMessage('⚠️ Impossible de vérifier le status d\'authentification', 'warning'));
        }
    };

    // Bouton retour
    const backButton = document.createElement('button');
    backButton.className = 'mb-6 flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200';
    backButton.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        <span>Retour</span>
    `;
    backButton.onclick = () => navigate('/');
    container.insertBefore(backButton, title);

    // Charger le statut au démarrage
    updateStatus();

    return mainDiv;
};