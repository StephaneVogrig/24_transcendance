
import { Paddle } from './Paddle.js';

export class Player {
    constructor(name, side)
    {
        this.name = name;
        this.side = side;
        this.score = 0;
        this.paddle = new Paddle(side);
        this.upPressed = false;
        this.downPressed = false;
    }

    getPaddle()
    {
        return this.paddle;
    }

    getName()
    {
        return this.name;
    }

    getScore()
    {
        return this.score;
    }

    incrementScore()
    {
        this.score++;
    }

    inputManager()
    {
        console.log(`Player ${this.name} inputManager: upPressed=${this.upPressed}, downPressed=${this.downPressed}`);
        if (this.upPressed)
            this.paddle.moveUp();
        if (this.downPressed)
            this.paddle.moveDown(); 
    }
}