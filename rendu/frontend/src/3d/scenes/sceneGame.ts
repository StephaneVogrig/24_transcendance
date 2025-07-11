import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, GlowLayer, Color3 } from '@babylonjs/core';
import { createSky } from '../meshes/skybox';
import { createSphere } from '../meshes/sphere';
import { createPlatform } from '../meshes/playform';
import { createArena } from '../meshes/arena';

export let ballPosition = new Vector3(0, 0, 0);
export let platform1Position = new Vector3(19.25, 0, 0);
export let platform2Position = new Vector3(-19.25, 0, 0);

let ball: any = null;
let platform1: any = null;
let platform2: any = null;

let mirror = 1;

export function resetVariables() {
    ball = null;
    platform1 = null;
    platform2 = null;
    ballPosition = new Vector3(0, 0, 0);
    platform1Position = new Vector3(19.25, 0, 0);
    platform2Position = new Vector3(-19.25, 0, 0);
    mirror = 1;
}

export const createSceneGame = async function (engine: Engine, canvas: HTMLCanvasElement): Promise<Scene> {
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
    createArena(scene);

    ball = createSphere(scene);
    ball.position = ballPosition;

    platform1 = createPlatform(scene, new Color3(1, 0.5, 0));
    platform1.position = platform1Position;
    platform1.rotation.x = Math.PI / -2;
    platform1.rotation.y = Math.PI / 2;

    platform2 = createPlatform(scene, new Color3(0, 1, 1));
    platform2.position = platform2Position;
    platform2.rotation.x = Math.PI / 2;
    platform2.rotation.y = Math.PI / 2;

    return scene;
};

export function updateBallAndPlatforms(ballPos: { x: number, y: number, z: number }, platform1Pos: { x: number, y: number, z: number }, platform2Pos: { x: number, y: number, z: number }) {
    if (ball) {
        ball.position.set(ballPos.x * mirror, ballPos.y, ballPos.z);
        // console.log("Ball position updated:", ball.position);
    }
    if (platform1) {
        platform1.position.set(platform1Pos.x * mirror, platform1Pos.y, platform1Pos.z);
        // console.log("Platform 1 position updated:", platform1.position);
    }
    if (platform2) {
        platform2.position.set(platform2Pos.x * mirror, platform2Pos.y, platform2Pos.z);
        // console.log("Platform 2 position updated:", platform2.position);
    }
    // console.log("Positions updated:");
}

export function teamPing(team: string) {
    mirror = -1;
    platform1.rotation.x = Math.PI / 2;
    platform2.rotation.x = Math.PI / -2;
}
