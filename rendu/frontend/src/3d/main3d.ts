import { Engine } from '@babylonjs/core';
import { createSceneGame, resetVariables } from './scenes/sceneGame';
import { InputManager } from './inputManager';

// console.log("Initializing Babylon.js scene...");

export const startBabylonGame = (canvas: HTMLCanvasElement) => {
    if (!canvas) {
        console.error("Canvas element is null or not found.");
        return;
    }


    const engine = new Engine(canvas, true);

    resetVariables();

    createSceneGame(engine, canvas).then(scene => {
        engine.runRenderLoop(function () {
            scene.render();
        });
    });

    new InputManager();

    window.addEventListener('resize', function () {
        engine.resize();
    });
}
