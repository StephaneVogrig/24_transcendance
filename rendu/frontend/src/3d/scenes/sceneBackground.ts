import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, GlowLayer, Color3 } from '@babylonjs/core';
import { createSky } from '../meshes/skybox';

export const createSceneBackground = async function (engine: Engine, canvas: HTMLCanvasElement): Promise<Scene> {
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera("camera", 2.2*(Math.PI/3), Math.PI/2, 50, Vector3.Zero(), scene);
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 30;
    camera.inputs.remove(camera.inputs.attached.keyboard);
    camera.attachControl(canvas, true);
    camera.inputs.remove(camera.inputs.attached.mouse);
    camera.inputs.remove(camera.inputs.attached.pointers);

    const light = new HemisphericLight("light", new Vector3(10, 10, -10), scene);
    light.intensity = 0.7;

    const glow = new GlowLayer("glow", scene);
    glow.intensity = 0.6;

    const skybox = createSky(scene);
    scene.onBeforeRenderObservable.add(() => {
        skybox.rotation.y += 0.001;
    });

    return scene;
};
