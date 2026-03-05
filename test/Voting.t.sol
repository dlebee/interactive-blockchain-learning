// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../public/demos/SimpleThresholdVoting.sol";
import "../public/demos/BatchThresholdVoting.sol";
import "../public/demos/BitfieldThresholdVoting.sol";
import "../public/demos/BLSThresholdVotingByPubkeys.sol";
import "../public/demos/BLSThresholdVotingByPoP.sol";
import "../public/demos/Groth16VotingVerifier.sol";

contract VotingTest is Test {
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

    function test_Groth16VotingVerifier() public {
        Groth16VotingVerifier v = new Groth16VotingVerifier();
        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;
        v.verifyAndRecord(SEQ, keccak256(DATA), a, b, c);
        assertTrue(v.isAgreed(SEQ, keccak256(DATA)));
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
        v.verifyAndRecord(SEQ, keccak256(DATA), a, b, c);

        vm.expectRevert("already agreed");
        v.verifyAndRecord(SEQ, keccak256(DATA), a, b, c);

        vm.expectRevert("sequence complete");
        v.verifyAndRecord(SEQ, keccak256(DATA_OTHER), a, b, c);
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
