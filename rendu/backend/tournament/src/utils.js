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

export function readTournament(tournament) {
	if (!tournament) return 'No tournament data';

	const lines = [];

	lines.push(`Tournament ID: ${tournament.id}`);
	lines.push(`Status: ${tournament.status}`);
	lines.push(`Created By: ${tournament.createdBy}`);
	lines.push(`Created At: ${tournament.createdAt}`);
	lines.push(`Player Count: ${tournament.playerCount || (tournament.players && tournament.players.length) || 0}`);

	lines.push(`Players:`);
	for (const player of tournament.players) {
		lines.push(`  - ${player.name} (Score: ${player.score})`);
	}

	lines.push(`Rounds:`);
	if (tournament.rounds.length === 0) {
		lines.push('  No rounds started yet.');
	} else {
		tournament.rounds.forEach((round, index) => {
		lines.push(`  Round ${index + 1}:`);
		round.forEach((match, i) => {
			const p1 = match[0];
			const p2 = match[1];
			const status = match.status || 'pending';
			lines.push(`    Match ${i + 1}: ${p1.name} (${p1.score}) vs ${p2.name} (${p2.score}) - Status: ${status}`);
		});
		});
	}

	if (tournament.status === 'ended' && tournament.winner) {
		lines.push(`Winner: ${tournament.winner.name} with score ${tournament.winner.score}`);
	}

	return lines.join('\n');
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

export function checkPlayerName(playerName) {
	if (playerName.length < 3)
		throw new Error(`player name '${playerName}' is too short, minimum 3 characters.`);
	if (playerName.length > 25)
		throw new Error(`player name '${playerName}' is too long, maximum 25 characters.`);
}
