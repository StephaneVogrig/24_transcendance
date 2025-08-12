import * as Utils from './utils.js';
import { log } from '../shared/fastify.js';
import * as inDb from './tournamentDatabase.js';

/* Player has:
 * name (string)
 * score (uint8)
 * online (boolean)
 */

/* Match has:
 * player1: Player
 * player2: Player
 * status: playing, finished
 */

/* Round has:
 * An array of Match[Player, Player]
 */

/* Tournament has:
 * id: index of the tournament
 * players: players participating in the tournament (name: string, score: uint8)
 * rounds: array of Round
 * status: open, ongoing, ended (open: new players can join, ongoing: tournament is being played, ended: winner has been chosen)
 * roundIndex: index of current Round
 * createdAt: Date
 * hash: Blockchain transaction hash (undefined until end of tournament)
 */

let TOTAL_TOURNAMENTS = 0;
const MAX_SCORE = 5;

// Stores all Tournament objects
export let TOURNAMENT_LIST = {};

export function findTournamentWithPlayer(name)
{
	for (const tournament of Object.values(TOURNAMENT_LIST))
	{
		if (tournament.players && tournament.status !== 'ended')
		{
			for (const player of tournament.players)
				if (player.name && player.name === name)
					return (tournament);
		}
	}
	return (undefined);
}

async function deletePlayerFromDb(name)
{
	await fetch(`http://database:3003/tournament/delete`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username: name })
	});
}

async function deleteTournamentFromDb(id)
{
    const tournament = TOURNAMENT_LIST[id];
    if (!tournament)
        return;
    for (const player in tournament.players)
        await deletePlayerFromDb(player.name);
    const response = await fetch(`http://database:3003/tournament/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
    }
}

async function modifyTournamentInDb(tournament)
{
    const response = await fetch(`http://database:3003/tournament/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournament })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
    }
}

export async function createTournament(name)
{
    const tournamentId = await inDb.createEmptyTournament();

	const tournament = {
		id: tournamentId,
		players: [{name: name, score: 0, online: true}],
		playerCount: 1,
		rounds: [],
		status: 'open',
		roundIndex: 0,
		createdBy: name,
		createdAt: new Date().toISOString(),
		hash: undefined
	};
	TOURNAMENT_LIST[tournament.id] = tournament;
	TOTAL_TOURNAMENTS++;
    await inDb.updateTournament(tournament);
	return tournament;
}

export async function getMatches()
{
	return Object.values(TOURNAMENT_LIST);
}

async function startMatches(bracket)
{
	log.debug(bracket, 'start macthes');
	for (const players of bracket)
	{
		try {
			players.status = 'playing';
			let player1 = players[0].name;
			let player2 = players[1].name;
			log.debug(`Starting match between ${player1} and ${player2}`);
			const response = await fetch(`http://game:3004/start`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ player1, player2, maxScore: MAX_SCORE })
			});

			if (!response.ok) {
				const err = await response.text();
				throw new Error(err);
			}
			
		} catch (error) {
			console.log(`Error while starting match: ${error.message}.`);
		}
	}
}

export async function deleteTournament(id)
{
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		return;
	await deleteTournamentFromDb(id);
	delete TOURNAMENT_LIST[id];
}

export async function startTournament(tournament)
{
    await new Promise(resolve => setTimeout(resolve, 500));
	tournament.rounds = [generateBracket(tournament.players)];
	TOURNAMENT_LIST[tournament.id] = tournament;
	await startMatches(tournament.rounds[tournament.roundIndex]);
	await modifyTournamentInDb(tournament);
}

export function findTournament()
{
	const tournaments = Object.values(TOURNAMENT_LIST)
		.filter(t => t.status === 'open' && t.playerCount < 4)
		.sort((a, b) => b.players.length - a.players.length);
	if (tournaments.length < 1)
		return undefined;
	return tournaments[0];
}

export async function joinTournament(name)
{
	log.debug(`player %s want join tournament`, name);
	const tmp = name;
	name = name.trim();

	const tournament = findTournament();
	if (!tournament)
		return await createTournament(name);
	if (tournament.status !== 'open')
		throw new Error(`Tournament ${id} is full, ongoing or finished.`);
	tournament.players.push({name: name, score: 0});
	tournament.playerCount++;
	log.debug(`player %s succesfuly join tournament`, name);
	if (tournament.playerCount === 4)
    {
        tournament.status = 'ongoing';
		startTournament(tournament);
    }
	modifyTournamentInDb(tournament);
	return tournament;
}

export async function leaveTournament(name)
{
	const tournament = findTournamentWithPlayer(name);
	if (!tournament)
		return;
	if (tournament.status === 'open' || tournament.status === 'ongoing')
	{
		const index = tournament.players.findIndex(p => p.name === name);
		if (index !== -1)
		{
			if (tournament.status === 'open')
			{
				tournament.players.splice(index, 1);
				tournament.playerCount--;
				if (tournament.playerCount === 0)
				{
					await deleteTournament(tournament.id);
					TOTAL_TOURNAMENTS--;
				}
			}
			else
				tournament.players[index].status = 'offline';
		}
		await modifyTournamentInDb(tournament);
	}
}

