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
const MAX_SCORE = 10;

// Stores all Tournament objects
export let TOURNAMENT_LIST = {};

function playerExistsInAnyTournament(name)
{
	for (const tournament of Object.values(TOURNAMENT_LIST))
	{
		if (tournament.players)
		{
			for (const player of tournament.players)
				if (player.name && player.name === name)
					return (true);
		}
	}
	return (false);
}

function findTournamentWithPlayer(name)
{
	for (const tournament of Object.values(TOURNAMENT_LIST))
	{
		if (tournament.players)
		{
			for (const player of tournament.players)
				if (player.name && player.name === name)
					return (tournament);
		}
	}
	return (undefined);
}

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


export async function getMatches()
{
	return Object.values(TOURNAMENT_LIST);
}

async function startMatches(bracket)
{
	for (const players of bracket)
	{
		try {
			const player1 = players[0].name;
			const player2 = players[1].name;
			const response = await fetch(`http://game:3004/api/game/start`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				// body: JSON.stringify({ player1, player2, maxScore: MAX_SCORE })
				body: JSON.stringify({ player1, player2, maxScore: MAX_SCORE }) // pour test affichage match -> Stephanie
			});

			if (!response.ok) {
				const err = await response.text();
				throw new Error(err);
			}

			console.log(`Starting match between ${player1} and ${player2}`);
		} catch (error) {
			console.log(`Error while starting match: ${error.message}.`);
		}
	}
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
	TOURNAMENT_LIST[tournament.id] = tournament;
	await modifyTournamentInDb(tournament);
	await startMatches(tournament.rounds[tournament.roundIndex]);
}

export function findTournament()
{
	const tournaments = Object.values(TOURNAMENT_LIST)
		.filter(t => t.status === 'open' && t.playerCount < 4)
		.sort((a, b) => b.players.length - a.players.length);
	if (tournaments.length < 1)
		return undefined;
	return tournaments[0];
}

export async function joinTournament(name)
{
	const tmp = name;
	name = name.trim();
	if (playerExistsInAnyTournament(name))
		throw new Error(`Couldn't join tournament: name '${name}' is already in a tournament.`);
	if (name.length < 3)
		throw new Error(`Couldn't create tournament: name '${tmp}' is invalid.`);
	const tournament = findTournament();
	if (!tournament)
		return createTournament(name);
	if (tournament.status !== 'open')
		throw new Error(`Tournament ${id} is full, ongoing or finished.`);
	tournament.players.push({name: name, score: 0});
	tournament.playerCount++;
	if (tournament.playerCount === 4)
		await startTournament(tournament);
	await modifyTournamentInDb(tournament);
	return tournament;
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

export async function updatePlayerScores(players)
{
	const tournament = findTournamentWithPlayer(players[0].name);
	if (!tournament)
		return false;
	let hasWinner = false;
	for (const match of tournament.rounds[tournament.roundIndex]) {
		for (const player of match) {
			if (player.score === MAX_SCORE) {
				hasWinner = true;
				break;
			}
		}
		if (hasWinner)
			break;
	}
	for (const match of tournament.rounds[tournament.roundIndex])
	{
		if (match.length !== 2)
			continue;
		const namesInMatch = match.map(p => p.name);
		const namesToUpdate = players.map(p => p.name);
		if (namesToUpdate.every(name => namesInMatch.includes(name))) {
			for (const player of match) {
				const updated = players.find(p => p.name === player.name);
				if (updated)
					player.score = updated.score;
			}
			if (hasWinner)
				await advanceToNextRound(tournament.id);
			await modifyTournamentInDb(tournament);
			return true;
		}
	}
	return false;
}

export function getTournament(id) {
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in getTournament call.`);
	return tournament;
}

function generateNextRound(pairedPlayers)
{
	if (pairedPlayers.length === 1)
		return [pairedPlayers[0][0]];
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

export async function addRawTournament(tournament)
{
	TOURNAMENT_LIST[TOTAL_TOURNAMENTS] = tournament;
	TOTAL_TOURNAMENTS++;
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
			const response = await fetch(`http://blockchain:3002/api/blockchain/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({tournament})
			});

			if (!response.ok) {
				const err = await response.text();
				throw new Error(err);
			}

			const hash = await response.text();

			console.log('Registered tournament to blockchain.');
			console.log(`Transaction link: https://subnets-test.avax.network/c-chain/tx/${hash}`);
		} catch (error) {
			console.log(`Error while registering tournament to blockchain: ${error.message}.`);
		}
	}
	else
	{
		tournament.rounds.push(generateBracketInOrder(nextPlayers));
		tournament.roundIndex++;
		await startMatches(tournament.rounds[tournament.roundIndex]);
	}
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
