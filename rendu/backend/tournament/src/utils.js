export function generateIndexes(max)
{
	const indexes = Array.from({length: max}, (_, index) => index);
	for (let i = 0; i < indexes.length; i++)
	{
		const j = Math.floor(Math.random() * (i + 1));
		[indexes[i], indexes[j]] = [indexes[j], indexes[i]];
	}
	return indexes;
}

export function checkDuplicates(players) {
	let playerNames = [];
	for (const player of players)
		playerNames.push(player.name);
	return new Set(playerNames).size != playerNames.length;
}

export function exportTournamentToBlockchain(tournament)
{
	return {
		id: tournament.id,
		players: tournament.players,
		createdAt: tournament.createdAt
	};
}

export function readTournament(tournament)
{
	const bracket = tournament.rounds[tournament.roundIndex];
	if (tournament.status === 'open')
	{
		return {
			id: tournament.id,
			playerNames: tournament.players.map(p => p.name),
			playerScores: tournament.players.map(p => p.score),
			totalPlayers: tournament.players.length,
			currentRound: tournament.roundIndex,
			createdAt: tournament.createdAt
		}
	}
	return {
		id: tournament.id,
		playerNames: tournament.players.map(p => p.name),
		playerScores: tournament.players.map(p => p.score),
		totalPlayers: tournament.players.length,
		currentRound: tournament.roundIndex,
		bracket: bracket,
		matchups: bracket.map(match => ({
			player1: match[0].name,
			player2: match[1].name
		})),
		currentMatch: bracket[0],
		createdAt: tournament.createdAt
	}
}

export function readRound(round) {
	const roundArray = Object.values(round);
	return {
		matchups: roundArray.map(([player1, player2], matchIndex) => ({
			matchIndex,
			player1: {
				name: player1.name,
				score: player1.score
			},
			player2: {
				name: player2.name,
				score: player2.score
			}
		}))
	};
}
