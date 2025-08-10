import { locale } from '../i18n';
import { authGoogleButton } from '../auth/auth0Utils';


const createElement = <K extends keyof HTMLElementTagNameMap>(tag: K, options: { text?: string; className?: string }): HTMLElementTagNameMap[K] => 
{
    const element = document.createElement(tag);
    if (options.text) element.textContent = options.text;
    if (options.className) element.className = options.className;
    return element;
};

const createAvatar = (user: any): HTMLImageElement =>
{  
    const element = document.createElement('img');
    element.className = 'w-16 h-16 rounded-full border-2 border-gray-200';
    element.alt = 'Avatar';
    
    // Set up error handler before setting src to prevent blinking
    element.onerror = () => { 
        console.log('Avatar load failed, using default');
        element.src = '/assets/default-avatar.png'; 
        element.onerror = null; // Prevent infinite loop if default image also fails
    };
    
    // Set src after error handler is in place
    element.src = user.picture || '/assets/default-avatar.png';
    
    console.log('Avatar created with src:', element.src);
    return element;
}

export const animateLoading = (container: HTMLElement): void => {
    container.innerHTML = '';
    const loadingDiv = createElement('div', { className: 'text-center' });
    
    const spinner = createElement('div', { 
        className: 'inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2' 
    });
    
    const loadingText = createElement('p', { 
        text: 'Chargement...', 
        className: 'text-gray-600' 
    });
    
    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(loadingText);
    container.appendChild(loadingDiv);
}

// ...existing code...
export const Connected = (user: any, userInfoDiv: HTMLDivElement): void => 
{
    if (user)  // utilisateur connecté
    {
        // Title
        const infoTitle = createElement('h3', {
            text: locale.userInfo,
            className: 'text-lg font-semibold text-gray-800 mb-4',
        });
        userInfoDiv.appendChild(infoTitle);

        // Main container for user details
        const detailsContainer = createElement('div', { className: 'space-y-3' });
        userInfoDiv.appendChild(detailsContainer);

        // --- Top section: Avatar, Name, Email ---
        const topSection = createElement('div', { className: 'flex items-center space-x-4' });
        detailsContainer.appendChild(topSection);

        // Avatar image
        const avatarImg = createAvatar(user);
        topSection.appendChild(avatarImg);

        // Name and Email container
        const nameEmailDiv = createElement('div', {});
        topSection.appendChild(nameEmailDiv);

        nameEmailDiv.appendChild(
            createElement('p', {text: user.name || 'N/A', className: 'font-semibold text-gray-800',}) );
        nameEmailDiv.appendChild(
            createElement('p', {text: user.email || 'N/A', className: 'text-gray-600',}));

        // --- Bottom section: Nickname ---
        const nicknameSection = createElement('div', { className: 'bg-gray-50 p-3 rounded-lg'});
        detailsContainer.appendChild(nicknameSection);

        nicknameSection.appendChild(
            createElement('p', {text: 'Nickname', className: 'text-sm font-medium text-gray-500',}));
        nicknameSection.appendChild(
            createElement('p', {text: user.nickname || 'N/A', className: 'text-sm text-gray-800',}));
    } 
    else // si erreur lors de la récupération des informations utilisateur 
    {
        userInfoDiv.innerHTML = ''; // Clear previous content
        const errorContainer = createElement('div', { className: 'text-center text-yellow-600', });
        errorContainer.appendChild(createElement('p', {text: locale.errorUserInfo}));
        userInfoDiv.appendChild(errorContainer);
    }
}
    
export const notConnected = (statusDiv: HTMLDivElement, userInfoDiv: HTMLDivElement,
        actionsDiv: HTMLDivElement): void =>  
{
        statusDiv.innerHTML = ''; // Vider le contenu précédent

        const icon = createElement('div', { text: '❌', className: 'text-center text-red-600 text-6xl mb-4', });
        statusDiv.appendChild(icon);

        const statusTitle = createElement('h3', { text: locale.notConnected, className: 'text-center text-xl font-semibold text-red-600 mb-2', });
        statusDiv.appendChild(statusTitle);

        userInfoDiv.innerHTML = ''; // Vider le contenu précédent

        const userInfoContent = document.createElement('div');
        userInfoContent.className = 'text-center text-gray-500';
        const userInfoText = createElement('p', { text: locale.connectForInfo, className: 'text-center text-gray-500', });
        userInfoContent.appendChild(userInfoText);
        userInfoDiv.appendChild(userInfoContent);

        // Actions pour utilisateur non connecté
        actionsDiv.innerHTML = ''; // Vider le contenu précédent
        const actionsTitle = document.createElement('h3');
        actionsTitle.className = 'text-lg font-semibold text-gray-800 mb-4';
        // actionsTitle.textContent = ' ';

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'flex flex-wrap gap-4';

        authGoogleButton(actionsDiv, document.createElement('div'));

        // actionsContainer.appendChild(loginButton);
        actionsDiv.appendChild(actionsTitle);
        actionsDiv.appendChild(actionsContainer);
}