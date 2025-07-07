import { navigate } from '../router';

export const RegisterPage = (): HTMLElement => {
    // Crée le conteneur principal
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12';

    // Crée la carte blanche du formulaire
    const cardDiv = document.createElement('div');
    cardDiv.className = 'bg-white p-8 rounded-lg shadow-xl w-full max-w-md';
    mainDiv.appendChild(cardDiv);

    // Titre
    const h2 = document.createElement('h2');
    h2.className = 'text-3xl font-bold text-center text-gray-900 mb-8';
    h2.textContent = 'Register'; // À traduire si vous avez une solution i18n
    cardDiv.appendChild(h2);

    // Message d'enregistrement/erreur
    const authMessageDiv = document.createElement('div');
    authMessageDiv.id = 'auth-message';
    authMessageDiv.className = 'text-center text-sm mb-6 font-medium';
    cardDiv.appendChild(authMessageDiv);

    // Formulaire
    const registerForm = document.createElement('form');
    registerForm.id = 'register-form';
    registerForm.className = 'space-y-6';
    cardDiv.appendChild(registerForm);

    // Champ Username
    const usernameDiv = document.createElement('div');
    usernameDiv.innerHTML = `
        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
        <input
            type="text"
            id="username"
            name="username"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Choose a username"
        >
    `;
    registerForm.appendChild(usernameDiv);
    const usernameInput = usernameDiv.querySelector('#username') as HTMLInputElement;

    // Champ Email
    const emailDiv = document.createElement('div');
    emailDiv.innerHTML = `
        <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
        <input
            type="email"
            id="email"
            name="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="you@example.com"
        >
    `;
    registerForm.appendChild(emailDiv);
    const emailInput = emailDiv.querySelector('#email') as HTMLInputElement;

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
    registerForm.appendChild(passwordDiv);
    const passwordInput = passwordDiv.querySelector('#password') as HTMLInputElement;

    // Champ Confirm Password
    const confirmPasswordDiv = document.createElement('div');
    confirmPasswordDiv.innerHTML = `
        <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input
            type="password"
            id="confirm-password"
            name="confirm-password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="••••••••"
        >
    `;
    registerForm.appendChild(confirmPasswordDiv);
    const confirmPasswordInput = confirmPasswordDiv.querySelector('#confirm-password') as HTMLInputElement;

    // Bouton d'enregistrement
    const registerButtonDiv = document.createElement('div');
    registerButtonDiv.innerHTML = `
        <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
            Register
        </button>
    `;
    registerForm.appendChild(registerButtonDiv);

    // Séparateur OR
    const separatorDiv = document.createElement('div');
    separatorDiv.className = 'mt-6 mb-6';
    separatorDiv.innerHTML = `
        <div class="relative">
            <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Or register with</span>
            </div>
        </div>
    `;
    cardDiv.appendChild(separatorDiv);

    // Bouton Google OAuth pour l'enregistrement
    const googleButtonDiv = document.createElement('div');
    googleButtonDiv.className = 'mb-6';
    googleButtonDiv.innerHTML = `
        <button
            type="button"
            id="googleRegisterBtn"
            class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
        </button>
    `;
    cardDiv.appendChild(googleButtonDiv);

    // Section "Already have an account?"
    const loginPromptDiv = document.createElement('div');
    loginPromptDiv.className = 'mt-6 text-center';
    loginPromptDiv.innerHTML = `
        <p class="text-sm text-gray-600">
            Already have an account?
            <a href="/login" class="font-medium text-blue-600 hover:text-blue-500" data-route="/login">
                Log in here
            </a>
        </p>
    `;
    cardDiv.appendChild(loginPromptDiv);

    // --- Logique JavaScript directement ici ---
    const handleSubmit = async (event: Event) => {
        event.preventDefault();

        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        authMessageDiv.textContent = '';
        authMessageDiv.className = 'text-center text-sm mb-6 font-medium';

        if (!username || !email || !password || !confirmPassword) {
            authMessageDiv.textContent = 'Veuillez remplir tous les champs.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
            return;
        }

        if (password !== confirmPassword) {
            authMessageDiv.textContent = 'Les mots de passe ne correspondent pas.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
            return;
        }

        // Ajoutez ici d'autres validations côté client (ex: format email, force du mot de passe)

        try {
            const response = await fetch('/api/auth/register', { // Votre endpoint d'enregistrement Fastify
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                authMessageDiv.textContent = 'Inscription réussie ! Redirection vers la connexion...';
                authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-green-600';
                setTimeout(() => { navigate('/login'); }, 1500); // Redirige vers la page de connexion
            } else {
                authMessageDiv.textContent = data.message || 'Échec de l\'inscription. Veuillez réessayer.';
                authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
            }
        } catch (error) {
            console.error('Erreur d\'inscription :', error);
            authMessageDiv.textContent = 'Erreur réseau. Veuillez réessayer plus tard.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
        }
    };

    // Gestion du bouton Google OAuth pour l'enregistrement
    const handleGoogleRegister = async () => {
        try {
            // Obtenir l'URL d'autorisation Google pour l'enregistrement
            const response = await fetch('http://localhost:3000/api/auth/google/register', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de l\'URL Google');
            }

            const data = await response.json();
            
            if (data.authUrl) {
                // Rediriger vers Google OAuth avec le paramètre d'enregistrement
                window.location.href = data.authUrl;
            } else {
                throw new Error('URL d\'autorisation Google non disponible');
            }
        } catch (error) {
            console.error('Erreur Google OAuth Register :', error);
            authMessageDiv.textContent = 'Erreur lors de l\'enregistrement avec Google. Veuillez réessayer.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
        }
    };

    // Vérifier si l'utilisateur revient d'un enregistrement Google réussi
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'register_success') {
        authMessageDiv.textContent = 'Compte créé avec Google avec succès ! Redirection...';
        authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-green-600';
        
        // Nettoyer l'URL et rediriger
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
            navigate('/profile'); // Rediriger vers le profil pour voir les informations
        }, 1500);
    }

    registerForm.addEventListener('submit', handleSubmit);

    // Ajouter l'event listener pour le bouton Google
    const googleRegisterBtn = googleButtonDiv.querySelector('#googleRegisterBtn') as HTMLButtonElement;
    googleRegisterBtn.addEventListener('click', handleGoogleRegister);

    return mainDiv;
};
