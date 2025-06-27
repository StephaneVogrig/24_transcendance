import Fastify from 'fastify';
import * as Utils from './utils.js';

/* Player has:
 * name (string)
 * score (uint8)
 */

/* Tournament has:
 * id (int)
 * Players (name: string, score: uint8)
 * Date (date format)
 */

const fastify = Fastify({ logger: true });

fastify.get('/api/tournament', async (request, reply) => { 
  return { message: 'Hello from Tournament Service!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3007, host: '0.0.0.0' });
    console.log(`Tournament service listening on port 3007`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

let TOTAL_TOURNAMENTS = 0;

// Stores all Tournament objects
let TOURNAMENT_LIST = {};

function getTopScorer(players) {
	let highest = -1;
	let bestPlayer = {
		name: 'None',
		score: -1
	};
	for (const player of players) {
		if (player.score > highest)
		{
			highest = player.score;
			bestPlayer = player;
		}
	}
	return bestPlayer;
}

function createTournament(players) {
	if (players.length < 2)
		throw new Error("Not enough players to create tournament! Received: " + players.length);
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
		createdAt: new Date()
	 };
	 TOURNAMENT_LIST[tournament.id] = tournament;
	 return tournament;
}

function getCurrentRound(id)
{
	let tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error("ID " + id + " is invalid in getCurrentRound call.");
	return tournament.rounds[tournament.currentRound];
}

function updatePlayerScore(id, name, score)
{
	let tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error("ID " + id + " is invalid in getCurrentRound call.");
	for (const round of tournament.rounds[tournament.currentRound])
	{
		if (round.length != 2)
			continue;
		if (round[0].name == name)
		{
			round[0].score = score;
			return;
		}
		else if (round[1].name == name)
		{
			round[1].score = score;
			return;
		}
	}
	throw new Error(`Player "${name}" not found in current round.`);
}

function tournamentToArrays(tournament) {
	let playerNames = [];
	let playerScores = [];
	for (const player of tournament.players)
	{
		playerNames.push(player.name);
		if (player.score >= 0 && player.score <= 255)
			playerScores.push(player.score);
		else
			throw new Error("Score of " + player.score + " is invalid for player " + player.name);
	}
	return {names: playerNames, scores: playerScores};
}

function getTournament(id) {
	let tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error("ID " + id + " is invalid in getTournament call.");
	return tournament;
}

function getAllTournaments() {
	return Object.values(TOURNAMENT_LIST);
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

function advanceToNextRound(id)
{
	let tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error("ID " + id + " is invalid in advanceToNextRound call.");
	let currentRound = tournament.rounds[tournament.currentRound];
	let nextPlayers = generateNextRound(currentRound);
	if (nextPlayers.length == 1)
	{
		// TODO Register tournament to the blockchain
		return nextPlayers[0];
	}
	else
	{
		tournament.rounds.push(generateBracket(nextPlayers));
		tournament.currentRound++;
	}
	return tournament.rounds[tournament.currentRound];
}

function generateBracket(players)
{
	if (players.length % 2 == 1)
		throw new Error("There must be an even number of players!");
	let indexes = Utils.generateIndexes(players.length);
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

// fastify.get('/api/tournament/test', async (request, reply) => {
// 	return getTopScorer(players);
// });

start();