export function getCurrentRound(id)
{
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in getCurrentRound call.`);
	return tournament.rounds[tournament.roundIndex];
}

export function getOngoingTournaments()
{
	return Object.values(TOURNAMENT_LIST).filter(t => t.status === 'ongoing');
}

export async function updatePlayerScores(players)
{
	log.debug(players,`updatePlayerScores %s vs %s`, players[0].name, players[1].name);
	const tournament = findTournamentWithPlayer(players[0].name);
	if (!tournament){
		log.debug(`Tournament not found to update score %s vs %s`, players[0].name, players[1].name)
		throw new Error(`Tournament not found`);
	}

	let matchFound = false;
	const round = tournament.rounds[tournament.roundIndex];

	for (const match of round)
	{
		const namesInMatch = match.map(p => p.name);
		if (!players.every(player => namesInMatch.includes(player.name))) {
			continue;
		}
		matchFound = true;
		for (const player of match) {
			const updated = players.find(p => p.name === player.name);
			if (updated)
				player.score = updated.score;
			if (player.score === MAX_SCORE)
			{
				log.debug(match,`match %s vs %s is finished`, players[0].name, players[1].name);
				match.status = 'finished';
			}
		}
		break;
	}

	if (!matchFound) {
		log.debug(tournament, `No match %s vs %s found to update`, players[0].name, players[1].name)
		throw new Error(`Match not found`);
	}

	const allMatchesFinished = round.every(match => match.status === 'finished');

	if (allMatchesFinished) {
		log.debug(round, `all matches finished`);
		await advanceToNextRound(tournament.id);
	}
	await modifyTournamentInDb(tournament);
}

export function getTournament(id) {
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in getTournament call.`);
	return tournament;
}

function generateNextRound(pairedPlayers)
{
	log.debug(pairedPlayers,`generate next round`);
	if (pairedPlayers.length === 1)
		return [pairedPlayers[0][0]];
	if (pairedPlayers.length % 2 === 1)
		throw new Error("There must be an even number of players!");
	let winners = [];
	for (let i = 0; i < pairedPlayers.length; i++)
		winners[i] = (pairedPlayers[i][0].score > pairedPlayers[i][1].score ? pairedPlayers[i][0] : pairedPlayers[i][1]);
	return winners;
}

export function getWinner(id)
{
	const tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in getWinner call.`);
	const round = tournament.rounds[tournament.roundIndex];
	if (round.length > 1)
		throw new Error(`No winners yet for tournament ID ${id} .`);
	if (round[0][0].score === undefined || round[0][1].score === undefined)
		throw new Error("Final match's score is still undefined.");
	return round[0][0].score > round[0][1].score ? round[0][0] : round[0][1];
}

export async function addRawTournament(tournament)
{
	TOURNAMENT_LIST[TOTAL_TOURNAMENTS] = tournament;
	TOTAL_TOURNAMENTS++;
}

export async function advanceToNextRound(id)
{
	let tournament = TOURNAMENT_LIST[id];
	if (!tournament)
		throw new Error(`ID ${id} is invalid in advanceToNextRound call.`);
	log.debug(tournament, `advance to next round for tournament`);
	const ongoingRound = tournament.rounds[tournament.roundIndex];
	const nextPlayers = generateNextRound(ongoingRound);
	if (nextPlayers.length === 1)
	{
		tournament.status = 'ended';
		tournament.winner = getWinner(id);

        try {
            log.debug(tournament.players, 'tournament players: ');
			fetch(`http://websocket:3008/tournamentFinished`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({players: tournament.players, winner: tournament.winner})
			});

			log.debug(tournament, 'tournament results succesfully sended');
		} catch (error) {
			log.debug(tournament, `Error while sending tournament finished to websocket: ${error.message}.`);
		}

		try {
			const response = await fetch(`http://blockchain:3002/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({tournament})
			});

			if (!response.ok) {
				const err = await response.text();
				throw new Error(err);
			}

			const hash = await response.text();

			console.log('Registered tournament to blockchain.');
			console.log(`Transaction link: https://subnets-test.avax.network/c-chain/tx/${hash}`);
			tournament.hash = hash;
		} catch (error) {
			console.log(`Error while registering tournament to blockchain: ${error.message}.`);
		}
	}
	else
	{
		tournament.rounds.push(generateBracketInOrder(nextPlayers));
		tournament.roundIndex++;
		await new Promise(r => setTimeout(r, 300));
		await startMatches(tournament.rounds[tournament.roundIndex]);
	}
}

function clonePlayer(player) {
 	return { ...player, score: 0};
}

function generateBracketInOrder(players) {
    if (players.length % 2 === 1)
        throw new Error("There must be an even number of players!");
    let pairedPlayers = [];
    for (let i = 0; i < players.length; i += 2)
        pairedPlayers.push([clonePlayer(players[i]), clonePlayer(players[i + 1])]);
    return pairedPlayers;
}

function generateBracket(players)
{
	if (players.length % 2 === 1)
		throw new Error("There must be an even number of players!");
	const indexes = Utils.generateIndexes(players.length);
	let bracketPlayers = [];
	for (let i = 0; i < indexes.length; i++)
		bracketPlayers[i] = players[indexes[i]];
	let pairedPlayers = [];
	for (let i = 0, j = 0; i < bracketPlayers.length; i += 2, j++)
		pairedPlayers[j] = [bracketPlayers[i], bracketPlayers[i + 1]];
	return pairedPlayers;
}


// Le backend tournois appelle le backend database pour récupérer tous les tournois
// et les ajoute au cache local TOURNAMENT_LIST
export async function getAllTournamentsInDB() 
{
    try 
	{
        const response = await fetch(`http://database:3003/getAllInDB`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) 
		{
            const err = await response.text();
            throw new Error(err);
        }

		// Méthode qui lit la réponse HTTP via `fetch` et le convertit en objet JavaScript
        const tournaments = await response.json();
        
        return tournaments;
    }
	catch (error) {
        console.log(`Error while fetching tournaments list from database: ${error.message}.`);
        throw error; 
    }
}