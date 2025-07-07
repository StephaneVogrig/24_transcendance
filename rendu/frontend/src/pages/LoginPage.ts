import { navigate } from '../router';

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

    // Séparateur OR
    const separatorDiv = document.createElement('div');
    separatorDiv.className = 'mt-6 mb-6';
    separatorDiv.innerHTML = `
        <div class="relative">
            <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Or</span>
            </div>
        </div>
    `;
    cardDiv.appendChild(separatorDiv);

    // Bouton Google OAuth
    const googleButtonDiv = document.createElement('div');
    googleButtonDiv.className = 'mb-6';
    googleButtonDiv.innerHTML = `
        <button
            type="button"
            id="googleLoginBtn"
            class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
        </button>
    `;
    cardDiv.appendChild(googleButtonDiv);

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

    // Gestion du bouton Google OAuth
    const handleGoogleLogin = async () => {
        try {
            // Obtenir l'URL d'autorisation Google
            const response = await fetch('http://localhost:3000/api/auth/google', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de l\'URL Google');
            }

            const data = await response.json();
            
            if (data.authUrl) {
                // Rediriger vers Google OAuth
                window.location.href = data.authUrl;
            } else {
                throw new Error('URL d\'autorisation Google non disponible');
            }
        } catch (error) {
            console.error('Erreur Google OAuth :', error);
            authMessageDiv.textContent = 'Erreur lors de la connexion avec Google. Veuillez réessayer.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
        }
    };

    // Vérifier si l'utilisateur revient d'une authentification Google réussie
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
        authMessageDiv.textContent = 'Connexion avec Google réussie ! Redirection...';
        authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-green-600';
        
        // Nettoyer l'URL et rediriger
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
            navigate('/dashboard'); // ou la page d'accueil souhaitée
        }, 1000);
    }

    loginForm.addEventListener('submit', handleSubmit);

    // Ajouter l'event listener pour le bouton Google
    const googleLoginBtn = googleButtonDiv.querySelector('#googleLoginBtn') as HTMLButtonElement;
    googleLoginBtn.addEventListener('click', handleGoogleLogin);

    // Pas de fonction de nettoyage à retourner car les écouteurs sont attachés aux éléments créés ici,
    // qui seront détruits lorsque la page est remplacée.
    // Si vous aviez des écouteurs globaux (ex: window.addEventListener),
    // vous devriez les ajouter ici et retourner une fonction pour les supprimer.

    return mainDiv; // Retourne l'élément DOM racine du composant
};