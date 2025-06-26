import { navigate } from '../router'; // Pour la redirection après inscription

// Fonction de validation simple pour le mot de passe
function validatePassword(password: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// Fonction onMount qui encapsule toute la logique JavaScript de la page
const onRegisterPageMount = (): (() => void) | void => {
    const registerForm = document.getElementById('register-form') as HTMLFormElement;
    const authMessageDiv = document.getElementById('auth-message') as HTMLDivElement;
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;

    const usernameFeedback = document.getElementById('username-feedback') as HTMLParagraphElement;
    const emailFeedback = document.getElementById('email-feedback') as HTMLParagraphElement;
    const passwordFeedback = document.getElementById('password-feedback') as HTMLParagraphElement;
    const confirmPasswordFeedback = document.getElementById('confirm-password-feedback') as HTMLParagraphElement;

    // S'assurer que les éléments existent avant d'ajouter des écouteurs
    if (!registerForm || !authMessageDiv || !usernameInput || !emailInput || !passwordInput || !confirmPasswordInput || !usernameFeedback || !emailFeedback || !passwordFeedback || !confirmPasswordFeedback) {
        console.error("Un ou plusieurs éléments du formulaire d'inscription sont manquants.");
        return; // Ne pas attacher d'écouteurs si les éléments ne sont pas trouvés
    }

    // Gestionnaire d'événement pour la soumission du formulaire
    const handleSubmit = async (event: Event) => {
        event.preventDefault(); // Empêche la soumission par défaut du formulaire

        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Réinitialiser les messages
        authMessageDiv.textContent = '';
        authMessageDiv.className = 'text-center text-sm mb-6 font-medium';
        usernameFeedback.textContent = '';
        emailFeedback.textContent = '';
        passwordFeedback.textContent = '';
        confirmPasswordFeedback.textContent = '';

        // Validation côté client
        let isValid = true;
        if (!username) {
            usernameFeedback.textContent = 'Le nom d\'utilisateur est requis.';
            usernameFeedback.className = 'mt-1 text-sm text-red-600';
            isValid = false;
        }
        if (!email || !email.includes('@')) {
            emailFeedback.textContent = 'Une adresse email valide est requise.';
            emailFeedback.className = 'mt-1 text-sm text-red-600';
            isValid = false;
        }
        if (!password || !validatePassword(password)) {
            passwordFeedback.textContent = 'Le mot de passe ne respecte pas les exigences.';
            passwordFeedback.className = 'mt-1 text-sm text-red-600';
            isValid = false;
        }
        if (password !== confirmPassword) {
            confirmPasswordFeedback.textContent = 'Les mots de passe ne correspondent pas.';
            confirmPasswordFeedback.className = 'mt-1 text-sm text-red-600';
            isValid = false;
        }

        if (!isValid) {
            authMessageDiv.textContent = 'Veuillez corriger les erreurs dans le formulaire.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
            return;
        }

        try {
            const response = await fetch('/api/auth/register', { // Votre endpoint Fastify d'inscription
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                authMessageDiv.textContent = 'Inscription réussie ! Redirection vers la page de connexion...';
                authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-green-600';
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                authMessageDiv.textContent = data.message || 'Une erreur est survenue lors de l\'inscription.';
                authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
            }
        } catch (error) {
            console.error('Erreur d\'inscription :', error);
            authMessageDiv.textContent = 'Erreur réseau. Veuillez réessayer plus tard.';
            authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
        }
    };

    registerForm.addEventListener('submit', handleSubmit);

    // Validation en temps réel (exemple pour mot de passe)
    const handlePasswordInput = () => {
        const password = passwordInput.value;
        if (password.length > 0 && !validatePassword(password)) {
            passwordFeedback.textContent = 'Mot de passe faible. Suivez les exigences.';
            passwordFeedback.className = 'mt-1 text-sm text-orange-500';
        } else if (password.length > 0) {
            passwordFeedback.textContent = 'Mot de passe fort !';
            passwordFeedback.className = 'mt-1 text-sm text-green-600';
        } else {
            passwordFeedback.textContent = '';
        }
    };
    passwordInput.addEventListener('input', handlePasswordInput);

    // Validation en temps réel pour la confirmation du mot de passe
    const handleConfirmPasswordInput = () => {
        if (confirmPasswordInput.value.length > 0 && passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordFeedback.textContent = 'Les mots de passe ne correspondent pas.';
            confirmPasswordFeedback.className = 'mt-1 text-sm text-red-600';
        } else if (confirmPasswordInput.value.length > 0) {
            confirmPasswordFeedback.textContent = 'Mots de passe identiques.';
            confirmPasswordFeedback.className = 'mt-1 text-sm text-green-600';
        } else {
            confirmPasswordFeedback.textContent = '';
        }
    };
    confirmPasswordInput.addEventListener('input', handleConfirmPasswordInput);

    // Retourne une fonction de nettoyage pour supprimer les écouteurs si la page est déchargée
    return () => {
        registerForm.removeEventListener('submit', handleSubmit);
        passwordInput.removeEventListener('input', handlePasswordInput);
        confirmPasswordInput.removeEventListener('input', handleConfirmPasswordInput);
    };
};

export const RegisterPage = (): { html: string; onMount: () => (() => void) | void } => ({
    html: `
<div class="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-8">Créez votre Compte</h2>

        <div id="auth-message" class="text-center text-sm mb-6 font-medium">
            </div>

        <form id="register-form" class="space-y-6">
            <div>
                <label for="username" class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    minlength="3"
                    maxlength="20"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="MonPseudoCool"
                >
                <p id="username-feedback" class="mt-1 text-sm text-gray-500"></p>
            </div>

            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Adresse Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="votre.email@exemple.com"
                >
                <p id="email-feedback" class="mt-1 text-sm text-gray-500"></p>
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minlength="8"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                >
                <p class="mt-1 text-xs text-gray-500">Min. 8 caractères, incluant majuscule, minuscule, chiffre et symbole.</p>
                <p id="password-feedback" class="mt-1 text-sm text-gray-500"></p>
            </div>

            <div>
                <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                <input
                    type="password"
                    id="confirm-password"
                    name="confirm-password"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                >
                <p id="confirm-password-feedback" class="mt-1 text-sm text-gray-500"></p>
            </div>

            <div>
                <button
                    type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                    S'inscrire
                </button>
            </div>
        </form>

        <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
                Déjà un compte ?
                <a href="/login" class="font-medium text-blue-600 hover:text-blue-500" data-route="/login">
                    Connectez-vous ici
                </a>
            </p>
        </div>
    </div>
</div>
    `,
    onMount: onRegisterPageMount,
});


// export const RegisterPage = (): string => `
// <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
//     <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
//         <h2 class="text-3xl font-bold text-center text-gray-900 mb-8">Créez votre Compte</h2>

//         <div id="auth-message" class="text-center text-sm mb-6 font-medium">
//             </div>

//         <form id="register-form" class="space-y-6">
//             <div>
//                 <label for="username" class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
//                 <input
//                     type="text"
//                     id="username"
//                     name="username"
//                     required
//                     minlength="3"
//                     maxlength="20"
//                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="MonPseudoCool"
//                 >
//                 <p id="username-feedback" class="mt-1 text-sm text-gray-500"></p>
//             </div>

//             <div>
//                 <label for="email" class="block text-sm font-medium text-gray-700">Adresse Email</label>
//                 <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     required
//                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="votre.email@exemple.com"
//                 >
//                 <p id="email-feedback" class="mt-1 text-sm text-gray-500"></p>
//             </div>

//             <div>
//                 <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
//                 <input
//                     type="password"
//                     id="password"
//                     name="password"
//                     required
//                     minlength="8"
//                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="••••••••"
//                 >
//                 <p class="mt-1 text-xs text-gray-500">Min. 8 caractères, incluant majuscule, minuscule, chiffre et symbole.</p>
//                 <p id="password-feedback" class="mt-1 text-sm text-gray-500"></p>
//             </div>

//             <div>
//                 <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
//                 <input
//                     type="password"
//                     id="confirm-password"
//                     name="confirm-password"
//                     required
//                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="••••••••"
//                 >
//                 <p id="confirm-password-feedback" class="mt-1 text-sm text-gray-500"></p>
//             </div>

//             <div>
//                 <button
//                     type="submit"
//                     class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
//                 >
//                     S'inscrire
//                 </button>
//             </div>
//         </form>

//         <div class="mt-6 text-center">
//             <p class="text-sm text-gray-600">
//                 Déjà un compte ?
//                 <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
//                     Connectez-vous ici
//                 </a>
//             </p>
//         </div>
//     </div>
// </div>

// <script type="module">
//     // Ceci est une logique TypeScript conceptuelle. L'implémentation réelle serait dans un fichier .ts séparé.
//     const registerForm = document.getElementById('register-form');
//     const authMessageDiv = document.getElementById('auth-message');
//     const usernameInput = document.getElementById('username');
//     const emailInput = document.getElementById('email');
//     const passwordInput = document.getElementById('password');
//     const confirmPasswordInput = document.getElementById('confirm-password');

//     const usernameFeedback = document.getElementById('username-feedback');
//     const emailFeedback = document.getElementById('email-feedback');
//     const passwordFeedback = document.getElementById('password-feedback');
//     const confirmPasswordFeedback = document.getElementById('confirm-password-feedback');

//     // Fonction de validation simple pour le mot de passe (à étoffer)
//     function validatePassword(password) {
//         const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//         return regex.test(password);
//     }

//     // Gestionnaire d'événement pour la soumission du formulaire
//     if (registerForm) {
//         registerForm.addEventListener('submit', async (event) => {
//             event.preventDefault(); // Empêche la soumission par défaut du formulaire

//             const username = usernameInput.value;
//             const email = emailInput.value;
//             const password = passwordInput.value;
//             const confirmPassword = confirmPasswordInput.value;

//             // Réinitialiser les messages
//             authMessageDiv.textContent = '';
//             authMessageDiv.className = 'text-center text-sm mb-6 font-medium';
//             usernameFeedback.textContent = '';
//             emailFeedback.textContent = '';
//             passwordFeedback.textContent = '';
//             confirmPasswordFeedback.textContent = '';

//             // Validation côté client
//             let isValid = true;
//             if (!username) {
//                 usernameFeedback.textContent = 'Le nom d\'utilisateur est requis.';
//                 usernameFeedback.className = 'mt-1 text-sm text-red-600';
//                 isValid = false;
//             }
//             if (!email || !email.includes('@')) {
//                 emailFeedback.textContent = 'Une adresse email valide est requise.';
//                 emailFeedback.className = 'mt-1 text-sm text-red-600';
//                 isValid = false;
//             }
//             if (!password || !validatePassword(password)) {
//                 passwordFeedback.textContent = 'Le mot de passe ne respecte pas les exigences.';
//                 passwordFeedback.className = 'mt-1 text-sm text-red-600';
//                 isValid = false;
//             }
//             if (password !== confirmPassword) {
//                 confirmPasswordFeedback.textContent = 'Les mots de passe ne correspondent pas.';
//                 confirmPasswordFeedback.className = 'mt-1 text-sm text-red-600';
//                 isValid = false;
//             }

//             if (!isValid) {
//                 authMessageDiv.textContent = 'Veuillez corriger les erreurs dans le formulaire.';
//                 authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
//                 return;
//             }

//             try {
//                 const response = await fetch('/api/auth/register', { // Votre endpoint Fastify d'inscription
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ username, email, password }),
//                 });

