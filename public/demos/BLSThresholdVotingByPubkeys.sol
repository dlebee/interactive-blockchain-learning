// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title BLS threshold voting by pubkeys: verifies aggregate against eligible G1 pubkeys.
/// Prevents rogue key attacks by checking agg_pk = sum(selected eligible pubkeys) via G1MSM.
/// Caller provides pairing input; we verify agg_pk matches G1MSM(selected pubkeys).
contract BLSThresholdVotingByPubkeys {
    address private constant G1MSM = address(0x0c);
    address private constant PAIRING = address(0x0f);

    uint256 public immutable THRESHOLD;
    bytes public pubkeys; // concatenated 128-byte G1 points

    mapping(uint256 => mapping(bytes32 => bool)) public agreed;
    mapping(uint256 => bool) public sequenceComplete;

    constructor(bytes memory pubkeysConcatenated, uint256 threshold) {
        require(pubkeysConcatenated.length % 128 == 0, "bad pubkey len");
        require(pubkeysConcatenated.length >= 128 * threshold, "too few pubkeys");
        THRESHOLD = threshold;
        pubkeys = pubkeysConcatenated;
    }

    /// @dev Submit aggregated BLS vote. Verifies agg_pk in pairing matches G1MSM of selected pubkeys.
    /// @param signerIndices indices into pubkeys array (0-based)
    /// @param pairingInput 768 bytes EIP-2537 format: G2||G1 per pair. agg_pk at bytes 256-383.
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
