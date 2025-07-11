import * as Paddle from './Paddle.js';
import * as Ball from './Ball.js';
import { Player } from './Player.js';

export class Game {

    constructor( { player1, player2, gameId }) {
		this.player1 = new Player(player1, 'left');
        this.player2 = new Player(player2, 'right');
        this.player1ready = false;
        this.player2ready = false;
        this.ball = new Ball.Ball([this.player1, this.player2]);
        this.gameId = gameId;
        this.stopBoolean = false;
        this.start();
    }

    async redirectPlayer( playerName )
    {
        try {
            const response = await fetch(`http://websocket:3008/api/websocket/redirect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: playerName,
                    gameId: this.gameId
                })
            });
            
            if (!response.ok) {
                return false;
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    async sendStart()
    {
        try {
            const response = await fetch(`http://websocket:3008/api/websocket/startGame`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    player1Name: this.player1.getName(),
                    player2Name: this.player2.getName(),
                    gameId: this.gameId
                })
            });
            
            if (!response.ok) {
                console.error('Failed to start the game:', response.statusText);
                // throw new Error('Failed to start the game');
            }
        } catch (error) {
            console.error('Error starting the game:', error);
            throw error;
        }
    }

    async start()
    {
        try {
            console.log(`Game started with players: ${this.player1.getName()} and ${this.player2.getName()}`);
            const [player1RedirectStatus, player2RedirectStatus] = await Promise.all([
                this.redirectPlayer(this.player1.getName()),
                this.redirectPlayer(this.player2.getName())
            ]);
            console.log(`motclefpourlegrep`);
            console.log(`motclefpourlegrep`);

            let i = 0;
            this.sendStart();
            while (i < 3) {
                await new Promise(r => setTimeout(r, 1000));
                i++;
                console.log(`Game starting in ${3 - i} seconds...`);
            }

            const loop = () => {
                if (this.stopBoolean) {
                    console.log('Game loop stopped');
                    return;
                }
                this.player1.inputManager();
                this.player2.inputManager();
                this.ball.move(this.player1.getPaddle(), this.player2.getPaddle());
                setTimeout(loop, 1000 / 120);
            };
            loop();
        } catch (error) {
            console.error('Error starting the game:', error);
        }
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

    stop() {
        console.log(`Game stopped: ${this.player1.getName()} vs ${this.player2.getName()}`);
        this.stopBoolean = true;
    }
}
