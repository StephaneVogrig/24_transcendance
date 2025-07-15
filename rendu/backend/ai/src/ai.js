import io from 'socket.io-client';

let GAMES = new Map();
let socket = null;

export async function createAI(name)
{
    try {
        if (!name)
            throw new Error("Player needed for call to createAI");
        if (GAMES.has(name + "AI"))
            throw new Error("Player is already in a game.");

        GAMES.set(name + "AI", {player: name, leftPressed: false, rightPressed: false});

        const player = name;
        const playerAI = name + "AI";

        // Socket AI
        const socketConnection = new Promise((resolve, reject) => {
            socket = io('http://websocket:3008', {
                path: '/my-websocket/'
            });

            socket.on('connect', () => {
                console.log(`AI socket connected for ${playerAI} with ID: ${socket.id}`);
                socket.emit('identify_player', { name: playerAI });
                resolve(socket);
            });

            socket.on('connect_error', (err) => {
                console.error(`AI socket connection error for ${playerAI}: ${err.message}`);
                reject(new Error(`Socket connection error: ${err.message}`));
            });

            socket.on('redirect', ({ gameId, playerName }) => {
                console.log(`GameAIPage: Redirecting to game ${gameId} for player ${playerName}`);
            });
        });

        await socketConnection;

        const response = await fetch(`http://game:3004/api/game/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player1: player, player2: playerAI, maxScore: 5 })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err);
        }

        socket.emit('join', { name: playerAI });

        await new Promise(r => setTimeout(r, 1000));
        socket.emit('acceptGame');

    // 	console.log(`Starting match between ${player1} and ${player2}`);
    } catch (error) {
        console.log(`Error while starting match between AI and ${player}: ${error.message}.`);
    }
}

export async function getInput(gameId)
{
    let game = GAMES.get(gameId);
    const response = await fetch(`http://game:3004/api/game/state?player=${game.player}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok)
        throw new Error(`Couldn't get game state for ${gameId}`);

    const { player1, player2, ball, ballspeed, paddle } = {
        player1: game.player1,
        player2: game.player2,
        ball: game.ball,
        ballspeed: game.ballspeed,
        paddle: game.player2.paddle
    };

    console.log(`p1: ${player1} | p2: ${player2} | ball: ${ball} | ballspeed: ${ballspeed} | paddle: ${paddle}`);
}
