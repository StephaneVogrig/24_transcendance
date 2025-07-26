import { navigate } from '../router';

export const RegisterPage = (): HTMLElement => {

    // Crée la carte blanche du formulaire
    const cardDiv = document.createElement('div');
    cardDiv.className = 'bg-white p-8 rounded-lg shadow-xl w-full max-w-md';

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
            const response = await fetch('http://${window.location.hostname}:3000/api/authentification/register', { // Votre endpoint d'enregistrement Fastify
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

    registerForm.addEventListener('submit', handleSubmit);

    return cardDiv;
};
