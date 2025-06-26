export const LoginPage = (): string => `
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
                    <a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
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
                <a href="/register" class="font-medium text-blue-600 hover:text-blue-500">
                    Register here
                </a>
            </p>
        </div>
    </div>
</div>

<script type="module">
    // This is conceptual TypeScript logic, actual implementation would be in a .ts file
    const loginForm = document.getElementById('login-form');
    const authMessageDiv = document.getElementById('auth-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const usernameOrEmail = (document.getElementById('usernameOrEmail') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;

            // Simple client-side validation
            if (!usernameOrEmail || !password) {
                authMessageDiv.textContent = 'Please enter both username/email and password.';
                authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
                return;
            }

            try {
                const response = await fetch('/api/auth/login', { // Your Fastify login endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ usernameOrEmail, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    authMessageDiv.textContent = 'Login successful! Redirecting...';
                    authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-green-600';
                    localStorage.setItem('jwt_token', data.token); // Store the JWT
                    // Redirect to ChoiceGamePage or HomePage
                    window.location.href = '/choice-game'; // Or whatever your next page is
                } else {
                    authMessageDiv.textContent = data.message || 'Invalid credentials. Please try again.';
                    authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
                }
            } catch (error) {
                console.error('Login error:', error);
                authMessageDiv.textContent = 'Network error. Please try again later.';
                authMessageDiv.className = 'text-center text-sm mb-6 font-medium text-red-600';
            }
        });
    }
</script>
`;