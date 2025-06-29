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
 * currentRound: index of current Round
 * createdAt: Date
 */

let TOTAL_TOURNAMENTS = 0;

// Stores all Tournament objects
export let TOURNAMENT_LIST = {};

export function createTournament(players) {
	if (players.length < 2)
		throw new Error(`Not enough players to create tournament! Received: ${players.length}`);
	else if (Utils.checkDuplicates(players))
		throw new Error("Duplicate names in tournament!");
	else if (players.length % 2 == 1)
		throw new Error("There must be an even number of players!");
	TOTAL_TOURNAMENTS++;
	const tournament = {
		id: TOTAL_TOURNAMENTS - 1,
		players: players,
		rounds: [generateBracket(players)],
		currentRound: 0,
		createdAt: new Date().toISOString()
	 };
	TOURNAMENT_LIST[tournament.id] = tournament;
	return tournament;
}

export function getCurrentRound(id)
{
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in getCurrentRound call.`);
	return tournament.rounds[tournament.currentRound];
}

export function updatePlayerScore(id, name, score)
{
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in updatePlayerScore call.`);
	for (const match of tournament.rounds[tournament.currentRound])
	{
		if (match.length != 2)
			continue;
		if (match[0].name == name)
		{
			match[0].score = score;
			return;
		}
		else if (match[1].name == name)
		{
			match[1].score = score;
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
	if (pairedPlayers.length % 2 == 1)
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
	const round = tournament.rounds[tournament.currentRound];
	if (round.length > 1)
		throw new Error(`"No winners yet for tournament ID ${id} .`);
	if (round[0][0].score === undefined || round[0][1].score === undefined)
		throw new Error("Final match's score is still undefined.");
	return round[0][0].score > round[0][1].score ? round[0][0] : round[0][1];
}

export function advanceToNextRound(id)
{
	let tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in advanceToNextRound call.`);
	const ongoingRound = tournament.rounds[tournament.currentRound];
	const nextPlayers = generateNextRound(ongoingRound);
	if (nextPlayers.length == 1)
	{
		// TODO Register tournament to the blockchain
		return tournament;
	}
	else
	{
		tournament.rounds.push(generateBracketInOrder(nextPlayers));
		tournament.currentRound++;
	}
	return tournament;
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
	if (players.length % 2 == 1)
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
