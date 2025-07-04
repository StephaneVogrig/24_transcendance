import * as Utils from './utils.js';

/* Player has:
 * name (string)
 * score (uint8)
 */

/* Match has:
 * player1: Player
 * player2: Player
 */

/* Round has:
 * An array of Match[Player, Player]
 */

/* Tournament has:
 * id: index of the tournament
 * players: players participating in the tournament (name: string, score: uint8)
 * rounds: array of Round
 * status: open, ongoing, ended (open: new players can join, ongoing: tournament is being played, ended: winner has been chosen)
 * roundIndex: index of current Round
 * createdAt: Date
 */

let TOTAL_TOURNAMENTS = 0;

// Stores all Tournament objects
export let TOURNAMENT_LIST = {};

async function deleteTournamentFromDb(id)
{
	try
	{
		const response = await fetch(`http://database:3003/api/database/tournament/delete`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({id: id})
		});

		if (!response.ok) {
			const err = await response.text();
			throw new Error(err);
		}
	} catch (err)
	{
		throw new Error(err);
	}
}

async function modifyTournamentInDb(tournament)
{
	try
	{
		const response = await fetch(`http://database:3003/api/database/tournament/modify`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ tournament })
		});

		if (!response.ok) {
			const err = await response.text();
			throw new Error(err);
		}
	} catch (err)
	{
		throw new Error(err);
	}
}

async function registerTournamentToDb(tournament)
{
	try {
		const response = await fetch(`http://database:3003/api/database/tournament/create`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ tournament })
		});

		if (!response.ok) {
        	const err = await response.text();
        	throw new Error(err);
    	}

    	console.log('Registered tournament to database.');
    } catch (error) {
    	console.log(`Error while registering tournament to database: ${error.message}.`);
    }
}

export async function createTournament(name)
{
	const tmp = name;
	name = name.trim();
	if (name.length < 1)
		throw new Error(`Couldn't create tournament: name '${tmp}' is invalid.`);
	const tournament = {
		id: TOTAL_TOURNAMENTS,
		players: [{name: name, score: 0}],
		playerCount: 1,
		rounds: [],
		status: 'open',
		roundIndex: 0,
		createdBy: name,
		createdAt: new Date().toISOString()
	};
	TOURNAMENT_LIST[tournament.id] = tournament;
	TOTAL_TOURNAMENTS++;
	await registerTournamentToDb(tournament);
	return tournament;
}

export async function deleteTournament(id)
{
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`Couldn't delete tournament: ID '${id}' is invalid.`);
	await deleteTournamentFromDb(id);
	delete TOURNAMENT_LIST[id];
}

export async function startTournament(tournament)
{
	tournament.status = 'ongoing';
	tournament.rounds = [generateBracket(tournament.players)];
	await modifyTournamentInDb(tournament);
}

export function findTournament()
{
	const tournaments = Object.values(TOURNAMENT_LIST)
		.filter(t => t.status === 'open' && t.playerCount < 4)
		.sort((a, b) => b.players.length - a.players.length);
	if (tournaments.length < 1)
		throw new Error("No tournaments available right now.");
	return tournaments[0];
}

export async function joinTournament(id, name)
{
	const tmp = name;
	const tournament = getTournament(id);
	name = name.trim();
	if (tournament.status !== 'open')
		throw new Error(`Tournament ${id} is full, ongoing or finished.`);
	if (tournament.players.find(p => p.name === name))
		throw new Error("Duplicate names in tournament!");
	tournament.players.push({name: name, score: 0});
	tournament.playerCount++;
	TOURNAMENT_LIST[tournament.id] = tournament;
	await modifyTournamentInDb(tournament);
}

export function getCurrentRound(id)
{
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in getCurrentRound call.`);
	return tournament.rounds[tournament.roundIndex];
}

export function getOngoingTournaments()
{
	return Object.values(TOURNAMENT_LIST).filter(t => t.status === 'ongoing');
}

export async function updatePlayerScore(id, name, score)
{
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in updatePlayerScore call.`);
	for (const match of tournament.rounds[tournament.roundIndex])
	{
		if (match.length !== 2)
			continue;
		if (match[0].name === name)
		{
			match[0].score = score;
			TOURNAMENT_LIST[tournament.id] = tournament;
			await modifyTournamentInDb(tournament);
			return;
		}
		else if (match[1].name === name)
		{
			match[1].score = score;
			TOURNAMENT_LIST[tournament.id] = tournament;
			await modifyTournamentInDb(tournament);
			return;
		}
	}
	throw new Error(`Player "${name}" not found in current round.`);
}

export function getTournament(id) {
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in getTournament call.`);
	return tournament;
}

function generateNextRound(pairedPlayers)
{
	if (pairedPlayers.length % 2 === 1)
		throw new Error("There must be an even number of players!");
	let winners = [];
	for (let i = 0; i < pairedPlayers.length; i++)
		winners[i] = (pairedPlayers[i][0].score > pairedPlayers[i][1].score ? pairedPlayers[i][0] : pairedPlayers[i][1]);
	return winners;
}

export function getWinner(id)
{
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in getWinner call.`);
	const round = tournament.rounds[tournament.roundIndex];
	if (round.length > 1)
		throw new Error(`No winners yet for tournament ID ${id} .`);
	if (round[0][0].score === undefined || round[0][1].score === undefined)
		throw new Error("Final match's score is still undefined.");
	return round[0][0].score > round[0][1].score ? round[0][0] : round[0][1];
}

export async function advanceToNextRound(id)
{
	let tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in advanceToNextRound call.`);
	const ongoingRound = tournament.rounds[tournament.roundIndex];
	const nextPlayers = generateNextRound(ongoingRound);
	if (nextPlayers.length === 1)
	{
		tournament.status = 'ended';
		try {
			const response = await fetch(`http://blockchain:3003/api/blockchain/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tournament })
			});

			if (!response.ok) {
				const err = await response.text();
				throw new Error(err);
			}

			console.log('Registered tournament to blockchain.');
		} catch (error) {
			console.log(`Error while registering tournament to blockchain: ${error.message}.`);
		}
	}
	else
	{
		tournament.rounds.push(generateBracketInOrder(nextPlayers));
		tournament.roundIndex++;
	}
	TOURNAMENT_LIST[tournament.id] = tournament;
	await modifyTournamentInDb(tournament);
}

function generateBracketInOrder(players) {
    if (players.length % 2 === 1)
        throw new Error("There must be an even number of players!");
    let pairedPlayers = [];
    for (let i = 0; i < players.length; i += 2)
        pairedPlayers.push([players[i], players[i + 1]]);
    return pairedPlayers;
}

function generateBracket(players)
{
	if (players.length % 2 === 1)
		throw new Error("There must be an even number of players!");
	const indexes = Utils.generateIndexes(players.length);
	let bracketPlayers = [];
	for (let i = 0; i < indexes.length; i++)
		bracketPlayers[i] = players[indexes[i]];
	let pairedPlayers = [];
	let j = 0;
	for (let i = 0; i < bracketPlayers.length; i += 2)
	{
		pairedPlayers[j] = [bracketPlayers[i], bracketPlayers[i + 1]];
		j++;
	}
	return pairedPlayers;
}
