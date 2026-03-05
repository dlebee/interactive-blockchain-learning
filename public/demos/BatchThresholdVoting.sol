// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Batch threshold voting: participants agree off-chain, anyone submits aggregation.
/// Cheaper when censorship of disagreement is acceptable (one tx vs N txs, saves 21k gas each).
/// Assumes threshold and list of eligible voters. No bitfield.
contract BatchThresholdVoting {
    uint256 public immutable THRESHOLD;
    address[] public eligibleVoters;
    mapping(address => bool) public isEligible;

    mapping(uint256 => mapping(bytes32 => bool)) public agreed;
    mapping(uint256 => bool) public sequenceComplete;

    constructor(address[] memory voters, uint256 threshold) {
        THRESHOLD = threshold;
        eligibleVoters = voters;
        for (uint256 i = 0; i < voters.length; i++) {
            isEligible[voters[i]] = true;
        }
    }

    /// @dev Submit aggregated vote: seqNum, data, and array of (v,r,s) from participants.
    /// Caller provides signatures from at least THRESHOLD eligible voters.
    function submitAggregatedVote(
        uint256 seqNum,
        bytes calldata data,
        uint8[] calldata v,
        bytes32[] calldata r,
        bytes32[] calldata s
    ) external {
        bytes32 dataHash = keccak256(data);
        require(!agreed[seqNum][dataHash], "already agreed");
        require(!sequenceComplete[seqNum], "sequence complete");
        require(v.length >= THRESHOLD, "below threshold");
        require(v.length == r.length && r.length == s.length, "length mismatch");

        bytes32 msgHash = keccak256(abi.encodePacked(seqNum, data));
        address[] memory signers = new address[](v.length);

        for (uint256 i = 0; i < v.length; i++) {
            address signer = ecrecover(msgHash, v[i], r[i], s[i]);
            require(isEligible[signer], "not eligible");
            signers[i] = signer;
            for (uint256 j = 0; j < i; j++) {
                require(signers[j] != signer, "duplicate vote");
            }
        }

        agreed[seqNum][dataHash] = true;
        sequenceComplete[seqNum] = true;
    }

    function isAgreed(uint256 seqNum, bytes32 dataHash) external view returns (bool) {
        return agreed[seqNum][dataHash];
    }
}
