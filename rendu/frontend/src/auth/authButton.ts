import { locale } from "../i18n";
import { navigate } from "../router";
import { loginWithGoogle } from "./authGoogle";

/**
 * Crée le bouton de connexion Google
 */
export const createGoogleButton = (loginForm: HTMLElement, authMessageDiv: HTMLElement): void => {
    const googleButton = document.createElement('button');
    googleButton.id = 'google-oauth-btn';
    googleButton.className = 'w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200';
    googleButton.innerHTML = `
        <img class="w-5 h-5 mr-2" src="/assets/Google_logo.jpg" alt="Google Logo" />
        ${locale.google}
    `;
    loginForm.appendChild(googleButton);

    // Redirection vers OAuth Google au clic
    googleButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try 
        {
            authMessageDiv.textContent = 'Redirection vers Google...';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-blue-600';
            await loginWithGoogle();
        } 
        catch (error) {
            console.error('Erreur lors de la connexion Google:', error);
            authMessageDiv.textContent = 'Erreur lors de la connexion avec Google. Veuillez réessayer.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
        }
    });
};

/**
 * Crée un bouton Profile qui redirige vers la page de profil
 */
export function createProfileButton(): HTMLElement {
    const profileButton = document.createElement('button');
    // profileButton.className = 'btn btn-secondary max-w-40 mx-auto text-center bg-green-400 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200';
    profileButton.className = 'w-full flex justify-center items-center py-2 px-4 rounded-md shadow-sm bg-green-400 text-white text-m font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ';
    profileButton.textContent = locale.profile || 'Profile';
    profileButton.addEventListener('click', () => {
        navigate('/profile');
    });
    return profileButton;
}
