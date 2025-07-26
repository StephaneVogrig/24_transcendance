import { MeshBuilder, TransformNode, Scene, Vector3 } from "@babylonjs/core";
import { createMetalMaterial } from "../materials/metal";

export function createOrnement(scene : Scene): TransformNode {
  const ornement = new TransformNode("ornement", scene);

  const ornementRight = MeshBuilder.CreateCylinder("ornement", {
    diameter: 2.0,
    height: 0.5,
    tessellation: 64,
  }, scene);
  ornementRight.material = createMetalMaterial(scene);
  ornementRight.position = new Vector3(0, 0, -10);
  ornementRight.rotation.x = Math.PI / 2;

    const ornementLeft = MeshBuilder.CreateCylinder("ornement", {
        diameter: 2.0,
        height: 0.5,
        tessellation: 64,
    }, scene);
    ornementLeft.material = createMetalMaterial(scene);
    ornementLeft.position = new Vector3(0, 0, 10);
    ornementLeft.rotation.x = Math.PI / 2;

  ornementLeft.parent = ornement;
  ornementRight.parent = ornement;
  ornement.rotation.z = Math.PI / 2;
  return ornement;
}
