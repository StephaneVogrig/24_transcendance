let GAMES = new Map();

export async function createAI(name)
{
	if (!name)
		throw new Error("Player needed for call to createAI");
	if (GAMES.has("AI-" + name))
		throw new Error("Name already has a game.");
	GAMES.set("AI-" + name, {player: name, leftPressed: false, rightPressed: false});
	try {
		const player1 = "AI";
		const player2 = name;
		const response = await fetch(`http://game:3004/api/game/start`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ player1, player2 })
		});

		if (!response.ok) {
			const err = await response.text();
			throw new Error(err);
		}

		console.log(`Starting match between ${player1} and ${player2}`);
	} catch (error) {
		console.log(`Error while starting match between AI and ${player}: ${error.message}.`);
	}
}

export async function getInput(gameId)
{
	let game = GAMES.get(gameId);
	const response = await fetch(`http://game:3004/api/game/state?player=${game.player}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok)
		throw new Error(`Couldn't get game state for ${gameId}`);

	const { player1, player2, ball, ballspeed, paddle } = {
		player1: game.player1,
		player2: game.player2,
		ball: game.ball,
		ballspeed: game.ballspeed,
		paddle: game.player1.paddle
	};

	console.log(`p1: ${player1} | p2: ${player2} | ball: ${ball} | ballspeed: ${ballspeed} | paddle: ${paddle}`);
}
