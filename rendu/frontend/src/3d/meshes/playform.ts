import { MeshBuilder, TransformNode, Scene, Color3 } from "@babylonjs/core";
import { createMetalMaterial } from "../materials/metal";
import { createNeonMaterial } from "../materials/neon";

export function createPlatform(scene : Scene): TransformNode {
  const platform = new TransformNode("platform", scene);

  const base = MeshBuilder.CreateCylinder("platformBase", {
    diameter: 4,
    height: 0.5,
    tessellation: 64,
  }, scene);
  base.material = createMetalMaterial(scene);

  const ring = MeshBuilder.CreateTorus("neonRing", {
    diameter: 4.2,
    thickness: 0.1,
    tessellation: 64,
  }, scene);
  ring.position.y = 0.3;
  ring.material = createNeonMaterial(scene, new Color3(0, 1, 1));

  const ring2 = MeshBuilder.CreateTorus("neonRing", {
    diameter: 1.2,
    thickness: 0.1,
    tessellation: 64,
  }, scene);
  ring2.position.y = 0.3;
  ring2.material = createNeonMaterial(scene, new Color3(0, 1, 1));

  base.parent = platform;
  ring.parent = platform;
  ring2.parent = platform;
  return platform;
}
