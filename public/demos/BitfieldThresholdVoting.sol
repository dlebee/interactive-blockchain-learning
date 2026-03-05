// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Bitfield + ECDSA aggregation: one bitmap indicates who voted, verify signatures.
/// Benefits: (1) Less worried about double voting (bitfield enforces uniqueness).
/// (2) More gas efficient (compact representation, batch ecrecover).
contract BitfieldThresholdVoting {
    uint256 public immutable THRESHOLD;
    address[] public eligibleVoters;
    mapping(address => uint256) public voterIndex; // 1-based, 0 = not found

    mapping(uint256 => mapping(bytes32 => bool)) public agreed;
    mapping(uint256 => bool) public sequenceComplete;

    constructor(address[] memory voters, uint256 threshold) {
        THRESHOLD = threshold;
        eligibleVoters = voters;
        for (uint256 i = 0; i < voters.length; i++) {
            voterIndex[voters[i]] = i + 1;
        }
    }

    /// @dev bitfield: bit i set = voter i voted. v,r,s are parallel arrays for signers.
    /// bitfield prevents double voting: each bit can only be set once per (seqNum, data).
    mapping(uint256 => mapping(bytes32 => uint256)) public votedBitfield;

    function submitAggregatedVote(
        uint256 seqNum,
        bytes calldata data,
        uint256 bitfield,
        uint8[] calldata v,
        bytes32[] calldata r,
        bytes32[] calldata s
    ) external {
        bytes32 dataHash = keccak256(abi.encodePacked(seqNum, data));
        bytes32 dataHashKey = keccak256(data);
        require(!agreed[seqNum][dataHashKey], "already agreed");
        require(!sequenceComplete[seqNum], "sequence complete");

        uint256 stored = votedBitfield[seqNum][dataHash];
        require(stored & bitfield == 0, "already voted");

        uint256 count = 0;
        for (uint256 i = 0; i < v.length && count < THRESHOLD; i++) {
            uint256 bit = _getVoteBit(dataHash, bitfield, v[i], r[i], s[i]);
            stored = _mergeVote(stored, bit);
            count++;
        }
        require(count >= THRESHOLD, "below threshold");

        _recordConsensus(seqNum, dataHash, dataHashKey, stored);
    }

    function _recordConsensus(uint256 seqNum, bytes32 dataHash, bytes32 dataHashKey, uint256 stored) private {
        votedBitfield[seqNum][dataHash] = stored;
        agreed[seqNum][dataHashKey] = true;
        sequenceComplete[seqNum] = true;
    }

    function _getVoteBit(bytes32 dataHash, uint256 bitfield, uint8 vi, bytes32 ri, bytes32 si)
        internal
        view
        returns (uint256 bit)
    {
        address signer = ecrecover(dataHash, vi, ri, si);
        uint256 idx = voterIndex[signer];
        require(idx != 0, "not eligible");
        bit = uint256(1) << (idx - 1);
        require(bitfield & bit != 0, "bitfield mismatch");
    }

    function _mergeVote(uint256 stored, uint256 bit) internal pure returns (uint256) {
        require(stored & bit == 0, "duplicate");
        return stored | bit;
    }

    function isAgreed(uint256 seqNum, bytes32 dataHash) external view returns (bool) {
        return agreed[seqNum][dataHash];
    }
}
