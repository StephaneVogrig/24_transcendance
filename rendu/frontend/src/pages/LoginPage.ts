import { navigate } from '../router';

export const LoginPage = (): HTMLElement => {

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

    // Lien "Retourner à l'Accueil"
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.setAttribute('data-route', '/');
    homeLink.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    homeLink.textContent = 'Retourner à l\'Accueil';
    cardDiv.appendChild(homeLink);


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

    return cardDiv;
};
