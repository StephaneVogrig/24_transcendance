import { navigate } from '../router';
import { auth0Service } from '../auth/auth0Service';

export const LoginPage = (): HTMLElement => {
    // Créer le conteneur principal
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12';

    // Créer la carte blanche du formulaire
    const cardDiv = document.createElement('div');
    cardDiv.className = 'bg-white p-8 rounded-lg shadow-xl w-full max-w-md';
    mainDiv.appendChild(cardDiv);

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

    // Champ Username/Email
    const usernameDiv = document.createElement('div');
    usernameDiv.innerHTML = `
        <label for="usernameOrEmail" class="block text-sm font-medium text-gray-700">Username or Email</label>
        <input
            type="text"
            id="usernameOrEmail"
            name="usernameOrEmail"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="yourusername or your@email.com"
        >
    `;
    loginForm.appendChild(usernameDiv);
    const usernameOrEmailInput = usernameDiv.querySelector('#usernameOrEmail') as HTMLInputElement;

    // Champ Password
    const passwordDiv = document.createElement('div');
    passwordDiv.innerHTML = `
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
            type="password"
            id="password"
            name="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="••••••••"
        >
    `;
    loginForm.appendChild(passwordDiv);
    const passwordInput = passwordDiv.querySelector('#password') as HTMLInputElement;

    // Section "Forgot password?"
    const forgotPasswordDiv = document.createElement('div');
    forgotPasswordDiv.className = 'flex items-center justify-between';
    forgotPasswordDiv.innerHTML = `
        <div class="text-sm">
            <a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500" data-route="/forgot-password">
                Forgot your password?
            </a>
        </div>
    `;
    loginForm.appendChild(forgotPasswordDiv);

    // Bouton de connexion
    const loginButtonDiv = document.createElement('div');
    loginButtonDiv.innerHTML = `
        <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
            Log In
        </button>
    `;
    loginForm.appendChild(loginButtonDiv);

    // Séparateur "OU"
    const separatorDiv = document.createElement('div');
    separatorDiv.className = 'mt-6 mb-6';
    separatorDiv.innerHTML = `
        <div class="relative">
            <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">OU</span>
            </div>
        </div>
    `;
    cardDiv.appendChild(separatorDiv);

    // Bouton OAuth Auth0
    const oauthButtonDiv = document.createElement('div');
    oauthButtonDiv.className = 'mb-6';
    oauthButtonDiv.innerHTML = `
        <button
            type="button"
            id="oauth-login-btn"
            class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.568 8.16c-.169 1.858-.896 3.605-2.068 4.777-1.172 1.172-2.92 1.899-4.777 2.068C9.33 15.193 8.177 15.5 7 15.5s-2.33-.307-3.723-.495c-1.858-.169-3.605-.896-4.777-2.068C-2.672 11.765-3.399 10.018-3.568 8.16.619 7.972 1.772 7.665 2.949 7.665s2.33.307 3.723.495c1.858.169 3.605.896 4.777 2.068 1.172 1.172 1.899 2.92 2.068 4.777z"/>
            </svg>
            Continuer avec Auth0
        </button>
    `;
    cardDiv.appendChild(oauthButtonDiv);

    // Section "Don't have an account?"
    const registerPromptDiv = document.createElement('div');
    registerPromptDiv.className = 'mt-6 text-center';
    registerPromptDiv.innerHTML = `
        <p class="text-sm text-gray-600">
            Don't have an account?
            <a href="/register" class="font-medium text-blue-600 hover:text-blue-500" data-route="/register">
                Register here
            </a>
        </p>
    `;
    cardDiv.appendChild(registerPromptDiv);


    // --- Logique JavaScript directement ici ---
    const handleSubmit = async (event: Event) => {
        event.preventDefault();

        const usernameOrEmail = usernameOrEmailInput.value;
        const password = passwordInput.value;

        authMessageDiv.textContent = '';
        authMessageDiv.className = 'text-center text-sm mb-6 font-medium';

        if (!usernameOrEmail || !password) {
            authMessageDiv.textContent = 'Veuillez entrer un nom d\'utilisateur/email et un mot de passe.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail, password }),
            });

            const data = await response.json();

            if (response.ok) {
                authMessageDiv.textContent = 'Connexion réussie ! Redirection...';
                authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-green-600';
                localStorage.setItem('jwt_token', data.token);

                setTimeout(() => { navigate('/choice-game'); }, 1000);
            } else {
                authMessageDiv.textContent = data.message || 'Identifiants invalides. Veuillez réessayer.';
                authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
            }
        } catch (error) {
            console.error('Erreur de connexion :', error);
            authMessageDiv.textContent = 'Erreur réseau. Veuillez réessayer plus tard.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
        }
    };

    loginForm.addEventListener('submit', handleSubmit);

    // Gestionnaire pour le bouton OAuth
    const oauthLoginBtn = oauthButtonDiv.querySelector('#oauth-login-btn') as HTMLButtonElement;
    oauthLoginBtn.addEventListener('click', async () => {
        try {
            authMessageDiv.textContent = 'Initialisation Auth0...';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-blue-600';
            
            await auth0Service.initialize();
            
            if (!auth0Service.isAvailable()) {
                authMessageDiv.textContent = 'Auth0 non disponible. Utilisez la connexion traditionnelle.';
                authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-orange-600';
                return;
            }
            
            authMessageDiv.textContent = 'Redirection vers Auth0...';
            await auth0Service.loginWithRedirect();
        } catch (error) {
            console.error('Erreur OAuth:', error);
            authMessageDiv.textContent = 'Erreur lors de la connexion OAuth. Veuillez utiliser la connexion traditionnelle.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
        }
    });

    // Pas de fonction de nettoyage à retourner car les écouteurs sont attachés aux éléments créés ici,
    // qui seront détruits lorsque la page est remplacée.
    // Si vous aviez des écouteurs globaux (ex: window.addEventListener),
    // vous devriez les ajouter ici et retourner une fonction pour les supprimer.

    return mainDiv; // Retourne l'élément DOM racine du composant
};