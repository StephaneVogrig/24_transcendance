import { Engine } from '@babylonjs/core';
import { createScene } from './scenes/scene1';
import { InputManager } from './inputManager';
import { resetVariables } from './scenes/scene1';

// console.log("Initializing Babylon.js scene...");

export const startBabylonScene = (canvas: HTMLCanvasElement) => {
    if (!canvas) {
        console.error("Canvas element is null or not found.");
        return;
    }


    const engine = new Engine(canvas, true);

    resetVariables();

    createScene(engine, canvas).then(scene => {
        engine.runRenderLoop(function () {
            scene.render();
        });
    });

    new InputManager();

    window.addEventListener('resize', function () {
        engine.resize();
    });
}
