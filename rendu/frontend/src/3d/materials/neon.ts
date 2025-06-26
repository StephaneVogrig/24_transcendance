import { Scene, StandardMaterial, Color3} from '@babylonjs/core';

export function createNeonMaterial(scene: Scene, color: Color3): StandardMaterial {
  const neonMat = new StandardMaterial("neonMat", scene);
  neonMat.emissiveColor = color;
  neonMat.diffuseColor = Color3.Black();
  neonMat.specularColor = Color3.Black();
  return neonMat;
}