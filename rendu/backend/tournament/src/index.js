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

fastify.post('/api/tournament/get', async (request, reply) => {
	if (!request.body || typeof request.body.id !== 'number')
	{
		reply.status(400).send({ error: 'Missing or invalid id.' });
		return;
	}
	const tournament = TOURNAMENT_LIST[request.body.id];
	if (!tournament)
	{
		reply.status(400).send({error: `ID ${request.body.id} is invalid.`});
		return;
	}
	const readableTournament = Utils.readTournament(tournament);
	reply.status(200).send(readableTournament);
});

fastify.post('/api/tournament/create', async (request, reply) => {
	const players = request.body.players;
	if (!players || !Array.isArray(players))
	{
		reply.status(400).send({error: 'Players need to be an array'});
		return;
	}
	for (const [index, player] of players.entries())
	{
		if (typeof player !== 'object' || player === null)
		{
			reply.status(400).send({ error: `Player at index ${index} is not a valid object.` });
    		return;
		}
		else if ('name' in player && typeof player.name !== 'string' || player.name.trim() === '')
		{
			reply.status(400).send({ error: `Player at index ${index} has invalid or missing name.` });
  			return;
		}
		else if ('score' in player && typeof player.score !== 'number')
		{
			reply.status(400).send({ error: `Player at index ${index} has invalid score.` });
    		return;
		}
	}
	try
	{
		const result = createTournament(players);
		reply.status(201).send(result);
	}
	catch (error)
	{
		reply.status(400).send({error: error.message});
	}
});

let TOTAL_TOURNAMENTS = 0;

// Stores all Tournament objects
let TOURNAMENT_LIST = {};

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
	const bracket = tournament.rounds[0];
	return Utils.readTournament(tournament);
}

function getCurrentRound(id)
{
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in getCurrentRound call.`);
	return tournament.rounds[tournament.currentRound];
}

function updatePlayerScore(id, name, score)
{
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in updatePlayerScore call.`);
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
			throw new Error(`Score of ${player.score} is invalid for player ${player.name}`);
	}
	return {names: playerNames, scores: playerScores};
}

function getTournament(id) {
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in getTournament call.`);
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

function getWinner(id)
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

function advanceToNextRound(id)
{
	let tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in advanceToNextRound call.`);
	const ongoingRound = tournament.rounds[tournament.currentRound];
	const nextPlayers = generateNextRound(ongoingRound);
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

// fastify.get('/api/tournament/test', async (request, reply) => {
// 	return getTopScorer(players);
// });

start();
