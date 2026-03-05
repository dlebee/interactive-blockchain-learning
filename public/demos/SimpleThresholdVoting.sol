// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Simple threshold voting: each participant submits (seqNum, data, signature).
/// No single aggregator: censorship resistant. Anyone can submit any vote.
/// Data is agreed when threshold of valid signatures for same (seqNum, data) is met.
contract SimpleThresholdVoting {
    uint256 public immutable THRESHOLD;
    address[] public eligibleVoters;
    mapping(address => bool) public isEligible;

    mapping(uint256 => mapping(bytes32 => uint256)) public voteCount; // seqNum => dataHash => count
    mapping(uint256 => mapping(bytes32 => bool)) public agreed;       // seqNum => dataHash => agreed
    mapping(uint256 => bool) public sequenceComplete;                // seqNum => any consensus reached
    mapping(uint256 => mapping(bytes32 => mapping(address => bool))) public hasVoted;

    constructor(address[] memory voters, uint256 threshold) {
        THRESHOLD = threshold;
        eligibleVoters = voters;
        for (uint256 i = 0; i < voters.length; i++) {
            isEligible[voters[i]] = true;
        }
    }

    /// @dev Submit a vote: (seqNum, data, signature). Anyone can submit on behalf of a voter.
    /// Signature = sign(keccak256(seqNum, data)) by voter's key.
    function submitVote(
        uint256 seqNum,
        bytes calldata data,
        uint8 v, bytes32 r, bytes32 s
    ) external {
        bytes32 dataHash = keccak256(data);
        require(!agreed[seqNum][dataHash], "already agreed");
        require(!sequenceComplete[seqNum], "sequence complete");

        address signer = ecrecover(
            keccak256(abi.encodePacked(seqNum, data)),
            v, r, s
        );
        require(isEligible[signer], "not eligible");
        require(!hasVoted[seqNum][dataHash][signer], "already voted");

        hasVoted[seqNum][dataHash][signer] = true;
        voteCount[seqNum][dataHash]++;

        if (voteCount[seqNum][dataHash] >= THRESHOLD) {
            agreed[seqNum][dataHash] = true;
            sequenceComplete[seqNum] = true;
        }
    }

    function isAgreed(uint256 seqNum, bytes32 dataHash) external view returns (bool) {
        return agreed[seqNum][dataHash];
    }
}
