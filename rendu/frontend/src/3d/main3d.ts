import { Socket } from "socket.io-client";
import { Engine } from '@babylonjs/core';
import { createSceneGame, resetVariables } from './scenes/sceneGame';
import { InputManager } from './inputManager';

export class BabylonGame {
    private static instance: BabylonGame | null = null;
    private engine: Engine | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private inputManager: InputManager | null = null;
    private isInitialized: boolean = false;

    private constructor() {}

    public static getInstance(): BabylonGame {
        if (! BabylonGame.instance)
            BabylonGame.instance = new BabylonGame();
        return BabylonGame.instance;
    }

    public setHomeLink(homeLink: HTMLButtonElement) {
        if (!this.inputManager) {
            throw new Error("InputManager is not initialized.");
        }
        this.inputManager.setHomeLink(homeLink);
    }

    public async initialize(canvas: HTMLCanvasElement) {
        if (this.isInitialized)
            return;

        if (!canvas) {
            throw new Error("canvas element is null or not found.");
        }

        this.canvas = canvas;
        this.engine = new Engine(canvas, true);
        this.inputManager = new InputManager();
        this.isInitialized = true;

        resetVariables();

        const scene = await createSceneGame(this.engine, this.canvas);

        this.engine.runRenderLoop(() => {
            scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine?.resize();
        });
    }

    public update() {
        this.engine?.resize();
    }

	public setSocket2(socket: Socket) {
		this.inputManager?.setSocket2(socket);
	}
}
