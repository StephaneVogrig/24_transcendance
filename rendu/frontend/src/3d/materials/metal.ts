import { Scene, CubeTexture, Color3, PBRMaterial } from '@babylonjs/core';

export function createMetalMaterial(scene: Scene): PBRMaterial {
  const metalMat = new PBRMaterial("metalMat", scene);

  if (!scene.environmentTexture) {
    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(
      "public/assets/sky.env", scene
    );
  }
  metalMat.albedoColor = new Color3(1, 1, 1);
  metalMat.metallic = 0.95;
  metalMat.roughness = 0.01;

  return metalMat;
}