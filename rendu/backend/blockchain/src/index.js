import Web3 from 'web3';
import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/api/blockchain', async (request, reply) => {
  return { message: 'Hello from Blockchain Service!' };
});

const start = async () => {
  try {
	fastify.get('/api/blockchain/get', async (request, reply) => {
		const { id } = request.query;
		if (typeof id === 'undefined' || isNaN(Number(id)))
			return reply.status(400).send({ error: 'Missing or invalid id.' });
		const tournament = registerToBlockchain(id);
		reply.status(200).send(tournament);
	});
    await fastify.listen({ port: 3002, host: '0.0.0.0' });
    console.log(`Blockchain service listening on port 3002`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

async function registerToBlockchain(id)
{
	const web3 = new Web3("https://avalanche-fuji.infura.io/v3/753d9c10ae1449d092eb704b3d40cf42");
	const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"errNotOwner","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint64","name":"id","type":"uint64"},{"indexed":false,"internalType":"string[]","name":"playerNames","type":"string[]"},{"indexed":false,"internalType":"uint8[]","name":"playerScores","type":"uint8[]"}],"name":"BroadcastTournament","type":"event"},{"inputs":[{"internalType":"uint64","name":"id","type":"uint64"}],"name":"getPlayerScores","outputs":[{"internalType":"string[]","name":"playerNames","type":"string[]"},{"internalType":"uint8[]","name":"playerScores","type":"uint8[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint64","name":"id","type":"uint64"}],"name":"getTournament","outputs":[{"components":[{"internalType":"string[]","name":"playerNames","type":"string[]"},{"internalType":"uint8[]","name":"playerScores","type":"uint8[]"}],"internalType":"struct Tournament.TournamentScore","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string[]","name":"playerNames","type":"string[]"},{"internalType":"uint8[]","name":"playerScores","type":"uint8[]"}],"name":"registerTournament","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tournamentCount","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"}];
	const account = web3.eth.accounts.privateKeyToAccount(process.env.BLOCKCHAIN_PRIVATE_KEY);
	web3.eth.accounts.wallet.add(account);
	web3.eth.defaultAccount = account.address;
	const contract = new web3.eth.Contract(ABI, "0x25061d69D038C22303AFd83a4C86E1d9afB44cA0")
	try
	{
		return await contract.methods.getTournament(id).call({from: account.address});
	} catch (err)
	{
		console.log(err.message);
	}
}

start();
