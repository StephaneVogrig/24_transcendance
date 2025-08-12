import { log } from '../shared/fastify.js';

export async function createEmptyTournament() {
    const response = await fetch(`http://database:3003/tournament/createEmpty`, {
        method: 'POST'
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
    }

    const result = await response.json();
    log.debug({name: `createEmptyTournament`}, `Tournament created with id: ${result.id}`);
    return result.id;
}

export async function updateTournament(tournament) {
    const response = await fetch(`http://database:3003/tournament/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournament })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
    }
}
