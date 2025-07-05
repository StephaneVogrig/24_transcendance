import * as Paddle from './Paddle.js';
import * as Ball from './Ball.js';
import { Player } from './Player.js';

export class Game {

    constructor( { player1, player2 }) {
		this.player1 = new Player(player1, 'left');
        this.player2 = new Player(player2, 'right');
        this.ball = new Ball.Ball([this.player1, this.player2]);
        this.start();
    }

    start()
    {
        const loop = () => {
            this.player1.inputManager();
            this.player2.inputManager();
            this.ball.move(this.player1.getPaddle(), this.player2.getPaddle());
            setTimeout(loop, 1000 / 120);
        };
        loop();
    }

    inputManager(player, key, action)
    {
        console.log(`Game inputManager: player=${player}, key=${key}, action=${action}`);
        if (!player || !key || !action)
            throw new Error('Player, key, and action are required');
        if (player === this.player1.getName())
        {
            if (key === 'ArrowLeft')
                this.player1.upPressed = action === 'keydown';
            else if (key === 'ArrowRight')
                this.player1.downPressed = action === 'keydown';
        }
        else if (player === this.player2.getName())
        {
            if (key === 'ArrowLeft')
                this.player2.upPressed = action === 'keydown';
            else if (key === 'ArrowRight')
                this.player2.downPressed = action === 'keydown';
        }
    }
}
