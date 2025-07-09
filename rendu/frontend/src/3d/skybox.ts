import { Engine } from '@babylonjs/core';
import { createScene } from './scenes/scene2';

const startBabylonScene = (canvas: HTMLCanvasElement) => {
    if (!canvas) {
        console.error("Canvas element is null or not found.");
        return;
    }

    const engine = new Engine(canvas, true);

    createScene(engine, canvas).then(scene => {
        engine.runRenderLoop(function () {
            scene.render();
        });
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });
}

export const createSky = (): HTMLElement => {
    const gameContainer = document.createElement('div');
    gameContainer.style.width = '100%';
    gameContainer.style.height = '100%';
    gameContainer.style.overflow = 'hidden';
    gameContainer.style.margin = '0';
    gameContainer.style.padding = '0';
    gameContainer.style.position = 'relative';
    gameContainer.style.position = 'fixed';
    gameContainer.className = 'gameRectangle';

    const scriptConsole = document.createElement('script');
    scriptConsole.textContent = 'console.log("Game canvas ready");';
    gameContainer.appendChild(scriptConsole);

    const canvas = document.createElement('canvas');
    canvas.id = 'renderCanvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    gameContainer.appendChild(canvas);

    setTimeout(() => {
        const canvasElement = document.getElementById('renderCanvas') as HTMLCanvasElement;
        if (canvasElement) {
            startBabylonScene(canvasElement);
        } else {
            console.error("Erreur: L'élément canvas 'renderCanvas' n'a pas été trouvé pour l'initialisation de Babylon.js.");
        }
    }, 0);

    return gameContainer;
};
