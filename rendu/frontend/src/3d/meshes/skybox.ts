import { MeshBuilder, Scene, Mesh, StandardMaterial, Color3, Texture } from '@babylonjs/core';

export function createSky(scene: Scene): void {
    const skyDome = MeshBuilder.CreateSphere("skyDome", { segments: 32, diameter: -1000, sideOrientation: Mesh.BACKSIDE }, scene);
    const skyMaterial = new StandardMaterial("skyMat", scene);
    skyMaterial.backFaceCulling = false;
    skyMaterial.diffuseColor = new Color3(0, 0, 0);
    skyMaterial.specularColor = new Color3(0, 0, 0);
    skyMaterial.emissiveTexture = new Texture("public/assets/sky.jpg", scene);
    skyMaterial.emissiveColor = new Color3(0, 0, 0);
    skyDome.material = skyMaterial;
}