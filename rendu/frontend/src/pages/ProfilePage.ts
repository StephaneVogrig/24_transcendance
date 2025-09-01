import { logout } from '../auth/authGoogle';
import { locale } from '../i18n';
import { notConnected, userConnected, animateLoading } from './ProfileUtils/ProfileUtils';
import { getCurrentUser } from '../auth/authGoogle';
import { bottomBtn } from './components/bottomBtn';


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


const updateStatus = async (userInfoDiv :HTMLDivElement, actionsDiv :HTMLDivElement, statusDiv : HTMLDivElement ) => {
           
    animateLoading(statusDiv); // Affiche l'indicateur de chargement

    userInfoDiv.innerHTML = '';
    actionsDiv.innerHTML = '';

    if ( localStorage.getItem('access_token') !== null)
    {
        statusDiv.innerHTML = ''; // Clear previous content
        const statusTitle = createElement('h3', { text: locale.userconnected,
        className: 'text-xl font-semibold text-center text-green-600 mb-2', });
        statusDiv.appendChild(statusTitle);
        
        let user = null; // let = type dynamique
        try  
        { 
            user = await getCurrentUser(); // Récupérer info utilisateur
    
            if (user)
            {
                userInfoDiv.innerHTML = ''; // Clear previous content
                userConnected(user, userInfoDiv)
            } 
            else // si erreur lors de la récupération des info user
            {
                userInfoDiv.innerHTML =  '';
                userInfoDiv.appendChild(createErrorMessage(locale.errorUserInfo, 'warning'));
                localStorage.clear(); // Clear local storage on error
                sessionStorage.clear(); // Clear session storage on error
                // throw new Error(locale.errorUserInfo);
            }
        } 
        catch (error) 
        {
            console.error(locale.errorUserInfo, error);
            userInfoDiv.appendChild(createErrorMessage(locale.errorUserInfo, 'warning'));
            return
        }

        let nickname = user?.name || 'unknown';
        console.log('nickname-> ', nickname);

        //  Bouton logOut si utilisateur connecté
        actionsDiv.innerHTML = ''; 

        const actionsContainer = createElement('div', {className: 'flex flex-wrap gap-4'});
        const logoutButton = createElement('button', {text:locale.logout, className: 'px-6 py-2 bg-red-700 text-white rounded-lg'});
        logoutButton.id = 'logout-btn';

        actionsContainer.appendChild(logoutButton);
        actionsDiv.appendChild(actionsContainer);

        const logoutBtn = actionsDiv.querySelector('#logout-btn') as HTMLButtonElement;
        logoutBtn.setAttribute('data-nickname', nickname); //pour envoyer le pseudo au backend

        logoutBtn?.addEventListener('click', async () => {
            try 
            {
                logoutBtn.disabled = true;
                const nickname = logoutBtn.getAttribute('data-nickname') || 'unknown';
                console.log(' !!! Déconnexion en cours de l\'utilisateur', nickname);
                await logout();
            } 
            catch (error) {
                logoutBtn.disabled = false;
                alert(locale.errorconnection);
            }
        });
    } 
    else // Utilisateur non connecté
        notConnected(statusDiv, userInfoDiv, actionsDiv);
} 


export const ProfilePage = (): HTMLElement => {
    const mainDiv = document.createElement('div');

    // Conteneur principal
    const container = document.createElement('div');
    container.className = 'max-w-2xl mx-auto';
    mainDiv.appendChild(container);

    // Titre
    const title = document.createElement('h1');
    title.className = 'text-4xl font-bold text-center text-gray-400 mb-8';
    title.textContent = locale.statusAuth;
    container.appendChild(title);

    // Statut
    const statusDiv = document.createElement('div');
    statusDiv.className = 'bg-white rounded-lg shadow-lg p-6 mb-6';
    container.appendChild(statusDiv);

    // Info utilisateur
    const userInfoDiv = document.createElement('div');
    userInfoDiv.className = 'bg-white rounded-lg shadow-lg p-6 mb-6';
    container.appendChild(userInfoDiv);

    // Actions
    const actionsDiv = document.createElement('div'); 
    actionsDiv.className = 'bg-white rounded-lg shadow-lg p-6';
    container.appendChild(actionsDiv);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'mt-8'; // Marge supplémentaire
    buttonContainer.appendChild(bottomBtn(locale.back_home, '/'));
    container.appendChild(buttonContainer);

    try 
    {
        updateStatus(userInfoDiv, actionsDiv, statusDiv); // charger le statut
    }
    catch (error) {
        userInfoDiv.appendChild(createErrorMessage(locale.errorStatus, 'warning'));
    }
    return mainDiv;
};
