
import { loginWithGoogle, loginWithGoogleRedirect, logout } from '../auth/auth0Service';
import { navigate } from '../router';


export const createGoogleButton = (loginForm: HTMLElement, authMessageDiv: HTMLElement): void => {
    const googleButton = document.createElement('button');
    googleButton.id = 'google-oauth-btn';
    googleButton.className = 'w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200';
    googleButton.innerHTML = `
         <img class="w-5 h-5 mr-2" src="/assets/Google_logo.png" alt="Auth0 Logo" />
        Continue with Google
    `;
    loginForm.appendChild(googleButton);

    // Redirection vers OAuth Google au clic
    googleButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            authMessageDiv.textContent = 'Connexion avec Google...';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-blue-600';
            
            // Utiliser Auth0 pour la connexion Google avec popup
            await loginWithGoogle();
            
        } catch (error) {
            console.error('Erreur lors de la connexion Google:', error);
            
            // Gestion des erreurs spécifiques
            if (error instanceof Error) {
                if (error.message.includes('popup_blocked')) {
                    authMessageDiv.textContent = 'Popup bloquée. Tentative avec redirection...';
                    authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-orange-600';
                    
                    // Fallback vers la redirection
                    try {
                        setTimeout(async () => {
                            await loginWithGoogleRedirect();
                        }, 1500);
                    } catch (redirectError) {
                        authMessageDiv.textContent = 'Erreur lors de la connexion avec Google. Veuillez réessayer.';
                        authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
                    }
                } else if (error.message.includes('popup_closed_by_user')) {
                    authMessageDiv.textContent = 'Connexion annulée.';
                    authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-gray-600';
                } else {
                    authMessageDiv.textContent = error.message || 'Erreur lors de la connexion avec Google. Veuillez réessayer.';
                    authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
                }
            } else {
                authMessageDiv.textContent = 'Erreur lors de la connexion avec Google. Veuillez réessayer.';
                authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
            }
        }
    });
};

export const LoginPage = (): HTMLElement => {


    console.log('window.location.pathname:', window.location.pathname);

    // Créer la carte blanche du formulaire
    const cardDiv = document.createElement('div');
    cardDiv.className = 'bg-white p-8 rounded-lg shadow-xl w-full max-w-md';

    // Titre
    const h2 = document.createElement('h2');
    h2.className = 'text-3xl font-bold text-center text-gray-900 mb-8';
    h2.textContent = 'Log In'; // À traduire si vous avez une solution i18n
    cardDiv.appendChild(h2);

    // Message d'authentification
    const authMessageDiv = document.createElement('div');
    authMessageDiv.id = 'auth-message';
    authMessageDiv.className = 'text-center text-sm mb-6 font-medium';
    cardDiv.appendChild(authMessageDiv);

    // Formulaire
    const loginForm = document.createElement('form');
    loginForm.id = 'login-form';
    loginForm.className = 'space-y-6';
    cardDiv.appendChild(loginForm);

    // Bouton Google OAuth
    createGoogleButton(loginForm, authMessageDiv);

    // Bouton Deconnexion
    const deconnexion = document.createElement('button');
    deconnexion.id = 'deconnexion-btn';
    deconnexion.className = 'w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200';
    deconnexion.innerHTML = `
        Deconnexion
    `;
    loginForm.appendChild(deconnexion);

    // Écouteur d'événement pour la déconnexion
    deconnexion.addEventListener('click', async () => {
        try {
            authMessageDiv.textContent = 'Déconnexion en cours...';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-blue-600';
            console.log('Tentative de déconnexion...');
            
            // Utiliser Auth0 pour la déconnexion
            await logout();
            
            // La fonction logout() d'Auth0 redirige automatiquement,
            // donc ce code ne s'exécutera que si la déconnexion échoue
            authMessageDiv.textContent = 'Déconnexion réussie. Redirection...';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-green-600';
            
            setTimeout(() => { navigate('/'); }, 1000);
            
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            authMessageDiv.textContent = 'Erreur lors de la déconnexion. Veuillez réessayer.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
        }
    }); 
    




    // --- Logique JavaScript directement ici ---
    const handleSubmit = async (event: Event) => {
        event.preventDefault(); // Empêche le rechargement de la page   

        // Ici, vous pouvez ajouter une logique de connexion si nécessaire
        // Par exemple, si vous avez un formulaire de connexion avec des champs email et mot de passe
       
    };
    loginForm.addEventListener('submit', handleSubmit);

    // Pas de fonction de nettoyage à retourner car les écouteurs sont attachés aux éléments créés ici,
    // qui seront détruits lorsque la page est remplacée.
    // Si vous aviez des écouteurs globaux (ex: window.addEventListener),
    // vous devriez les ajouter ici et retourner une fonction pour les supprimer.

    return cardDiv; // Retourne l'élément DOM racine du composant
};