import Web3 from 'web3';
import Fastify from 'fastify';

const serviceName = 'blockchain';
const serviceport = process.env.PORT;

const API_KEY = process.env.BLOCKCHAIN_INFURIA_KEY;
const API_LINK = `https://avalanche-fuji.infura.io/v3/${API_KEY}`;
const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"errNotOwner","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint64","name":"id","type":"uint64"},{"indexed":false,"internalType":"string","name":"data","type":"string"}],"name":"BroadcastTournament","type":"event"},{"inputs":[{"internalType":"uint64","name":"id","type":"uint64"}],"name":"getTournament","outputs":[{"components":[{"internalType":"uint64","name":"id","type":"uint64"},{"internalType":"string","name":"data","type":"string"}],"internalType":"struct Tournament.TournamentScore","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint64","name":"id","type":"uint64"},{"internalType":"string","name":"data","type":"string"}],"name":"registerTournament","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tournamentCount","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"}];
const CONTRACT_ADDRESS = "0xa10064c3c34c29911e7e446759ce79dc02eaf61f";

const fastify = Fastify({
	logger: {
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				translateTime: 'SYS:HH:MM:ss Z',
				ignore: 'pid,hostname'
			}
		}
	},
});


fastify.get('/health', async (request, reply) => {
  return {
    service: serviceName,
    port: serviceport,
    status: 'healthy',
    uptime: process.uptime()
  };
});

function formatTournamentForBlockchain(tournament, dateStr) {
	const { id, players, rounds, winner } = tournament;

	const playersStr = players
		.map(p => `${p.name}`)
		.join(', ');

	const roundsStr = rounds.map((round, i) => {
		const matches = round.map(match => {
			if (match.length === 2)
				return `${match[0].name}(${match[0].score})-${match[1].name}(${match[1].score})`;
			else if (match.length === 1)
				return `${match[0].name}(${match[0].score})`;
			return '';
		}).join(', ');
		return `Round ${i + 1}: ${matches}`;
	}).join('; ');

	const winnerName = winner.name;
	return `Tournament #${id} (Date: ${dateStr})\nPlayers: ${playersStr}\nRounds: ${roundsStr}\nWinner: ${winnerName}`;
}


const start = async () => {
	try {
		fastify.post('/register', async (request, reply) => {
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

		fastify.get('/get', async (request, reply) => {
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
	const web3 = new Web3(API_LINK);
	const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS)
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
	const web3 = new Web3(API_LINK);
	const account = web3.eth.accounts.privateKeyToAccount(process.env.BLOCKCHAIN_PRIVATE_KEY);
	web3.eth.accounts.wallet.add(account);
	web3.eth.defaultAccount = account.address;
	const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS)
	const dateStr = new Date(tournament.createdAt).toISOString().split('T')[0];
	try
	{
		const gas = await contract.methods.registerTournament(
			tournament.id,
			formatTournamentForBlockchain(tournament, dateStr)
		).estimateGas({ from: account.address });

		const receipt = await contract.methods.registerTournament(
			tournament.id,
			formatTournamentForBlockchain(tournament, dateStr)
		).send({from: account.address, gas});

		return receipt.transactionHash;
	} catch (err)
	{
		console.log(err);
	}
}

start();
