import { startBabylonScene } from '../3d/main3d'; // Importe la fonction d'initialisation de Babylon.js

export const GamePage = (): HTMLElement => {
    // Conteneur principal
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen flex items-center justify-center bg-gray-100 p-4';

    // Carte blanche centrale (pour encadrer le jeu si désiré, ou le jeu peut prendre tout l'écran)
    const cardDiv = document.createElement('div');
    // Ajustez les classes Tailwind CSS ici pour le style du conteneur de jeu
    // Par exemple, pour un jeu plein écran, vous pourriez ne pas vouloir de cardDiv ou le styliser différemment.
    cardDiv.className = 'bg-white p-2 rounded-lg shadow-xl text-center max-w-full w-full h-[90vh] flex items-center justify-center relative overflow-hidden'; // Exemple: s'adapte à la hauteur de la fenêtre avec overflow hidden
    mainDiv.appendChild(cardDiv);

    // Contenu du premier prompt adapté
    const gameContainer = document.createElement('div');
    gameContainer.style.width = '100%';
    gameContainer.style.height = '100%';
    gameContainer.style.overflow = 'hidden';
    gameContainer.style.margin = '0';
    gameContainer.style.padding = '0';
    gameContainer.style.position = 'relative';
    gameContainer.className = 'gameRectangle'; // Ajout de la classe si elle est utilisée ailleurs pour des styles spécifiques

    const scriptConsole = document.createElement('script');
    scriptConsole.textContent = 'console.log("Game canvas ready");';
    gameContainer.appendChild(scriptConsole);

    const scoreParagraph = document.createElement('p');
    scoreParagraph.id = 'gameScoreDisplay';
    scoreParagraph.textContent = '0 - 0';
    scoreParagraph.className = 'absolute top-4 left-1/2 -translate-x-1/2 text-5xl font-semibold text-blue-300 z-10 ';
    gameContainer.appendChild(scoreParagraph);

    const canvas = document.createElement('canvas');
    canvas.id = 'renderCanvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    gameContainer.appendChild(canvas);

    cardDiv.appendChild(gameContainer);
    
    // ***************************************************************
    // IMPORTANT: Initialiser la scène Babylon.js après que le canvas soit dans le DOM
    // Utilisez setTimeout avec un délai de 0 pour s'assurer que le rendu du DOM est terminé
    // ou, mieux encore, une fois que la page est entièrement affichée via un mécanisme de cycle de vie du routeur si tu en as un.
    // Pour l'instant, setTimeout(0) est une solution simple.
    setTimeout(() => {
        const canvasElement = document.getElementById('renderCanvas') as HTMLCanvasElement;
        if (canvasElement) {
            startBabylonScene(canvasElement); // Appel de la nouvelle fonction d'initialisation
        } else {
            console.error("Canvas element not found for Babylon.js initialization.");
        }
    }, 0);
    // ***************************************************************
    // const scriptModule = document.createElement('script');
    // scriptModule.type = 'module';
    // scriptModule.src = '../3d/main3d.ts'; // Assurez-vous que ce chemin est correct par rapport à l'emplacement final du fichier compilé
    // gameContainer.appendChild(scriptModule);


    return mainDiv;
};

export function updateScores(player1Score: number, player2Score: number) {
    const scoreParagraph = document.getElementById('gameScoreDisplay') as HTMLParagraphElement;
    if (scoreParagraph) {
        const scoreString = `${player1Score} - ${player2Score}`;
        let coloredHtml = '';

        const player1BaseColor = '#4299E1';
        const player1GlowColor = 'rgba(124, 255, 253, 0.7)';

        const player2BaseColor = '#F6AD55';
        const player2GlowColor = 'rgba(255, 140, 0, 0.7)';

        const separatorBaseColor = '#FFFFFF';
        const separatorGlowColor = 'rgb(255, 255, 255)';

        for (let i = 0; i < scoreString.length; i++) {
            const char = scoreString[i];
            let baseColor = '';
            let glowEffect = ''
            if (char === '-') {
                baseColor = separatorBaseColor;
                glowEffect = `text-shadow: 0 0 10px ${separatorGlowColor};`;
            } else if (char === ' ') {
                baseColor = 'transparent';
                glowEffect = '';
            } else if (i < scoreString.indexOf('-')) {
                baseColor = player1BaseColor;
                glowEffect = `text-shadow: 0 0 10px ${player1GlowColor};`;
            } else {
                baseColor = player2BaseColor;
                glowEffect = `text-shadow: 0 0 10px ${player2GlowColor};`;
            }
            
            coloredHtml += `<span style="color: ${baseColor}; ${glowEffect}">${char}</span>`;
        }
        scoreParagraph.innerHTML = coloredHtml;
    }
    else {
        console.error("Score paragraph element not found.");
    }
}

