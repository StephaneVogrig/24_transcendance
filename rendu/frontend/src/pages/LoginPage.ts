
import { navigate } from '../router';

// Fonction onMount qui encapsule toute la logique JavaScript de la page de connexion
const onLoginPageMount = (): (() => void) | void => {
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const authMessageDiv = document.getElementById('auth-message') as HTMLDivElement;
    const usernameOrEmailInput = document.getElementById('usernameOrEmail') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;

    // S'assurer que les éléments existent avant d'ajouter des écouteurs
    if (!loginForm || !authMessageDiv || !usernameOrEmailInput || !passwordInput) {
        console.error("Un ou plusieurs éléments du formulaire de connexion sont manquants. La logique ne sera pas initialisée.");
        return;
    }

    const handleSubmit = async (event: Event) => {
        event.preventDefault(); // Empêche la soumission par défaut du formulaire

        const usernameOrEmail = usernameOrEmailInput.value;
        const password = passwordInput.value;

        // Réinitialiser les messages
        authMessageDiv.textContent = '';
        authMessageDiv.className = 'text-center text-sm mb-6 font-medium';

        // Validation côté client
        if (!usernameOrEmail || !password) {
            authMessageDiv.textContent = 'Veuillez entrer un nom d\'utilisateur/email et un mot de passe.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
            return;
        }

        try {
            const response = await fetch('/api/auth/login', { // Votre endpoint Fastify de connexion
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usernameOrEmail, password }),
            });

            const data = await response.json();

            if (response.ok) {
                authMessageDiv.textContent = 'Connexion réussie ! Redirection...';
                authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-green-600';
                localStorage.setItem('jwt_token', data.token); // Stocker le JWT

                setTimeout(() => {
                    navigate('/choice-game'); // Rediriger vers la page de choix de jeu ou l'accueil
                }, 1000);
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

    // Retourne une fonction de nettoyage pour supprimer les écouteurs si la page est déchargée
    return () => {
        loginForm.removeEventListener('submit', handleSubmit);
    };
};

export const LoginPage = (): { html: string; onMount: () => (() => void) | void } => ({
    html: `
<div class="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-8">Log In</h2>

        <div id="auth-message" class="text-center text-sm mb-6 font-medium">
            </div>

        <form id="login-form" class="space-y-6">
            <div>
                <label for="usernameOrEmail" class="block text-sm font-medium text-gray-700">Username or Email</label>
                <input
                    type="text"
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="yourusername or your@email.com"
                >
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                >
            </div>

            <div class="flex items-center justify-between">
                <div class="text-sm">
                    <a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500" data-route="/forgot-password">
                        Forgot your password?
                    </a>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                    Log In
                </button>
            </div>
        </form>

        <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
                Don't have an account?
                <a href="/register" class="font-medium text-blue-600 hover:text-blue-500" data-route="/register">
                    Register here
                </a>
            </p>
        </div>
    </div>
</div>
    `,
    onMount: onLoginPageMount,
});