import { MeshBuilder, TransformNode, Scene, Color3, Vector3 } from "@babylonjs/core";
import { createNeonMaterial } from "../materials/neon";
import { createOrnement } from "./ornement";

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

  const middleLine = MeshBuilder.CreateCylinder("arenaBase", {
    diameter: 0.2,
    height: 20,
    tessellation: 64,
  }, scene);
    middleLine.material = createNeonMaterial(scene, new Color3(1, 1, 1));
    middleLine.position = new Vector3(0, 0, 0);
    middleLine.rotation.x = Math.PI / 2;

  const goal1 = MeshBuilder.CreateCylinder("arenaBase", {
    diameter: 0.2,
    height: 20,
    tessellation: 64,
  }, scene);
    goal1.material = createNeonMaterial(scene, new Color3(1, 1, 1));
    goal1.position = new Vector3(0, 20, 0);
    goal1.rotation.x = Math.PI / 2;

  const goal2 = MeshBuilder.CreateCylinder("arenaBase", {
    diameter: 0.2,
    height: 20,
    tessellation: 64,
  }, scene);

    goal2.material = createNeonMaterial(scene, new Color3(1, 1, 1));
    goal2.position = new Vector3(0, -20, 0);
    goal2.rotation.x = Math.PI / 2;
    const ornementMiddle = createOrnement(scene);
    const ornementtop = createOrnement(scene);
    ornementtop.position = new Vector3(0, -20, 0);
    const ornementbottom = createOrnement(scene);
    ornementbottom.position = new Vector3(0, 20, 0);

  rightTop.parent = arena;
  leftTop.parent = arena;
  rightBottom.parent = arena;
  leftBottom.parent = arena;
  middleLine.parent = arena;
  goal1.parent = arena;
  goal2.parent = arena;
  ornementMiddle.parent = arena;
  ornementtop.parent = arena;
  ornementbottom.parent = arena;
  arena.rotation.z = Math.PI / 2;
  return arena;
}
