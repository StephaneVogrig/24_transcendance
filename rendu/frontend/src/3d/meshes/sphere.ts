import { MeshBuilder, Scene, Mesh } from '@babylonjs/core';
// import { StandardMaterial, Color3, Texture } from '@babylonjs/core'; // Commenté car non utilisé
import { createMetalMaterial } from '../materials/metal';

export function createSphere(scene: Scene): Mesh {
    const sphere = MeshBuilder.CreateSphere("sphere", {
        diameter: 2,
        segments: 32
    }, scene);

  sphere.material = createMetalMaterial(scene);

  return sphere;
}