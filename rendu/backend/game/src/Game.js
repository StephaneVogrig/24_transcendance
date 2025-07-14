import * as Paddle from './Paddle.js';
import * as Ball from './Ball.js';
import { Player } from './Player.js';
import { stopMatch } from './gameManager.js';

export class Game {

    constructor( { player1, player2, gameId, maxScore }) {
		this.player1 = new Player(player1, 'left');
        this.player2 = new Player(player2, 'right');
        this.maxScore = maxScore;
        this.player1ready = false;
        this.player2ready = false;
        this.ball = new Ball.Ball([this.player1, this.player2]);
        this.gameId = gameId;
        this.stopBoolean = false;
        this.gameStatus = 'waiting';
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
            }
        } catch (error) {
            console.error('Error starting the game:', error);
            throw error;
        }
    }

    async start()
    {
        try {
            this.sendStart();
            console.log(`Game started with players: ${this.player1.getName()} and ${this.player2.getName()}`);
            const [player1RedirectStatus, player2RedirectStatus] = await Promise.all([
                this.redirectPlayer(this.player1.getName()),
                this.redirectPlayer(this.player2.getName())
            ]);
            if (!player1RedirectStatus || !player2RedirectStatus) {
                return console.error('Failed to redirect players');
            }

            this.gameStatus = 'ready';

            console.log(`motclefpourlegrep`);
            console.log(`motclefpourlegrep`);

            let i = 0;
            while (i <= 4) {
                await new Promise(r => setTimeout(r, 1000));
                this.gameStatus = `${3 - i}`;
                i++;
                console.log(`Game starting in ${3 - i} seconds...`);
            }

            this.gameStatus = 'started';

            const loop = async () => {
                if (this.stopBoolean) {
                    console.log('Game loop stopped');
                    return;
                }
                if (this.player1.getScore() >= this.maxScore || this.player2.getScore() >= this.maxScore) {
                    this.gameStatus = 'finished';
                    await new Promise(r => setTimeout(r, 1000));
                    console.debug(`this.player1.name=${this.player1.getName()}, this.player1.getScore()=${this.player1.getScore()}, this.player2.getName()=${this.player2.getName()}, this.player2.getScore()=${this.player2.getScore()}`);
					try {
						const response = await fetch(`http://tournament:3007/api/tournament/playerscores`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								players: [{name: this.player1.getName(), score: this.player1.getScore()}, 
									{name: this.player2.getName(), score: this.player2.getScore()}]
							})
						});
					} catch (error) {}
					stopMatch(this.player1.getName());
                }
                this.player1.inputManager();
                this.player2.inputManager();
                this.ball.move(this.player1.getPaddle(), this.player2.getPaddle());
                setTimeout(loop, 1000 / 120);
            };
            loop();
        } catch (error) {
            console.error('Error starting the game:', error);
            this.gameStatus = 'error';
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
