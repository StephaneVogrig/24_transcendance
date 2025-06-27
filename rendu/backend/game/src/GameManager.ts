import {Game} from './Game.ts'
import {Paddle} from "./gameObjects/Paddle.ts";
import * as Vec2D from "vector2d";

export class GameManager {

// Attributes

    private _games = new Map<[string, string], Game>();

// Accessors

    public get games() {
        return this._games;
    }

    public getGames() {
        return this._games;
    }

    private createPair(firstPlayer: string, secondPlayer: string): [string, string] {
        if (firstPlayer > secondPlayer)
            return [firstPlayer, secondPlayer];
        return [secondPlayer, firstPlayer];
    }

    registerGame(firstPlayer: string, secondPlayer: string): boolean {
        const pair = this.createPair(firstPlayer, secondPlayer);
        // Check if game already exists
        if (this._games.has(pair)) {
            return false;
        }
        // Checks if players are already in a game
        for (const [[player1, player2], _] of this._games.entries()) {
            if (player1 === firstPlayer || player1 === secondPlayer
                || player2 === firstPlayer || player2 === secondPlayer) {
                return false;
            }
        }
        // Add players to a game
        let leftPaddle = new Paddle(pair[0], new Vec2D.Vector(9, 0));
        let rightPaddle = new Paddle(pair[1], new Vec2D.Vector(-9, 0));
        this._games.set(pair, new Game().joinTeam(leftPaddle, "left").joinTeam(rightPaddle, "right"));
        return true;
    }

    stopGame(firstPlayer: string, secondPlayer: string): boolean {
        const pair = this.createPair(firstPlayer, secondPlayer);
        // Check if game exists
        if (!this._games.has(pair)) {
            return false;
        }
        // Stops the game
        this._games.get(pair)!.state = "ended";
        this._games.delete(pair);
        return true;
    }

    async startGame(firstPlayer: string, secondPlayer: string): Promise<number[]> {
        const pair = this.createPair(firstPlayer, secondPlayer);
        // Check if game exists
        if (!this._games.has(pair)) {
            return [];
        }
        const currGame = this._games.get(pair)!;
        currGame.start();
        while (currGame.state !== "ended") {
            await new Promise((res) => setTimeout(res, 1000));
        }
        return currGame.score;
    }

    receiveInput(playerID: string, info: [boolean, boolean]): boolean {
        for (const [[player1, player2], game] of this._games.entries())
            if (player1 === playerID || player2 === playerID)
                return game.handleClientInput(playerID, info);
        return false;
    }

    getGameInfo(firstPlayer: string, secondPlayer: string = "") {
        if (!secondPlayer.length)
            return this._games.get(this.createPair(firstPlayer, secondPlayer));
        for (const [[player1, player2], game] of this._games.entries())
            if (player1 === firstPlayer || player2 === firstPlayer)
                return game;
        return undefined;
    }

}