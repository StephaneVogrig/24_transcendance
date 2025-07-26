import { BabylonGame } from '../3d/main3d';
import { navigate } from '../router';
import { locale } from '../i18n';

let cachedGamePage: HTMLElement | null = null;
let name: string | null = null;

export function setPlayerName(playerName: string) {
    name = playerName;
}

export const GamePage = (): HTMLElement => {

    if (cachedGamePage) {
        return cachedGamePage;
    }
    const mainDiv = document.createElement('div');
    mainDiv.className = 'min-h-screen flex items-center justify-center';

   const cardDiv = document.createElement('div');
    cardDiv.className = ' shadow-xl text-center max-w-full w-full h-[100vh] flex items-center justify-center relative overflow-hidden'; // Exemple: s'adapte à la hauteur de la fenêtre avec overflow hidden
    mainDiv.appendChild(cardDiv);

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

    const statusParagraph = document.createElement('p');
    statusParagraph.id = 'gameStatusDisplay';
    statusParagraph.textContent = locale.game_status;
    statusParagraph.className = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-semibold text-orange-500 z-10';
    gameContainer.appendChild(statusParagraph);

    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    gameContainer.appendChild(canvas);

    cardDiv.appendChild(gameContainer);

    const homeLink = document.createElement('a');
    homeLink.className = 'absolute bottom-4 left-1/2 -translate-x-1/2 text-5xl font-semibold text-blue-300 z-10 hover:text-blue-500 transition-colors duration-200';
    homeLink.textContent = locale.exit_game;

    setTimeout(() => {
        updateScores(0, 0);
        if (canvas) {
            const babylonGame = BabylonGame.getInstance();
            babylonGame.initialize(canvas);
            babylonGame.setHomeLink(homeLink);
        } else {
            console.error("Canvas element not found for Babylon.js initialization.");
        }
    }, 0);
    mainDiv.appendChild(homeLink);
    
    cachedGamePage = mainDiv;

    window.addEventListener('languageChanged', () => {
        homeLink.textContent = locale.exit_game;
    });

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
    title.textContent = locale.game_over;
    modalContent.appendChild(title);
    
    const message = document.createElement('p');
    message.className = 'text-2xl text-gray-800 font-medium';
    message.textContent = 'Thanks for playing! Your game has ended.';
    modalContent.appendChild(message);

    const homeLink = document.createElement('a');
    homeLink.href = '#';
    homeLink.setAttribute('data-route', '/game');
    homeLink.className = 'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200';
    homeLink.textContent = locale.back_home;
    homeLink.addEventListener('click', (event) => {
        isGameOver = false;
        event.preventDefault();
        modalOverlay.remove(); 
        navigate('/');
    });
    
    modalContent.appendChild(homeLink);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

let isGameOver = false;

export function gameOver() {
    if (isGameOver)
        return;
    isGameOver = true;
    showGameOverModal();
}

export function updateScores(player1Score: number, player2Score: number) {
    const scoreParagraph = document.getElementById('gameScoreDisplay') as HTMLParagraphElement;
    if (scoreParagraph) {
        const scoreString = `${player1Score} - ${player2Score}`;
        let coloredHtml = '';

        const player2BaseColor = '#4299E1';
        const player2GlowColor = 'rgba(124, 255, 253, 0.7)';

        const player1BaseColor = '#F6AD55';
        const player1GlowColor = 'rgba(255, 140, 0, 0.7)';

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
}

export function gameStatusUpdate(status: string) {
    console.log(`Game status updated: ${status}`);
    const statusElement = document.getElementById('gameStatusDisplay') as HTMLParagraphElement;

    if (statusElement && status !== 'finished') {
        let displayStatus = '';
        let baseColor = '#FFFFFF';
        let glowColor = 'rgba(255, 255, 255, 0.7)';

        if (status === 'ready') {
            displayStatus = 'Your opponent has joined the game!';
            baseColor = '#4299E1';
            glowColor = 'rgba(124, 255, 253, 0.7)';
        } else if (status === 'started') {
            displayStatus = '';
        } else if (status === 'waiting') {
            displayStatus = 'Waiting for Players';
            baseColor = '#F6AD55';
            glowColor = 'rgba(255, 140, 0, 0.7)';
        } else if (status === '3' || status === '2' || status === '1') {
            displayStatus = status;
            baseColor = '#4299E1';
            glowColor = 'rgba(124, 255, 253, 0.7)';
        } else if ( status === '0') {
            displayStatus = 'GO !';
            baseColor = '#F6AD55';
            glowColor = 'rgba(255, 140, 0, 0.7)';
        }

        let coloredHtml = '';
        if (displayStatus) {
            for (let i = 0; i < displayStatus.length; i++) {
                const char = displayStatus[i];
                coloredHtml += `<span style="color: ${baseColor}; text-shadow: 0 0 10px ${glowColor};">${char}</span>`;
            }
        }
        statusElement.innerHTML = coloredHtml;
    }
}

export function gameOverDefault(winner: string, score: [number, number]) {
    console.log(`Game defeat over: Winner: ${winner}, Score: ${score[0]} - ${score[1]}`);
    const statusElement = document.getElementById('gameStatusDisplay') as HTMLParagraphElement;
    if (statusElement) {
        let displayStatus = '';
        let baseColor = '#FFFFFF';
        let glowColor = 'rgba(255, 255, 255, 0.7)';

        displayStatus = winner + ' wins ! ' + score[0] + ' - ' + score[1];
        baseColor = '#4299E1';
        glowColor = 'rgba(124, 255, 253, 0.7)';

        if (winner === name) {
            displayStatus = 'You win';
            baseColor = '#48BB78';
            glowColor = 'rgba(0, 255, 0, 0.7)';
        } else {
            displayStatus = 'You lose';
            baseColor = '#F56565';
            glowColor = 'rgba(255, 0, 0, 0.7)';
        }

        let coloredHtml = '';
        if (displayStatus) {
            for (let i = 0; i < displayStatus.length; i++) {
                const char = displayStatus[i];
                coloredHtml += `<span style="color: ${baseColor}; text-shadow: 0 0 10px ${glowColor};">${char}</span>`;
            }
        }
        statusElement.innerHTML = coloredHtml;
    } else {
        console.error("Status element not found.");
    }
}

export function gameOverTournament(winner: string, score: [number, number]) {
    console.log(`Game defeat over: Winner: ${winner}, Score: ${score[0]} - ${score[1]}`);
    const statusElement = document.getElementById('gameStatusDisplay') as HTMLParagraphElement;
    if (statusElement) {
        let displayStatus = '';
        let baseColor = '#FFFFFF';
        let glowColor = 'rgba(255, 255, 255, 0.7)';

        displayStatus = winner + ' wins ! ' + score[0] + ' - ' + score[1];
        baseColor = '#4299E1';
        glowColor = 'rgba(124, 255, 253, 0.7)';

        if (winner === name) {
            displayStatus = 'You won your match';
            baseColor = '#48BB78';
            glowColor = 'rgba(0, 255, 0, 0.7)';
        } else {
            displayStatus = 'You lost the match';
            baseColor = '#F56565';
            glowColor = 'rgba(255, 0, 0, 0.7)';
        }

        let coloredHtml = '';
        if (displayStatus) {
            for (let i = 0; i < displayStatus.length; i++) {
                const char = displayStatus[i];
                coloredHtml += `<span style="color: ${baseColor}; text-shadow: 0 0 10px ${glowColor};">${char}</span>`;
            }
        }
        statusElement.innerHTML = coloredHtml;
    } else {
        console.error("Status element not found.");
    }
}
