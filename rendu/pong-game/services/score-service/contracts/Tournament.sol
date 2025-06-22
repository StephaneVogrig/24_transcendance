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
    mapping(uint64 => TournamentScore) public scores;
    struct PlayerScore
    {
        string name;
        uint8 score;
    }
    struct TournamentScore
    {
        PlayerScore player1;
        PlayerScore player2;
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
        string player1,
        uint8 score1,
        string player2,
        uint8 score2
    );

    /**
     * @notice Registers a tournament's score
     * @dev Can only be called by the one who created the contract
     * @param player1 Name of the first player
     * @param score1 Score of the first player
     * @param player2 Name of the second player
     * @param score2 Score of the second player
     */
    function registerTournament(string calldata player1, uint8 score1, string calldata player2, uint8 score2)
    public
    onlyOwner
    {
        PlayerScore memory ps1 = PlayerScore(player1, score1);
        PlayerScore memory ps2 = PlayerScore(player2, score2);

        TournamentScore memory ts = TournamentScore(ps1, ps2);
        scores[tournamentCount] = ts;
        emit BroadcastTournament(tournamentCount, player1, score1, player2, score2);
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

    /**
     * @notice Get players score by tournament index
     * @param id Index of the tournament to get (max: count - 1)
     * @dev This is a great way to get all variables at once instead of using the struct
     */
    function getPlayerScores(uint64 id)
    public 
    view 
    returns (string memory player1, uint8 score1, string memory player2, uint8 score2)
    {
        require(id < tournamentCount);
        TournamentScore memory ts = scores[id];
        return (ts.player1.name, ts.player1.score, ts.player2.name, ts.player2.score);
    }
}
