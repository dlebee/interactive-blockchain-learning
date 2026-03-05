// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Off-chain MPC threshold voting: N participants compute a threshold signature off-chain.
/// One EOA submits the single resulting signature. Gas is constant regardless of signer count.
/// The MPC protocol produces a signature from a derived address; the contract verifies it.
contract MPCThresholdVoting {
    address public immutable MPC_SIGNER;

    mapping(uint256 => mapping(bytes32 => bool)) public agreed;
    mapping(uint256 => bool) public sequenceComplete;

    constructor(address mpcSigner) {
        require(mpcSigner != address(0), "zero address");
        MPC_SIGNER = mpcSigner;
    }

    /// @dev Submit the MPC-produced threshold signature. One tx, one ecrecover.
    function submitVote(
        uint256 seqNum,
        bytes calldata data,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        bytes32 dataHash = keccak256(data);
        require(!agreed[seqNum][dataHash], "already agreed");
        require(!sequenceComplete[seqNum], "sequence complete");

        address signer = ecrecover(
            keccak256(abi.encodePacked(seqNum, data)),
            v,
            r,
            s
        );
        require(signer == MPC_SIGNER, "invalid MPC signature");

        agreed[seqNum][dataHash] = true;
        sequenceComplete[seqNum] = true;
    }

    function isAgreed(uint256 seqNum, bytes32 dataHash) external view returns (bool) {
        return agreed[seqNum][dataHash];
    }
}