//                 const data = await response.json();

//                 if (response.ok) {
//                     authMessageDiv.textContent = 'Inscription réussie ! Redirection vers la page de connexion...';
//                     authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-green-600';
//                     // Optionnel : stocker le JWT si auto-connexion, sinon rediriger vers la page de login
//                     // localStorage.setItem('jwt_token', data.token);
//                     setTimeout(() => {
//                         window.location.href = '/login'; // Ou '/choice-game' si auto-connecté
//                     }, 2000);
//                 } else {
//                     authMessageDiv.textContent = data.message || 'Une erreur est survenue lors de l\'inscription.';
//                     authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
//                 }
//             } catch (error) {
//                 console.error('Erreur d\'inscription :', error);
//                 authMessageDiv.textContent = 'Erreur réseau. Veuillez réessayer plus tard.';
//                 authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
//             }
//         });
//     }

//     // Validation en temps réel (exemple pour mot de passe)
//     if (passwordInput && passwordFeedback) {
//         passwordInput.addEventListener('input', () => {
//             const password = passwordInput.value;
//             if (password.length > 0 && !validatePassword(password)) {
//                 passwordFeedback.textContent = 'Mot de passe faible. Suivez les exigences.';
//                 passwordFeedback.className = 'mt-1 text-sm text-orange-500';
//             } else if (password.length > 0) {
//                 passwordFeedback.textContent = 'Mot de passe fort !';
//                 passwordFeedback.className = 'mt-1 text-sm text-green-600';
//             } else {
//                 passwordFeedback.textContent = '';
//             }
//         });
//     }

//     // Validation en temps réel pour la confirmation du mot de passe
//     if (passwordInput && confirmPasswordInput && confirmPasswordFeedback) {
//         confirmPasswordInput.addEventListener('input', () => {
//             if (confirmPasswordInput.value.length > 0 && passwordInput.value !== confirmPasswordInput.value) {
//                 confirmPasswordFeedback.textContent = 'Les mots de passe ne correspondent pas.';
//                 confirmPasswordFeedback.className = 'mt-1 text-sm text-red-600';
//             } else if (confirmPasswordInput.value.length > 0) {
//                 confirmPasswordFeedback.textContent = 'Mots de passe identiques.';
//                 confirmPasswordFeedback.className = 'mt-1 text-sm text-green-600';
//             } else {
//                 confirmPasswordFeedback.textContent = '';
//             }
//         });
//     }

//     // TODO: Implémenter la vérification d'unicité pour username et email via des requêtes fetch
//     // (ex: sur l'événement 'blur' ou 'input' avec un délai)
// </script>
// `;