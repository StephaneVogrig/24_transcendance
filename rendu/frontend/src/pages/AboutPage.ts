export const AboutPage = (): { html: string; onMount?: () => (() => void) | void } => ({
    html: `
<div class="container mx-auto px-4 py-12 max-w-4xl">

    <section class="text-center mb-12">
        <h1 class="text-5xl font-extrabold text-blue-600 mb-4">About Viiiiite</h1>
        <p class="text-xl text-gray-700 leading-relaxed">
            Welcome to Viiiiite, a modern take on the classic arcade game, Pong! We've reimagined this timeless favorite for the web, bringing you fast-paced, addictive gameplay right in your browser.
        </p>
    </section>

    <hr class="my-12 border-gray-300">

    <section class="mb-12">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Under the Hood</h2>
        <div class="flex flex-wrap justify-center items-center gap-8">
            <div class="flex flex-col items-center p-4 rounded-lg shadow-md bg-white">
                <img src="/path/to/typescript-icon.svg" alt="TypeScript" class="w-16 h-16 mb-2">
                <span class="text-lg font-semibold text-gray-800">TypeScript</span>
            </div>
            </div>
        <p class="text-lg text-gray-700 mt-6 text-center">
            Built as a Single-Page Application (SPA) for a smooth user experience, Viiiiite leverages <strong>TypeScript</strong> for robust frontend logic and <strong>Tailwind CSS</strong> for a sleek, responsive design. Our backend, powered by <strong>Node.js</strong> and <strong>Fastify</strong>, ensures lightning-fast communication and reliable gameplay.
        </p>
    </section>

    <hr class="my-12 border-gray-300">

    <section class="text-center">
        <h2 class="text-3xl font-bold text-gray-800 mb-6">We'd Love to Hear From You!</h2>
        <p class="text-lg text-gray-700 mb-8">
            Your feedback helps us make Viiiiite even better! If you have suggestions, found a bug, or just want to say hello, feel free to reach out.
        </p>
        <a href="mailto:your.email@example.com" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 ease-in-out">
            Send Us an Email
        </a>
        <a href="https://github.com/yourusername/yourgamerepo" target="_blank" rel="noopener noreferrer" class="ml-4 text-blue-600 hover:text-blue-800 text-lg">
            Check out on GitHub
        </a>
    </section>

</div>
`,
    onMount: () => {
        return undefined;
    },
});
