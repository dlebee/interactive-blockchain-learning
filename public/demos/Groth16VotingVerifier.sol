// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MiMC.sol";

/// @title Groth16 verifier for aggregated votes.
/// Circuit proves: "I know N EdDSA signatures over DATA and count >= threshold."
/// Public inputs: dataHash, threshold. On-chain: single pairing check (~200k gas).
/// Replace the verification key constants when compiling your circuit (e.g. snarkjs).
///
/// Hash: dataHash = MiMC.hashBytes(seqNum, data) = MiMC(seqNum, keccak256(data) % R).
/// Use verifyAndRecordWithBytes() to pass raw data; contract computes hash on-chain.
contract Groth16VotingVerifier {
    // bn254 scalar field; public inputs must be in [0, r)
    uint256 private constant R =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint256 private constant Q =
        21888242871839275222246405745257275088696311157297823662689037894645226208583;

    address private constant EC_ADD = address(0x06);
    address private constant EC_MUL = address(0x07);
    address private constant PAIRING = address(0x08);

    // Verification key (replace with output from snarkjs when compiling your circuit)
    // alpha, beta, gamma, delta in G1/G2; IC[0..nPublic] for public input commitment
    uint256 private constant ALPHA_X = 1;
    uint256 private constant ALPHA_Y = 2;
    uint256 private constant BETA_X1 = 0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2;
    uint256 private constant BETA_X0 = 0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed;
    uint256 private constant BETA_Y1 = 0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b;
    uint256 private constant BETA_Y0 = 0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7da;
    uint256 private constant GAMMA_X1 = 0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2;
    uint256 private constant GAMMA_X0 = 0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed;
    uint256 private constant GAMMA_Y1 = 0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b;
    uint256 private constant GAMMA_Y0 = 0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7da;
    uint256 private constant DELTA_X1 = 0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2;
    uint256 private constant DELTA_X0 = 0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed;
    uint256 private constant DELTA_Y1 = 0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b;
    uint256 private constant DELTA_Y0 = 0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7da;
    uint256 private constant IC0_X = 1;
    uint256 private constant IC0_Y = 2;
    uint256 private constant IC1_X = 1;
    uint256 private constant IC1_Y = 2;
    uint256 private constant IC2_X = 1;
    uint256 private constant IC2_Y = 2;

    mapping(uint256 => mapping(bytes32 => bool)) public agreed;
    mapping(uint256 => bool) public sequenceComplete;

    /// @param seqNum Sequence number for this vote round
    /// @param dataHash MiMC.hashBytes(seqNum, data) - must be < R
    /// @param threshold Minimum number of valid signatures (must be < R)
    /// @param proofA Proof point A (G1)
    /// @param proofB Proof point B (G2)
    /// @param proofC Proof point C (G1)
    function verifyAndRecord(
        uint256 seqNum,
        bytes32 dataHash,
        uint256 threshold,
        uint256[2] calldata proofA,
        uint256[2][2] calldata proofB,
        uint256[2] calldata proofC
    ) external {
        _verifyAndRecord(seqNum, dataHash, threshold, proofA, proofB, proofC);
    }

    /// @dev Overload: pass (seqNum, data) and the contract computes dataHash = MiMC(seqNum, keccak256(data) % R)
    /// on-chain. Use when you want the contract to verify the hash instead of trusting the caller.
    function verifyAndRecordWithBytes(
        uint256 seqNum,
        bytes calldata data,
        uint256 threshold,
        uint256[2] calldata proofA,
        uint256[2][2] calldata proofB,
        uint256[2] calldata proofC
    ) external {
        bytes32 dataHashBytes = bytes32(MiMC.hashBytes(seqNum, data));
        _verifyAndRecord(seqNum, dataHashBytes, threshold, proofA, proofB, proofC);
    }

    function _verifyAndRecord(
        uint256 seqNum,
        bytes32 dataHash,
        uint256 threshold,
        uint256[2] calldata proofA,
        uint256[2][2] calldata proofB,
        uint256[2] calldata proofC
    ) internal {
        require(!agreed[seqNum][dataHash], "already agreed");
        require(!sequenceComplete[seqNum], "sequence complete");

        uint256 dataHashU = uint256(dataHash);
        require(dataHashU < R, "dataHash out of field");
        require(threshold < R, "threshold out of field");

        uint256[2] memory pubSignals = [dataHashU, threshold];
        require(_verifyProof(proofA, proofB, proofC, pubSignals), "invalid proof");

        agreed[seqNum][dataHash] = true;
        sequenceComplete[seqNum] = true;
    }

    function _verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] memory pubSignals
    ) internal view returns (bool) {
        // vk_x = IC0 + pubSignals[0]*IC1 + pubSignals[1]*IC2
        (uint256 vkX, uint256 vkY) = _computeVkX(pubSignals);

        // Pairing: e(-A,B) * e(alpha,beta) * e(vk_x,gamma) * e(C,delta) == 1
        // bn254 precompile expects 768 bytes = 4 pairs * 192 bytes (G1: 64, G2: 128)
        bytes memory pairingInput = new bytes(768);
        uint256 offset = 0;

        // Pair 1: -A, B
        _storeG1Neg(pairingInput, offset, a[0], a[1]);
        offset += 64;
        _storeG2(pairingInput, offset, b[0][0], b[0][1], b[1][0], b[1][1]);
        offset += 128;

        // Pair 2: alpha, beta
        _storeG1(pairingInput, offset, ALPHA_X, ALPHA_Y);
        offset += 64;
        _storeG2(pairingInput, offset, BETA_X1, BETA_X0, BETA_Y1, BETA_Y0);
        offset += 128;

        // Pair 3: vk_x, gamma
        _storeG1(pairingInput, offset, vkX, vkY);
        offset += 64;
        _storeG2(pairingInput, offset, GAMMA_X1, GAMMA_X0, GAMMA_Y1, GAMMA_Y0);
        offset += 128;

        // Pair 4: C, delta
        _storeG1(pairingInput, offset, c[0], c[1]);
        offset += 64;
        _storeG2(pairingInput, offset, DELTA_X1, DELTA_X0, DELTA_Y1, DELTA_Y0);

        (bool ok,) = PAIRING.staticcall(pairingInput);
        if (!ok) return false;
        uint256 result;
        assembly {
            if lt(returndatasize(), 32) { return(0, 0) }
            returndatacopy(0x80, 0, 32)
            result := mload(0x80)
        }
        return result == 1;
    }

    function _computeVkX(uint256[2] memory pubSignals) internal view returns (uint256 x, uint256 y) {
        // Start with IC0
        x = IC0_X;
        y = IC0_Y;
        // Add pubSignals[0] * IC1
        (uint256 x1, uint256 y1) = _ecMul(IC1_X, IC1_Y, pubSignals[0]);
        (x, y) = _ecAdd(x, y, x1, y1);
        // Add pubSignals[1] * IC2
        (x1, y1) = _ecMul(IC2_X, IC2_Y, pubSignals[1]);
        (x, y) = _ecAdd(x, y, x1, y1);
    }

    function _ecMul(
        uint256 px,
        uint256 py,
        uint256 s
    ) internal view returns (uint256 x, uint256 y) {
        bytes memory input = abi.encodePacked(px, py, s);
        (bool ok, bytes memory out) = EC_MUL.staticcall(input);
        require(ok && out.length >= 64, "ecMul failed");
        assembly {
            x := mload(add(out, 32))
            y := mload(add(out, 64))
        }
    }

    function _ecAdd(
        uint256 x1,
        uint256 y1,
        uint256 x2,
        uint256 y2
    ) internal view returns (uint256 x, uint256 y) {
        bytes memory input = abi.encodePacked(x1, y1, x2, y2);
        (bool ok, bytes memory out) = EC_ADD.staticcall(input);
        require(ok && out.length >= 64, "ecAdd failed");
        assembly {
            x := mload(add(out, 32))
            y := mload(add(out, 64))
        }
    }

    function _storeG1(bytes memory buf, uint256 offset, uint256 x, uint256 y) internal pure {
        assembly {
            mstore(add(add(buf, 32), offset), x)
            mstore(add(add(buf, 32), add(offset, 32)), y)
        }
    }

    function _storeG1Neg(bytes memory buf, uint256 offset, uint256 x, uint256 y) internal pure {
        uint256 ny = Q - (y % Q);
        _storeG1(buf, offset, x, ny);
    }

    function _storeG2(
        bytes memory buf,
        uint256 offset,
        uint256 x1,
        uint256 x0,
        uint256 y1,
        uint256 y0
    ) internal pure {
        assembly {
            let p := add(add(buf, 32), offset)
            mstore(p, x1)
            mstore(add(p, 32), x0)
            mstore(add(p, 64), y1)
            mstore(add(p, 96), y0)
        }
    }

    function isAgreed(uint256 seqNum, bytes32 dataHash) external view returns (bool) {
        return agreed[seqNum][dataHash];
    }
}
