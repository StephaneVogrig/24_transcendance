import * as Game from './Game.js';

let map = new Map();

function createMatchKey(player1, player2) {
    if (!player1 || !player2)
        throw new Error('Both player1 and player2 are required to create a match key');
    return [player1, player2].sort().join('-');
}

export function addMatch(player1, player2, maxScore) {
    const key = createMatchKey(player1, player2);
    if (map.has(key))
        throw new Error(`Match already exists for players ${player1} and ${player2}`);
    map.set(key, new Game.Game({ player1, player2, gameId: key, maxScore }));
}

export function deleteMatch(player1, player2) {
    const key = createMatchKey(player1, player2);
    if (!map.has(key))
        throw new Error(`No match found for players ${player1} and ${player2}`);
    map.delete(key);
}

export async function stopMatch(player) {
    for (const [key, game] of map.entries()) {
        if (key.includes(player)) {
            await game.stop(player);
            map.delete(key);
            return;
        }
    }
}

export function findMatch(player) {
    for (const [key, game] of map.entries())
        if (key.includes(player))
            return game;
    return undefined;
}
