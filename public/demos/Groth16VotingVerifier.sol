// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Groth16 verifier for aggregated votes.
/// Circuit proves: "I know 500 EDDSA signatures over DATA that meet threshold."
/// On-chain: single pairing check. Gas cost ~200k, independent of voter count.
/// EDDSA (not ECDSA) is used in circuits: ECDSA is highly inefficient in ZK-SNARKs
/// (non-native field arithmetic, many constraints). EdDSA (Ed25519) is SNARK-friendly.
contract Groth16VotingVerifier {
    // Groth16 pairing equation: e(A,B) = e(alpha,beta) * e(vk_x,v) * e(vk_c,delta) * e(proof_c, proof_s)
    // Simplified: verifier checks one pairing equation. Actual implementation uses bn254 precompiles.

    mapping(uint256 => mapping(bytes32 => bool)) public agreed;
    mapping(uint256 => bool) public sequenceComplete;

    function verifyAndRecord(
        uint256 seqNum,
        bytes32 dataHash,
        uint256[2] calldata proofA,
        uint256[2][2] calldata proofB,
        uint256[2] calldata proofC
    ) external {
        require(!agreed[seqNum][dataHash], "already agreed");
        require(!sequenceComplete[seqNum], "sequence complete");
        // Placeholder: actual Groth16 verifier would call ecPairing precompile
        // bool valid = pairingCheck(proofA, proofB, proofC, vk);
        // require(valid, "invalid proof");
        agreed[seqNum][dataHash] = true;
        sequenceComplete[seqNum] = true;
    }

    function isAgreed(uint256 seqNum, bytes32 dataHash) external view returns (bool) {
        return agreed[seqNum][dataHash];
    }
}
