import Fastify from 'fastify';

async function sendstart(player1, player2) {
    try {
        const response = await fetch(`http://game:3004/api/game/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player1: player1,
                player2: player2,
                maxScore: 5,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            console.error('start :Failed to send to game logic:', response.status);
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error('start: Error communicating with game logic service:', error);
        return false;
    }
}


let players = [];

const gameSessions = [];

function removePlayerFromSession(playerName) {
    const session = gameSessions.find(s => s.players1 && s.players1.name === playerName || s.players2 && s.players2.name === playerName);
    if (!session)
        throw new Error(`No session found for player ${playerName}`);
    if (session.players1 && session.players1.name === playerName)
        session.players1 = undefined;
    else if (session.players2 && session.players2.name === playerName)
        session.players2 = undefined;
    if (!session.players1 && !session.players2) {
        session.status = 'waiting';
        console.log(`Game session ${session.gameId} is now waiting for players`);
    } else {
        console.log(`Player ${playerName} removed from session ${session.gameId}`);
    }
}

async function addPlayerToSession(playerName) {
    const session = getOrCreateGameSession();
    if (!session.players1) {
        session.players1 = { name: playerName };
    } else if (!session.players2) {
        session.players2 = { name: playerName };
    } else {
        throw new Error('Game session is full');
    }
    if (session.players1 && session.players2) {
        session.status = 'ready';
        await new Promise(r => setTimeout(r, 500));
        if (!session.players1 || !session.players2) {
            console.error(`Game session ${session.gameId} is not ready, missing players`);
            session.status = 'waiting';
            return;
        }
        console.log(`Game session ${session.gameId} is ready with players: ${session.players1.name} and ${session.players2.name}`);
        sendstart(session.players1.name, session.players2.name);
        console.log(`Starting game session ${session.gameId} with players: ${session.players1.name} and ${session.players2.name}`);
    }
}

function getOrCreateGameSession() {
    let session = gameSessions.find(s => s.status === 'waiting' && (!s.players1 || !s.players2));
    if (!session) {
        session = {
            players1: undefined,
            players2: undefined,
            gameId: `game-${gameSessions.length + 1}`,
            status: 'waiting'
        };
        gameSessions.push(session);
    }
    return session;
}

export function removePlayer(name) {
    const index = players.findIndex(p => p.name === name);
    if (index === -1) {
        throw new Error(`Player ${name} not found`);
    }
    players.splice(index, 1);
    console.log(`Player ${name} removed`);
    removePlayerFromSession(name);
}

export function addPlayer(name) {
    if (!name || typeof name !== 'string')
        throw new Error('Player name is required and must be a string');
    if (players.some(p => p.name === name))
        throw new Error(`Player ${name} already exists`);
    players.push({ name });
    addPlayerToSession(name, getOrCreateGameSession());
}
