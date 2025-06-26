import { MeshBuilder, Scene, Mesh, StandardMaterial, Color3, Texture } from '@babylonjs/core';
import { createMetalMaterial } from '../materials/metal';

export function createSphere(scene: Scene): Mesh {
    const sphere = MeshBuilder.CreateSphere("sphere", {
        diameter: 2,
        segments: 32
    }, scene);

  sphere.material = createMetalMaterial(scene);

  return sphere;
}