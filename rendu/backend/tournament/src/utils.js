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
