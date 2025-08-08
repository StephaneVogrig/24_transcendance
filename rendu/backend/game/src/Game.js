import { log } from '../shared/fastify.js'
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
        this.countdownTimeoutId = null;
        this.stopCountdownResolver = null;
        this.start();
    }

    async redirectPlayer( playerName )
    {
        try {
            const response = await fetch(`http://websocket:3008/redirect`, {
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
			log.debug({gameId: this.gameId}, `Starting game in websocket for ${this.player1.getName()} and ${this.player2.getName()}`);
            const response = await fetch(`http://websocket:3008/startGame`, {
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
                log.error({gameId: this.gameId}, 'Failed to start the game in websocket ', response.statusText);
            }
        } catch (error) {
            log.error({gameId: this.gameId}, 'Error starting the game in websocket ', error);
            throw error;
        }
    }

    async sendScores()
    {
        log.debug({gameId: this.gameId}, `send scores`);
        try
        {
            await fetch(`http://tournament:3007/playerscores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    players: [{name: this.player1.getName(), score: this.player1.getScore()},
                        {name: this.player2.getName(), score: this.player2.getScore()}]
                    })
            });
        } catch (error) {
            log.error({gameId: this.gameId}, 'Error sending scores:', error);
        }
    }

    async start()
    {
        try {
            await this.sendStart();
            // log.debug({gameId: this.gameId}, `Game started with players: ${this.player1.getName()} and ${this.player2.getName()}`);
            const [player1RedirectStatus, player2RedirectStatus] = await Promise.all([
                this.redirectPlayer(this.player1.getName()),
                this.redirectPlayer(this.player2.getName())
            ]);
            if (!player1RedirectStatus || !player2RedirectStatus) {
                return log.error({gameId: this.gameId}, 'Failed to redirect players');
            }

            this.gameStatus = 'ready';

            let i = 4;
            while (i > -2) {
                const countdownPromise = new Promise(resolve => {
                    this.stopCountdownResolver = resolve;
                    this.countdownTimeoutId = setTimeout(resolve, 1000);
                });
                await countdownPromise;
                // await new Promise(r => this.countdownTimeoutId = setTimeout(r, 1000));
                if (this.stopBoolean) {
                    log.debug({gameId: this.gameId}, 'Game count stopped');
                    this.gameStatus = 'finished';
                    return;
                }
                this.gameStatus = `${i}`;
                log.debug({gameId: this.gameId}, `Game starting in ${i} seconds...`);
                i--;
            }

            this.gameStatus = 'started';

            const loop = async () => {
                if (this.stopBoolean) {
                    log.debug({gameId: this.gameId}, 'Game loop stopped');
                    this.gameStatus = 'finished';
                    return;
                }
                if (this.player1.getScore() >= this.maxScore || this.player2.getScore() >= this.maxScore) {
                    this.gameStatus = 'finished';
                    await new Promise(resolve => setTimeout(resolve, 200));
					stopMatch(this.player1.getName());
                }
                this.player1.inputManager();
                this.player2.inputManager();
                this.ball.move(this.player1.getPaddle(), this.player2.getPaddle());
                setTimeout(loop, 1000 / 120);
            };
            loop();
        } catch (error) {
            log.error({gameId: this.gameId}, 'Error starting the game:', error);
        }
    }

    inputManager(player, key, action)
    {
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

    async stop(player) {
        log.debug({gameId: this.gameId}, `stopping game: ${this.player1.getName()} vs ${this.player2.getName()}`);
        log.debug({gameId: this.gameId}, `Current gameStatus: '${this.gameStatus}'`);
        if (this.gameStatus === 'finished'){
            log.debug({gameId: this.gameId, gamestatus: this.gameStatus}, `stop game exit`)
            return;
        }
        this.stopBoolean = true;
        this.gameStatus = 'finished';
        if (this.stopCountdownResolver) {
            this.stopCountdownResolver();
            this.stopCountdownResolver = null;
        }
        if (this.countdownTimeoutId) {
            clearTimeout(this.countdownTimeoutId);
            this.countdownTimeoutId = null;
        }
        // log.debug({gameId: this.gameId}, `score reset: ${this.player1.getName()}=${this.player1.getScore()}, ${this.player2.getName()}=${this.player2.getScore()}`);

        log.debug({gameId: this.gameId}, 'waiting game stopped');
        await new Promise((resolve, reject) => {
            const checkStatus = () => {
                if (this.gameStatus === 'finished') {
                    resolve();
                } else {
                    log.trace({gameId: this.gameId}, 'waiting game stopped');
                    setTimeout(checkStatus, 50);
                }
            };

            checkStatus();

            setTimeout(() => {
                reject(new Error('Game stop timeout'));
            }, 5000);
        });

        if (player === this.player1.getName() && this.player2.getScore() < this.maxScore && this.player1.getScore() < this.maxScore)
            this.player2.score = this.maxScore;
        else if (player === this.player2.getName() && this.player1.getScore() < this.maxScore && this.player2.getScore() < this.maxScore)
            this.player1.score = this.maxScore;

        log.debug({gameId: this.gameId}, `Game stopped: ${this.player1.getName()} vs ${this.player2.getName()}`);
        await this.sendScores();
    }
}
