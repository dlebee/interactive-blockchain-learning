// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title BLS threshold voting by Proof of Possession: pubkeys must prove key possession before use.
/// registerPubkey verifies PoP pairing (e.g. signer signs hash of pubkey); only then can pubkey vote.
/// Prevents rogue key attacks: attacker cannot use others' pubkeys without their private key.
contract BLSThresholdVotingByPoP {
    address private constant G1MSM = address(0x0c);
    address private constant PAIRING = address(0x0f);

    uint256 public immutable THRESHOLD;
    bytes public pubkeys; // concatenated 128-byte G1 points (only PoP-verified)
    uint256 public pubkeyCount;

    mapping(uint256 => mapping(bytes32 => bool)) public agreed;
    mapping(uint256 => bool) public sequenceComplete;

    constructor(uint256 threshold) {
        THRESHOLD = threshold;
    }

    /// @dev Register a pubkey after verifying Proof of Possession.
    /// Caller provides pairingInput for e(pubkey, H(pop_msg)) * e(-G1, popSig) == 1.
    /// pop_msg is typically hash(pubkey) or "BLS_POP" || pubkey; H maps to G2.
    function registerPubkey(bytes calldata pubkey, bytes calldata popPairingInput) external {
        _verifyAndAppendPubkey(pubkey, popPairingInput);
    }

    /// @dev Batch register pubkeys. Same as multiple registerPubkey calls but in one tx.
    function batchRegisterPubkeys(
        bytes[] calldata pubkeysBatch,
        bytes[] calldata popPairingInputs
    ) external {
        require(pubkeysBatch.length == popPairingInputs.length, "length mismatch");
        for (uint256 i = 0; i < pubkeysBatch.length; i++) {
            _verifyAndAppendPubkey(pubkeysBatch[i], popPairingInputs[i]);
        }
    }

    function _verifyAndAppendPubkey(bytes calldata pubkey, bytes calldata popPairingInput) internal {
        require(pubkey.length == 128, "bad pubkey len");
        require(popPairingInput.length == 768, "pop pairing len");

        (bool ok,) = PAIRING.staticcall(popPairingInput);
        require(ok, "PoP pairing failed");
        uint256 result;
        assembly {
            if lt(returndatasize(), 32) { revert(0, 0) }
            returndatacopy(0x80, 0, 32)
            result := mload(0x80)
        }
        require(result & 0xff == 1, "invalid PoP");

        pubkeys = bytes.concat(pubkeys, pubkey);
        pubkeyCount++;
    }

    /// @dev Submit aggregated BLS vote. Same as ByPubkeys but uses only registered (PoP-verified) pubkeys.
    function submitBLSVote(
        uint256 seqNum,
        bytes calldata data,
        uint256[] calldata signerIndices,
        bytes calldata pairingInput
    ) external {
        bytes32 dataHash = keccak256(data);
        require(!agreed[seqNum][dataHash], "already agreed");
        require(!sequenceComplete[seqNum], "sequence complete");
        require(signerIndices.length >= THRESHOLD, "below threshold");
        require(pubkeyCount >= THRESHOLD, "not enough pubkeys");
        require(pairingInput.length == 768, "pairing len");

        bytes memory msmInput = _buildG1MSMInput(signerIndices);
        (bool ok, bytes memory aggPk) = G1MSM.staticcall(msmInput);
        require(ok && aggPk.length >= 128, "G1MSM failed");

        require(_bytesEqualCalldata(aggPk, pairingInput, 256), "agg_pk mismatch");

        (ok,) = PAIRING.staticcall(pairingInput);
        require(ok, "pairing call failed");
        uint256 result;
        assembly {
            if lt(returndatasize(), 32) { revert(0, 0) }
            returndatacopy(0x80, 0, 32)
            result := mload(0x80)
        }
        require(result & 0xff == 1, "invalid BLS");

        agreed[seqNum][dataHash] = true;
        sequenceComplete[seqNum] = true;
    }

    function _buildG1MSMInput(uint256[] calldata indices) internal view returns (bytes memory) {
        uint256 n = indices.length;
        bytes memory input = new bytes(160 * n);
        bytes32 scalarOne = 0x0000000000000000000000000000000000000000000000000000000000000001;
        for (uint256 i = 0; i < n; i++) {
            uint256 idx = indices[i];
            require(idx * 128 + 128 <= pubkeys.length, "bad index");
            for (uint256 j = 0; j < 128; j++) {
                input[i * 160 + j] = pubkeys[idx * 128 + j];
            }
            for (uint256 j = 0; j < 32; j++) {
                input[i * 160 + 128 + j] = bytes1(uint8(uint256(scalarOne) >> (8 * (31 - j))));
            }
        }
        return input;
    }

    function _bytesEqualCalldata(bytes memory a, bytes calldata b, uint256 bOffset) internal pure returns (bool) {
        if (a.length < 128 || bOffset + 128 > b.length) return false;
        for (uint256 i = 0; i < 128; i++) {
            if (a[i] != b[bOffset + i]) return false;
        }
        return true;
    }

    function isAgreed(uint256 seqNum, bytes32 dataHash) external view returns (bool) {
        return agreed[seqNum][dataHash];
    }
}
