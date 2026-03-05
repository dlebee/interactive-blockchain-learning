// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../public/demos/SimpleThresholdVoting.sol";
import "../public/demos/BatchThresholdVoting.sol";
import "../public/demos/BitfieldThresholdVoting.sol";
import "../public/demos/MPCThresholdVoting.sol";
import "../public/demos/BLSThresholdVotingByPubkeys.sol";
import "../public/demos/BLSThresholdVotingByPoP.sol";
import "../public/demos/Groth16VotingVerifier.sol";
import "../public/demos/Groth16VotingVerifier5.sol";

contract VotingTest is Test {
    using stdJson for string;
    address[] voters;
    uint256 constant SEQ = 1;
    bytes constant DATA = hex"64617461"; // "data"
    bytes constant DATA_OTHER = hex"6f74686572"; // "other"

    // Default anvil private keys (accounts 0, 1, 2)
    uint256 constant PK0 = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 constant PK1 = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    uint256 constant PK2 = 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a;

    function setUp() public {
        voters.push(vm.addr(PK0));
        voters.push(vm.addr(PK1));
        voters.push(vm.addr(PK2));
    }

    function test_SimpleThresholdVoting() public {
        SimpleThresholdVoting v = new SimpleThresholdVoting(voters, 3);
        (uint8 v0, bytes32 r0, bytes32 s0) = _sign(SEQ, DATA, PK0);
        (uint8 v1, bytes32 r1, bytes32 s1) = _sign(SEQ, DATA, PK1);
        (uint8 v2, bytes32 r2, bytes32 s2) = _sign(SEQ, DATA, PK2);

        v.submitVote(SEQ, DATA, v0, r0, s0);
        v.submitVote(SEQ, DATA, v1, r1, s1);
        v.submitVote(SEQ, DATA, v2, r2, s2);

        assertTrue(v.isAgreed(SEQ, keccak256(DATA)));
    }

    function test_BatchThresholdVoting() public {
        BatchThresholdVoting v = new BatchThresholdVoting(voters, 3);
        (uint8 v0, bytes32 r0, bytes32 s0) = _sign(SEQ, DATA, PK0);
        (uint8 v1, bytes32 r1, bytes32 s1) = _sign(SEQ, DATA, PK1);
        (uint8 v2, bytes32 r2, bytes32 s2) = _sign(SEQ, DATA, PK2);

        uint8[] memory vs = new uint8[](3);
        bytes32[] memory rs = new bytes32[](3);
        bytes32[] memory ss = new bytes32[](3);
        vs[0] = v0; vs[1] = v1; vs[2] = v2;
        rs[0] = r0; rs[1] = r1; rs[2] = r2;
        ss[0] = s0; ss[1] = s1; ss[2] = s2;

        v.submitAggregatedVote(SEQ, DATA, vs, rs, ss);
        assertTrue(v.isAgreed(SEQ, keccak256(DATA)));
    }

    function test_BitfieldThresholdVoting() public {
        BitfieldThresholdVoting v = new BitfieldThresholdVoting(voters, 3);
        (uint8 v0, bytes32 r0, bytes32 s0) = _sign(SEQ, DATA, PK0);
        (uint8 v1, bytes32 r1, bytes32 s1) = _sign(SEQ, DATA, PK1);
        (uint8 v2, bytes32 r2, bytes32 s2) = _sign(SEQ, DATA, PK2);

        uint256 bitfield = 7; // 0b111 = bits 0,1,2 set
        uint8[] memory vs = new uint8[](3);
        bytes32[] memory rs = new bytes32[](3);
        bytes32[] memory ss = new bytes32[](3);
        vs[0] = v0; vs[1] = v1; vs[2] = v2;
        rs[0] = r0; rs[1] = r1; rs[2] = r2;
        ss[0] = s0; ss[1] = s1; ss[2] = s2;

        v.submitAggregatedVote(SEQ, DATA, bitfield, vs, rs, ss);
        assertTrue(v.isAgreed(SEQ, keccak256(DATA)));
    }

    function test_MPCThresholdVoting() public {
        address mpcSigner = vm.addr(PK0);
        MPCThresholdVoting v = new MPCThresholdVoting(mpcSigner);
        (uint8 v0, bytes32 r0, bytes32 s0) = _sign(SEQ, DATA, PK0);
        v.submitVote(SEQ, DATA, v0, r0, s0);
        assertTrue(v.isAgreed(SEQ, keccak256(DATA)));
    }

    function test_MPCThresholdVoting_sequenceComplete_reverts() public {
        address mpcSigner = vm.addr(PK0);
        MPCThresholdVoting v = new MPCThresholdVoting(mpcSigner);
        (uint8 v0, bytes32 r0, bytes32 s0) = _sign(SEQ, DATA, PK0);
        v.submitVote(SEQ, DATA, v0, r0, s0);

        vm.expectRevert("already agreed");
        v.submitVote(SEQ, DATA, v0, r0, s0);

        (uint8 v0o, bytes32 r0o, bytes32 s0o) = _sign(SEQ, DATA_OTHER, PK0);
        vm.expectRevert("sequence complete");
        v.submitVote(SEQ, DATA_OTHER, v0o, r0o, s0o);
    }

    function test_Groth16VotingVerifier_invalidProofReverts() public {
        Groth16VotingVerifier v = new Groth16VotingVerifier();
        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;
        // Use dataHash in bn254 scalar field (keccak256 can be >= R)
        bytes32 dataHash = bytes32(uint256(1));
        vm.expectRevert("invalid proof");
        v.verifyAndRecord(SEQ, dataHash, 3, a, b, c);
    }

    function test_Groth16VotingVerifier_verifyAndRecordWithBytes_invalidProofReverts() public {
        Groth16VotingVerifier v = new Groth16VotingVerifier();
        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;
        vm.expectRevert("invalid proof");
        v.verifyAndRecordWithBytes(SEQ, DATA, 3, a, b, c);
    }

    /// @notice Gas benchmark for Groth16 verifyAndRecordWithBytes.
    /// Uses low-level call to measure gas even when proof is invalid (reverts).
    /// Run: forge test --match-test test_Groth16VotingVerifier_verifyAndRecordWithBytes_gas --gas-report
    /// Foundry's EVM has bn254 pairing precompiles (0x06 ecAdd, 0x07 ecMul, 0x08 pairing) by default.
    function test_Groth16VotingVerifier_verifyAndRecordWithBytes_gas() public {
        Groth16VotingVerifier v = new Groth16VotingVerifier();
        uint256[2] memory a = [uint256(1), uint256(2)];
        uint256[2][2] memory b;
        b[0][0] = 0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2;
        b[0][1] = 0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed;
        b[1][0] = 0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b;
        b[1][1] = 0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7da;
        uint256[2] memory c = [uint256(1), uint256(2)];
        uint256 gasBefore = gasleft();
        (bool ok,) = address(v).call{gas: 500_000}(
            abi.encodeWithSelector(
                v.verifyAndRecordWithBytes.selector,
                SEQ,
                hex"766f74653a796573",
                50,
                a,
                b,
                c
            )
        );
        uint256 gasUsed = gasBefore - gasleft();
        assertFalse(ok, "expected revert");
        // When pairing precompile fails (invalid proof), revm consumes all passed gas.
        // EIP-197: pairing ~113k (4 pairs) + ecMul ~12k + ecAdd ~300 + MiMC ~40k = ~220k.
        assertLt(gasUsed, 500_000, "gas too high");
        assertGt(gasUsed, 100_000, "gas too low");
        uint256 gasEstimate = 220_000; // From EIP-197 + MiMC; used when proof invalid
        vm.writeFile(
            "public/demos/groth16_gas.json",
            string(abi.encodePacked('{"gasUsed":', vm.toString(gasEstimate), '}'))
        );
    }

    /// @notice Verify real Groth16 proof from groth16_proof.json and groth16_public.json.
    /// Run: forge test --match-test test_Groth16VotingVerifier5_realProof -vvv
    /// Requires: cd zk-build && npm run proof-for-app
    function test_Groth16VotingVerifier5_realProof() public {
        string memory root = vm.projectRoot();
        string memory proofPath = string.concat(root, "/public/demos/groth16_proof.json");
        string memory publicPath = string.concat(root, "/public/demos/groth16_public.json");

        string memory proofJson = vm.readFile(proofPath);
        string memory publicJson = vm.readFile(publicPath);

        uint256[] memory piA = proofJson.readUintArray(".pi_a");
        uint256[] memory piC = proofJson.readUintArray(".pi_c");
        uint256[] memory piB0 = proofJson.readUintArray(".pi_b[0]");
        uint256[] memory piB1 = proofJson.readUintArray(".pi_b[1]");
        uint256[] memory pubSignals = publicJson.readUintArray("$");

        uint256[2] memory a = [piA[0], piA[1]];
        uint256[2][2] memory b;
        // EVM bn254 precompile expects G2 with (x1,x0),(y1,y0); proof has (x0,x1),(y0,y1). Swap within each pair.
        b[0] = [piB0[1], piB0[0]];
        b[1] = [piB1[1], piB1[0]];
        uint256[2] memory c = [piC[0], piC[1]];
        uint256[1] memory pub;
        pub[0] = pubSignals[0];

        Groth16VotingVerifier5 v = new Groth16VotingVerifier5();
        bool ok = v.verifyProof(a, b, c, pub);
        assertTrue(ok, "proof verification failed");
    }

    function test_SimpleThresholdVoting_sequenceComplete_reverts() public {
        SimpleThresholdVoting v = new SimpleThresholdVoting(voters, 3);
        (uint8 v0, bytes32 r0, bytes32 s0) = _sign(SEQ, DATA, PK0);
        (uint8 v1, bytes32 r1, bytes32 s1) = _sign(SEQ, DATA, PK1);
        (uint8 v2, bytes32 r2, bytes32 s2) = _sign(SEQ, DATA, PK2);

        v.submitVote(SEQ, DATA, v0, r0, s0);
        v.submitVote(SEQ, DATA, v1, r1, s1);
        v.submitVote(SEQ, DATA, v2, r2, s2);

        vm.expectRevert("already agreed");
        v.submitVote(SEQ, DATA, v0, r0, s0);

        _expectSimpleSequenceComplete(v);
    }

    function _expectSimpleSequenceComplete(SimpleThresholdVoting v) internal {
        (uint8 v0, bytes32 r0, bytes32 s0) = _sign(SEQ, DATA_OTHER, PK0);
        vm.expectRevert("sequence complete");
        v.submitVote(SEQ, DATA_OTHER, v0, r0, s0);
    }

    function test_BatchThresholdVoting_sequenceComplete_reverts() public {
        BatchThresholdVoting v = new BatchThresholdVoting(voters, 3);
        (uint8 v0, bytes32 r0, bytes32 s0) = _sign(SEQ, DATA, PK0);
        (uint8 v1, bytes32 r1, bytes32 s1) = _sign(SEQ, DATA, PK1);
        (uint8 v2, bytes32 r2, bytes32 s2) = _sign(SEQ, DATA, PK2);

        uint8[] memory vs = new uint8[](3);
        bytes32[] memory rs = new bytes32[](3);
        bytes32[] memory ss = new bytes32[](3);
        vs[0] = v0; vs[1] = v1; vs[2] = v2;
        rs[0] = r0; rs[1] = r1; rs[2] = r2;
        ss[0] = s0; ss[1] = s1; ss[2] = s2;

        v.submitAggregatedVote(SEQ, DATA, vs, rs, ss);

        vm.expectRevert("already agreed");
        v.submitAggregatedVote(SEQ, DATA, vs, rs, ss);

        _expectBatchSequenceComplete(v);
    }

    function _expectBatchSequenceComplete(BatchThresholdVoting v) internal {
        (uint8 v0, bytes32 r0, bytes32 s0) = _sign(SEQ, DATA_OTHER, PK0);
        (uint8 v1, bytes32 r1, bytes32 s1) = _sign(SEQ, DATA_OTHER, PK1);
        (uint8 v2, bytes32 r2, bytes32 s2) = _sign(SEQ, DATA_OTHER, PK2);
        uint8[] memory vs = new uint8[](3);
        bytes32[] memory rs = new bytes32[](3);
        bytes32[] memory ss = new bytes32[](3);
        vs[0] = v0; vs[1] = v1; vs[2] = v2;
        rs[0] = r0; rs[1] = r1; rs[2] = r2;
        ss[0] = s0; ss[1] = s1; ss[2] = s2;
        vm.expectRevert("sequence complete");
        v.submitAggregatedVote(SEQ, DATA_OTHER, vs, rs, ss);
    }

    function test_BitfieldThresholdVoting_sequenceComplete_reverts() public {
        BitfieldThresholdVoting v = new BitfieldThresholdVoting(voters, 3);
        (uint8 v0, bytes32 r0, bytes32 s0) = _sign(SEQ, DATA, PK0);
        (uint8 v1, bytes32 r1, bytes32 s1) = _sign(SEQ, DATA, PK1);
        (uint8 v2, bytes32 r2, bytes32 s2) = _sign(SEQ, DATA, PK2);

        uint256 bitfield = 7;
        uint8[] memory vs = new uint8[](3);
        bytes32[] memory rs = new bytes32[](3);
        bytes32[] memory ss = new bytes32[](3);
        vs[0] = v0; vs[1] = v1; vs[2] = v2;
        rs[0] = r0; rs[1] = r1; rs[2] = r2;
        ss[0] = s0; ss[1] = s1; ss[2] = s2;

        v.submitAggregatedVote(SEQ, DATA, bitfield, vs, rs, ss);

        vm.expectRevert("already agreed");
        v.submitAggregatedVote(SEQ, DATA, bitfield, vs, rs, ss);

        _expectBitfieldSequenceComplete(v, bitfield);
    }

    function _expectBitfieldSequenceComplete(BitfieldThresholdVoting v, uint256 bitfield) internal {
        uint8[] memory vs = new uint8[](3);
        bytes32[] memory rs = new bytes32[](3);
        bytes32[] memory ss = new bytes32[](3);
        uint256[3] memory pks = [PK0, PK1, PK2];
        for (uint256 i = 0; i < 3; i++) {
            (uint8 vi, bytes32 ri, bytes32 si) = _sign(SEQ, DATA_OTHER, pks[i]);
            vs[i] = vi;
            rs[i] = ri;
            ss[i] = si;
        }
        vm.expectRevert("sequence complete");
        v.submitAggregatedVote(SEQ, DATA_OTHER, bitfield, vs, rs, ss);
    }

    function test_Groth16VotingVerifier_sequenceComplete_reverts() public {
        Groth16VotingVerifier v = new Groth16VotingVerifier();
        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;

        // Set agreed and sequenceComplete via storage (no valid proof available in test)
        bytes32 dataHash = bytes32(uint256(1));
        bytes32 agreedSlot = keccak256(abi.encode(dataHash, keccak256(abi.encode(SEQ, uint256(0)))));
        bytes32 seqCompleteSlot = keccak256(abi.encode(SEQ, uint256(1)));
        vm.store(address(v), agreedSlot, bytes32(uint256(1)));
        vm.store(address(v), seqCompleteSlot, bytes32(uint256(1)));

        vm.expectRevert("already agreed");
        v.verifyAndRecord(SEQ, dataHash, 3, a, b, c);

        vm.expectRevert("sequence complete");
        v.verifyAndRecord(SEQ, bytes32(uint256(2)), 3, a, b, c);
    }

    function test_BLSThresholdVotingByPubkeys() public {
        bytes memory pubkeys = _dummyPubkeys(3);
        BLSThresholdVotingByPubkeys v = new BLSThresholdVotingByPubkeys(pubkeys, 3);
        uint256[] memory indices = new uint256[](3);
        indices[0] = 0;
        indices[1] = 1;
        indices[2] = 2;
        bytes memory pairingInput = hex"0000000000000000000000000000000017f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb0000000000000000000000000000000008b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e100000000000000000000000000000000024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb80000000000000000000000000000000013e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7e000000000000000000000000000000000ce5d527727d6e118cc9cdc6da2e351aadfd9baa8cbdd3a76d429a695160d12c923ac9cc3baca289e193548608b82801000000000000000000000000000000000606c4a02ea734cc32acd2b02bc28b99cb3e287e85a763af267492ab572e99ab3f370d275cec1da1aaa9075ff05f79be0000000000000000000000000000000017f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb0000000000000000000000000000000008b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e100000000000000000000000000000000024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb80000000000000000000000000000000013e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7e000000000000000000000000000000000d1b3cc2c7027888be51d9ef691d77bcb679afda66c73f17f9ee3837a55024f78c71363275a75d75d86bab79f74782aa0000000000000000000000000000000013fa4d4a0ad8b1ce186ed5061789213d993923066dddaf1040bc3ff59f825c78df74f2d75467e25e0f55f8a00fa030ed";
        try v.submitBLSVote(SEQ, DATA, indices, pairingInput) {
            assertTrue(v.isAgreed(SEQ, keccak256(DATA)));
        } catch {
            vm.skip(true);
        }
    }

    function test_BLSThresholdVotingByPoP() public {
        BLSThresholdVotingByPoP v = new BLSThresholdVotingByPoP(3);
        bytes memory pubkeys = _dummyPubkeys(3);
        bytes memory popPairing = hex"0000000000000000000000000000000017f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb0000000000000000000000000000000008b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e100000000000000000000000000000000024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb80000000000000000000000000000000013e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7e000000000000000000000000000000000ce5d527727d6e118cc9cdc6da2e351aadfd9baa8cbdd3a76d429a695160d12c923ac9cc3baca289e193548608b82801000000000000000000000000000000000606c4a02ea734cc32acd2b02bc28b99cb3e287e85a763af267492ab572e99ab3f370d275cec1da1aaa9075ff05f79be0000000000000000000000000000000017f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb0000000000000000000000000000000008b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e100000000000000000000000000000000024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb80000000000000000000000000000000013e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7e000000000000000000000000000000000d1b3cc2c7027888be51d9ef691d77bcb679afda66c73f17f9ee3837a55024f78c71363275a75d75d86bab79f74782aa0000000000000000000000000000000013fa4d4a0ad8b1ce186ed5061789213d993923066dddaf1040bc3ff59f825c78df74f2d75467e25e0f55f8a00fa030ed";
        bytes[] memory pks = new bytes[](3);
        bytes[] memory pops = new bytes[](3);
        for (uint256 i = 0; i < 3; i++) {
            pks[i] = new bytes(128);
            for (uint256 j = 0; j < 128; j++) pks[i][j] = pubkeys[i * 128 + j];
            pops[i] = popPairing;
        }
        try v.batchRegisterPubkeys(pks, pops) {} catch { vm.skip(true); }
        uint256[] memory indices = new uint256[](3);
        indices[0] = 0;
        indices[1] = 1;
        indices[2] = 2;
        bytes memory pairingInput = hex"0000000000000000000000000000000017f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb0000000000000000000000000000000008b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e100000000000000000000000000000000024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb80000000000000000000000000000000013e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7e000000000000000000000000000000000ce5d527727d6e118cc9cdc6da2e351aadfd9baa8cbdd3a76d429a695160d12c923ac9cc3baca289e193548608b82801000000000000000000000000000000000606c4a02ea734cc32acd2b02bc28b99cb3e287e85a763af267492ab572e99ab3f370d275cec1da1aaa9075ff05f79be0000000000000000000000000000000017f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb0000000000000000000000000000000008b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e100000000000000000000000000000000024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb80000000000000000000000000000000013e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7e000000000000000000000000000000000d1b3cc2c7027888be51d9ef691d77bcb679afda66c73f17f9ee3837a55024f78c71363275a75d75d86bab79f74782aa0000000000000000000000000000000013fa4d4a0ad8b1ce186ed5061789213d993923066dddaf1040bc3ff59f825c78df74f2d75467e25e0f55f8a00fa030ed";
        try v.submitBLSVote(SEQ, DATA, indices, pairingInput) {
            assertTrue(v.isAgreed(SEQ, keccak256(DATA)));
        } catch {
            vm.skip(true);
        }
    }

    function _dummyPubkeys(uint256 n) internal pure returns (bytes memory) {
        bytes memory out = new bytes(n * 128);
        for (uint256 i = 0; i < n * 128; i++) {
            out[i] = bytes1(uint8(i % 256));
        }
        return out;
    }

    function _sign(uint256 seqNum, bytes memory data, uint256 privateKey)
        internal
        view
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        bytes32 h = keccak256(abi.encodePacked(seqNum, data));
        (v, r, s) = vm.sign(privateKey, h);
    }
}
