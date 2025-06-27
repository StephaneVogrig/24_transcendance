import Fastify from 'fastify';

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

interface Player {
  name: string;
  score: number;
}

interface Tournament {
  id: number;
  players: Player[];
  createdAt: Date;
}

let TOTAL_TOURNAMENTS = 0;
let TOURNAMENT_LIST: Record<number, Tournament> = {};

// function describePlayer(player: Player): string {
//   return `${player.name} has a score of ${player.score}`;
// }

// const players: Player[] = [
// 	{ name: "Alice", score: 10},
// 	{ name: "Nul", score: 5},
// 	{ name: "Testr", score: 9},
// 	{ name: "gdfg", score: 55},
// 	{ name: "oof", score: 0}
// ];

function getTopScorer(players: Player[]): Player {
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

function checkDuplicates(players: Player[]): boolean {
	let playerNames: string[] = [];
	for (const player of players)
		playerNames.push(player.name);
	return new Set(playerNames).size != playerNames.length;
}

function createTournament(players: Player[]): Tournament {
	if (players.length < 2)
		throw new Error("Not enough players to create tournament! Received: " + players.length);
	else if (checkDuplicates(players))
		throw new Error("Duplicate names in tournament!");
	TOTAL_TOURNAMENTS++;
	const tournament = {
		id: TOTAL_TOURNAMENTS - 1,
		players: players,
		createdAt: new Date()
	 };
	 TOURNAMENT_LIST[tournament.id] = tournament;
	 return tournament;
}

function tournamentToArrays(tournament: Tournament): { names: string[], scores: number[] } {
	let playerNames: string[] = [];
	let playerScores: number[] = [];
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

function getTournament(id: number): Tournament {
	let tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error("ID " + id + " is invalid in getTournament call.");
	return tournament;
}

function getAllTournaments(): Tournament[] {
	return Object.values(TOURNAMENT_LIST);
}

// fastify.get('/api/tournament/test', async (request, reply) => {
// 	return getTopScorer(players);
// });

start();
