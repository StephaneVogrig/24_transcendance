import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, GlowLayer } from '@babylonjs/core';
import { createSky } from '../meshes/skybox';
import { createSphere } from '../meshes/sphere';
import { createPlatform } from '../meshes/playform';

export const createScene = async function (engine: Engine, canvas: HTMLCanvasElement): Promise<Scene> {
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera("camera", 2.2*(Math.PI/3), Math.PI/2, 50, Vector3.Zero(), scene);
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 80;
    camera.inputs.remove(camera.inputs.attached.keyboard);
    camera.lockedTarget = Vector3.Zero();
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(10, 10, -10), scene);
    light.intensity = 0.7;

    const glow = new GlowLayer("glow", scene);
    glow.intensity = 0.6;

    createSky(scene);
    const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);

    const ball = createSphere(scene);
    ball.position = new Vector3(0, 0, 0);

    const platform1 = createPlatform(scene);
    platform1.position = new Vector3(0, 0, 20);
    platform1.rotation.x = Math.PI / -2;

    const platform2 = createPlatform(scene);
    platform2.position = new Vector3(0, 0, -20);
    platform2.rotation.x = Math.PI / 2;

    return scene;
};