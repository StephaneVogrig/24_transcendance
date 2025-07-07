import { startBabylonScene } from '../3d/main3d';

export const GamePage = (): HTMLElement => {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen flex items-center justify-center';

   const cardDiv = document.createElement('div');
    cardDiv.className = ' shadow-xl text-center max-w-full w-full h-[100vh] flex items-center justify-center relative overflow-hidden'; // Exemple: s'adapte à la hauteur de la fenêtre avec overflow hidden
    mainDiv.appendChild(cardDiv);

    // const homeLink = document.createElement('a');
    // homeLink.href = '/';
    // homeLink.setAttribute('data-route', '/');
    // homeLink.className = 'absolute bottom-4 left-1/2 -translate-x-1/2 text-5xl font-semibold text-blue-300 z-10 hover:text-blue-500 transition-colors duration-200';
    // homeLink.textContent = 'Home';
    // mainDiv.appendChild(homeLink);

    const gameContainer = document.createElement('div');
    gameContainer.style.width = '100%';
    gameContainer.style.height = '100%';
    gameContainer.style.overflow = 'hidden';
    gameContainer.style.margin = '0';
    gameContainer.style.padding = '0';
    gameContainer.style.position = 'relative';
    gameContainer.className = 'gameRectangle';

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
    // mainDiv.appendChild(gameContainer);

    setTimeout(() => {
        updateScores(0, 0);
        const canvasElement = document.getElementById('renderCanvas') as HTMLCanvasElement;
        if (canvasElement) {
            startBabylonScene(canvasElement);
        } else {
            console.error("Canvas element not found for Babylon.js initialization.");
        }
    }, 0);
    
    return mainDiv;
};

function showGameOverModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
    modalOverlay.id = 'gameOverModalOverlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white p-8 rounded-lg shadow-2xl text-center flex flex-col items-center gap-6';
    
    const title = document.createElement('h2');
    title.className = 'text-5xl font-extrabold text-red-600 mb-4 tracking-wide';
    title.textContent = 'Game Over !';
    modalContent.appendChild(title);
    
    const message = document.createElement('p');
    message.className = 'text-2xl text-gray-800 font-medium';
    message.textContent = 'Thanks for playing! Your game has ended.';
    modalContent.appendChild(message);
    
    
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.setAttribute('data-route', '/');
    homeLink.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    homeLink.textContent = 'Return to Home';
    
    modalContent.appendChild(homeLink);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

export function gameOver() {
    showGameOverModal();
}

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

