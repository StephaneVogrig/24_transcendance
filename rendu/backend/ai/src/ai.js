export class AI
{
	constructor()
	{
		this.games = new Map();
	}

	createAI(player)
	{
		if (!player)
			throw new Error("Player needed for call to createAI");
		this.games.set("AI-" + player, {player: player, leftPressed: false, rightPressed: false});
	}

	async getInput(gameId)
	{
		let game = this.games.get(gameId);
		const response = await fetch(`http://game:3004/api/game/state?player=${game.player}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok)
			throw new Error(`Couldn't get game state for ${gameId}`);

		
	}
}
