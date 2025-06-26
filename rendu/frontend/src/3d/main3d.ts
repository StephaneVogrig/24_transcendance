import { Engine } from '@babylonjs/core';
import { createScene } from './scenes/scene1';

console.log("Initializing Babylon.js scene...");

export const startBabylonScene = (canvas: HTMLCanvasElement) => {
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

    window.addEventListener("keydown", (event) => {
    const key = event.key;
    console.log(`Key pressed: ${key}`);
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });
}
