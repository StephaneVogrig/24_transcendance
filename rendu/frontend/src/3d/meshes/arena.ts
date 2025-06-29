import { MeshBuilder, TransformNode, Scene, Color3, Vector3 } from "@babylonjs/core";
import { createNeonMaterial } from "../materials/neon";

export function createArena(scene : Scene): TransformNode {
  const arena = new TransformNode("arena", scene);

  const rightTop = MeshBuilder.CreateCylinder("arenaBase", {
    diameter: 0.2,
    height: 40,
    tessellation: 64,
  }, scene);
  rightTop.material = createNeonMaterial(scene, new Color3(0, 1, 1));
  rightTop.position = new Vector3(0.5, 0, -10);

  const leftTop = MeshBuilder.CreateCylinder("arenaBase", {
    diameter: 0.2,
    height: 40,
    tessellation: 64,
  }, scene);
  leftTop.material = createNeonMaterial(scene, new Color3(0, 1, 1));
  leftTop.position = new Vector3(0.5, 0, 10);

    const rightBottom = MeshBuilder.CreateCylinder("arenaBase", {
        diameter: 0.2,
        height: 40,
        tessellation: 64,
    }, scene);

  rightBottom.material = createNeonMaterial(scene, new Color3(0, 1, 1));
  rightBottom.position = new Vector3(-0.5, 0, -10);

  const leftBottom = MeshBuilder.CreateCylinder("arenaBase", {
    diameter: 0.2,
    height: 40,
    tessellation: 64,
  }, scene);
    leftBottom.material = createNeonMaterial(scene, new Color3(0, 1, 1));
    leftBottom.position = new Vector3(-0.5, 0, 10);

  rightTop.parent = arena;
  leftTop.parent = arena;
  rightBottom.parent = arena;
  leftBottom.parent = arena;
  arena.rotation.z = Math.PI / 2;
  return arena;
}
