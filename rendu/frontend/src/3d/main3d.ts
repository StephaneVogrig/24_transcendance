import { Engine } from '@babylonjs/core';
import { createScene } from './scenes/scene1';

console.log("Initializing Babylon.js scene...");
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

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