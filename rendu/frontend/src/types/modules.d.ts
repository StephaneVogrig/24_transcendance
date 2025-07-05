// Déclarations de modules pour éviter les erreurs de build
declare module 'socket.io-client' {
  export function io(url: string, options?: any): any;
  export * from 'socket.io-client';
}

declare module '@babylonjs/core' {
  export * from '@babylonjs/core';
  export class Engine {
    constructor(canvas: HTMLCanvasElement, antialias?: boolean);
    runRenderLoop(fn: () => void): void;
    resize(): void;
  }
  export class Scene {
    constructor(engine: Engine);
    render(): void;
  }
  export class ArcRotateCamera {
    constructor(name: string, alpha: number, beta: number, radius: number, target: any, scene: Scene);
    attachToCanvas(canvas: HTMLCanvasElement): void;
    attachControl(canvas: HTMLCanvasElement, noPreventDefault?: boolean): void;
    lowerRadiusLimit: number;
    upperRadiusLimit: number;
    lockedTarget: Vector3;
    inputs: {
      remove(input: any): void;
      attached: {
        keyboard: any;
      };
    };
  }
  export class Vector3 {
    constructor(x: number, y: number, z: number);
    static Zero(): Vector3;
    set(x: number, y: number, z: number): void;
    x: number;
    y: number;
    z: number;
  }
  export class Color3 {
    constructor(r: number, g: number, b: number);
  }
  export class HemisphericLight {
    constructor(name: string, direction: Vector3, scene: Scene);
    intensity: number;
  }
  export class GlowLayer {
    constructor(name: string, scene: Scene);
    intensity: number;
  }
  export class MeshBuilder {
    static CreateSphere(name: string, options: any, scene: Scene): any;
    static CreateCylinder(name: string, options: any, scene: Scene): any;
    static CreateBox(name: string, options: any, scene: Scene): any;
    static CreateGround(name: string, options: any, scene: Scene): any;
  }
  export class TransformNode {
    constructor(name: string, scene: Scene);
    position: Vector3;
    rotation: Vector3;
    parent: TransformNode | null;
  }
  export class Mesh extends TransformNode {
    material: any;
  }
  export class StandardMaterial {
    constructor(name: string, scene: Scene);
    diffuseTexture: any;
    emissiveColor: Color3;
  }
  export class Texture {
    static CreateFromBase64String(data: string, name: string, scene: Scene): Texture;
  }
}
