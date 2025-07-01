//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/**
 * @title Contract that registers tournament scores to the blockchain
 * @author scraeyme
 */
contract Tournament
{
	// Variables
	address immutable owner;
	uint64 public tournamentCount;
	mapping(uint64 => TournamentScore) scores;
	struct TournamentScore
	{
		uint64 id;
		string[] playerNames;
		uint8[] playerScores;
		string date;
	}

	// Modifier to only allow certain functions to be called by the owner of the contract
	error errNotOwner();
	modifier onlyOwner
	{
		if (msg.sender != owner) revert errNotOwner();
		_;
	}

	// Setting the owner as being the one who initiated the contract
	constructor()
	{
		owner = msg.sender;
	}

	/**
	 * @notice This is why the major module is validated, it registers the scores to the blockchain
	 * @dev The keyword emit is used in registerTournament() which calls for this event
	 */
	event BroadcastTournament(
		uint64 indexed id,
		string[] playerNames,
		uint8[] playerScores,
		string date,
		string winner
	);

	/**
	 * @notice Registers a tournament's score
	 * @dev Can only be called by the one who created the contract
	 * @param playerNames Name of the players
	 * @param playerScores Score of the players
	 */
	function registerTournament(uint64 id, string[] calldata playerNames, uint8[] calldata playerScores, string calldata date, string calldata winner)
	public
	onlyOwner
	{
		TournamentScore memory ts = TournamentScore(id, playerNames, playerScores, date);
		scores[tournamentCount] = ts;
		emit BroadcastTournament(id, playerNames, playerScores, date, winner);
		tournamentCount++;
	}

	/**
	 * @notice Get a tournament score by index
	 * @param id Index of the tournament to get (max: count - 1)
	 */
	function getTournament(uint64 id)
	public
	view
	returns (TournamentScore memory)
	{
		require(id < tournamentCount);
		return (scores[id]);
	}
}
