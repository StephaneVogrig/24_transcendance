export const AboutPage = (): HTMLElement => {
    // Conteneur principal
    const container = document.createElement('div');
    container.className = 'container mx-auto px-4 py-12 max-w-4xl';

    // Section "About Viiiite"
    const aboutSection = document.createElement('section');
    aboutSection.className = 'text-center mb-12';

    const h1 = document.createElement('h1');
    h1.className = 'text-5xl font-extrabold text-blue-600 mb-4';
    h1.textContent = 'About Viiiite';
    aboutSection.appendChild(h1);

    const pIntro = document.createElement('p');
    pIntro.className = 'text-xl text-gray-500 leading-relaxed';
    pIntro.textContent = `
        Welcome to Viiiiite, a modern take on the classic arcade game, Pong! We've reimagined this timeless favorite for the web, bringing you fast-paced, addictive gameplay right in your browser.
    `;
    aboutSection.appendChild(pIntro);
    container.appendChild(aboutSection);

    // Ligne de séparation
    const hr1 = document.createElement('hr');
    hr1.className = 'my-12 border-gray-300';
    container.appendChild(hr1);

    // Section "Under the Hood"
    const techSection = document.createElement('section');
    techSection.className = 'mb-12';

    const h2Tech = document.createElement('h2');
    h2Tech.className = 'text-3xl font-bold text-gray-500 mb-6 text-center';
    h2Tech.textContent = 'Under the Hood';
    techSection.appendChild(h2Tech);

    const techLogosDiv = document.createElement('div');
    techLogosDiv.className = 'flex flex-wrap justify-center items-center gap-8';
    // Les images des logos sont à ajouter ici si besoin, ex:
    // const tsLogoDiv = document.createElement('div');
    // tsLogoDiv.className = 'flex flex-col items-center p-4 rounded-lg shadow-md bg-white';
    // const tsImg = document.createElement('img');
    // tsImg.src = '/path/to/typescript-icon.svg'; // Assurez-vous que le chemin est correct
    // tsImg.alt = 'TypeScript';
    // tsImg.className = 'w-16 h-16 mb-2';
    // tsLogoDiv.appendChild(tsImg);
    // const tsSpan = document.createElement('span');
    // tsSpan.className = 'text-lg font-semibold text-gray-800';
    // tsSpan.textContent = 'TypeScript';
    // tsLogoDiv.appendChild(tsSpan);
    // techLogosDiv.appendChild(tsLogoDiv);
    // ... répéter pour Tailwind, Node.js, Fastify etc.
    techSection.appendChild(techLogosDiv);

    const pTechDesc = document.createElement('p');
    pTechDesc.className = 'text-lg text-gray-500 mt-6 text-center';
    pTechDesc.innerHTML = `
        Built as a Single-Page Application (SPA) for a smooth user experience, Viiiite leverages <strong>TypeScript</strong> for robust frontend logic and <strong>Tailwind CSS</strong> for a sleek, responsive design. Our backend, powered by <strong>Node.js</strong> and <strong>Fastify</strong>, ensures lightning-fast communication and reliable gameplay.
    `;
    techSection.appendChild(pTechDesc);
    container.appendChild(techSection);

    // Ligne de séparation
    const hr2 = document.createElement('hr');
    hr2.className = 'my-12 border-gray-300';
    container.appendChild(hr2);

    // Section "We'd Love to Hear From You!"
    const contactSection = document.createElement('section');
    contactSection.className = 'text-center';

    const h2Contact = document.createElement('h2');
    h2Contact.className = 'text-3xl font-bold text-gray-500 mb-6';
    h2Contact.textContent = 'We\'d Love to Hear From You!';
    contactSection.appendChild(h2Contact);

    const pContact = document.createElement('p');
    pContact.className = 'text-lg text-gray-500 mb-8';
    pContact.textContent = `
        Your feedback helps us make Viiiiite even better! If you have suggestions, found a bug, or just want to say hello, feel free to reach out.
    `;
    contactSection.appendChild(pContact);

    // Lien GitHub
    const githubLink = document.createElement('a');
    githubLink.href = 'https://github.com/yourusername/yourgamerepo';
    githubLink.target = '_blank';
    githubLink.rel = 'noopener noreferrer';
    githubLink.className = 'ml-4 text-blue-600 hover:text-blue-800 text-lg';
    githubLink.textContent = 'Check out on GitHub';
    contactSection.appendChild(githubLink);

    container.appendChild(contactSection);

    // Lien "Retourner à l'Accueil"
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.setAttribute('data-route', '/');
    homeLink.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    homeLink.textContent = 'Retourner à l\'Accueil';
    container.appendChild(homeLink);


    return container; // Retourne l'élément DOM racine du composant
};
