import Web3 from 'web3';
import Fastify from 'fastify';
import fetch from 'node-fetch';

const fastify = Fastify({ logger: true });

fastify.get('/api/blockchain', async (request, reply) => {
  return { message: 'Hello from Blockchain Service!' };
});

const start = async () => {
  try {
	fastify.post('/api/blockchain/register', async (request, reply) => {
		const { tournament } = request.body;
		if (!tournament)
			return reply.status(400).send({ error: "Tournament needed to register to blockchain." });

		const { id, players, createdAt } = tournament;
		if (typeof id !== 'number' || !Array.isArray(players) || typeof createdAt !== 'string')
			return reply.status(400).send({ error: "Missing or invalid fields: 'id', 'players', 'createdAt'" });

		for (const player of players) {
			if (typeof player.name !== 'string' || typeof player.score !== 'number')
				return reply.status(400).send({ error: "Each player must have a string 'name' and numeric 'score'" });
		}
		const receipt = await registerToBlockchain(tournament);
		if (!receipt)
			return reply.status(500).send({error: "Couldn't register tournament to blockchain."})
		return reply.status(200).send(receipt);
	});

	fastify.get('/api/blockchain/get', async (request, reply) => {
		const { id } = request.query;
		if (typeof id === 'undefined' || isNaN(Number(id)))
			return reply.status(400).send({ error: 'Missing or invalid id.' });
		try
		{
			const tournament = await getTournament(id);
			if (!tournament)
 				return reply.status(404).send({ error: 'Tournament not found on blockchain.' });
			return reply.status(200).send(tournament);
		} catch (err)
		{
			return reply.status(500).send(err.message);
		}
	});
	await fastify.listen({ port: 3002, host: '0.0.0.0' });
	console.log(`Blockchain service listening on port 3002`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

async function getTournament(id)
{
	const web3 = new Web3("https://avalanche-fuji.infura.io/v3/753d9c10ae1449d092eb704b3d40cf42");
	const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"errNotOwner","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint64","name":"id","type":"uint64"},{"indexed":false,"internalType":"string[]","name":"playerNames","type":"string[]"},{"indexed":false,"internalType":"uint8[]","name":"playerScores","type":"uint8[]"},{"indexed":false,"internalType":"string","name":"date","type":"string"},{"indexed":false,"internalType":"string","name":"winner","type":"string"}],"name":"BroadcastTournament","type":"event"},{"inputs":[{"internalType":"uint64","name":"id","type":"uint64"}],"name":"getTournament","outputs":[{"components":[{"internalType":"uint64","name":"id","type":"uint64"},{"internalType":"string[]","name":"playerNames","type":"string[]"},{"internalType":"uint8[]","name":"playerScores","type":"uint8[]"},{"internalType":"string","name":"date","type":"string"}],"internalType":"struct Tournament.TournamentScore","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint64","name":"id","type":"uint64"},{"internalType":"string[]","name":"playerNames","type":"string[]"},{"internalType":"uint8[]","name":"playerScores","type":"uint8[]"},{"internalType":"string","name":"date","type":"string"},{"internalType":"string","name":"winner","type":"string"}],"name":"registerTournament","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tournamentCount","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"}];
	const contract = new web3.eth.Contract(ABI, "0x0AFb54862056e3283d4E6C728e73e943F349aDc4")

	try
	{
		const tournament = await contract.methods.getTournament(id).call();
		return (tournament);
	} catch (err)
	{
		console.log(err.message);
		return null;
	}
}

async function registerToBlockchain(tournament)
{
	const web3 = new Web3("https://avalanche-fuji.infura.io/v3/753d9c10ae1449d092eb704b3d40cf42");
	const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"errNotOwner","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint64","name":"id","type":"uint64"},{"indexed":false,"internalType":"string[]","name":"playerNames","type":"string[]"},{"indexed":false,"internalType":"uint8[]","name":"playerScores","type":"uint8[]"},{"indexed":false,"internalType":"string","name":"date","type":"string"},{"indexed":false,"internalType":"string","name":"winner","type":"string"}],"name":"BroadcastTournament","type":"event"},{"inputs":[{"internalType":"uint64","name":"id","type":"uint64"}],"name":"getTournament","outputs":[{"components":[{"internalType":"uint64","name":"id","type":"uint64"},{"internalType":"string[]","name":"playerNames","type":"string[]"},{"internalType":"uint8[]","name":"playerScores","type":"uint8[]"},{"internalType":"string","name":"date","type":"string"}],"internalType":"struct Tournament.TournamentScore","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint64","name":"id","type":"uint64"},{"internalType":"string[]","name":"playerNames","type":"string[]"},{"internalType":"uint8[]","name":"playerScores","type":"uint8[]"},{"internalType":"string","name":"date","type":"string"},{"internalType":"string","name":"winner","type":"string"}],"name":"registerTournament","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tournamentCount","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"}];
	const account = web3.eth.accounts.privateKeyToAccount(process.env.BLOCKCHAIN_PRIVATE_KEY);
	web3.eth.accounts.wallet.add(account);
	web3.eth.defaultAccount = account.address;
	const contract = new web3.eth.Contract(ABI, "0x0AFb54862056e3283d4E6C728e73e943F349aDc4")
	try
	{
		const response = await fetch(`http://tournament:3007/api/tournament/winner?id=${tournament.id}`);
		if (!response.ok)
			throw new Error(await response.text());

		const winner = await response.text();

		const gas = await contract.methods.registerTournament(
			tournament.id,
			tournament.players.map(player => player.name),
			tournament.players.map(player => player.score),
			tournament.createdAt,
			winner
		).estimateGas({ from: account.address });

		return await contract.methods.registerTournament(
			tournament.id,
			tournament.players.map(player => player.name),
			tournament.players.map(player => player.score),
			tournament.createdAt,
			winner).send({from: account.address, gas});
	} catch (err)
	{
		console.log(err);
	}
}

start();
