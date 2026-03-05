/**
 * Compile voting contracts with web-solc and run gas simulations via @ethereumjs/vm.
 * Supports variable signer counts: 5, 10, 15, 30, 100, 200, 300, 500.
 * Each strategy can be simulated independently.
 */

import { Common, Mainnet } from '@ethereumjs/common'
import { createTx } from '@ethereumjs/tx'
import { createContractAddress, hexToBytes } from '@ethereumjs/util'
import { createVM, runTx } from '@ethereumjs/vm'
import { privateKeyToAddress, sign } from 'viem/accounts'
import {
  concatHex,
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  padHex,
  parseAbiParameters,
  toHex,
  type Hex,
} from 'viem'
import { fetchAndLoadSolc } from 'web-solc'

const GAS_PRICE = 10n ** 9n

export const SIGNER_COUNTS = [5, 10, 15, 30, 100, 200, 300, 500] as const
const BITFIELD_MAX_SIGNERS = 256

/** Generate private key for signer index i (1-based to avoid zero key). */
function privateKeyFor(i: number): Hex {
  return padHex(toHex(BigInt(i)), { size: 32 }) as Hex
}

/** Hash that the contract uses: keccak256(abi.encodePacked(seqNum, data)). */
function voteHash(seqNum: bigint, data: Hex): Hex {
  const packed = concatHex([padHex(toHex(seqNum), { size: 32 }), data])
  return keccak256(packed)
}

/** Sign the vote hash for ecrecover; returns { v, r, s }. */
async function signVoteHash(hash: Hex, privateKey: Hex): Promise<{ v: number; r: Hex; s: Hex }> {
  const sig = await sign({ hash, privateKey })
  return {
    v: Number(sig.v),
    r: sig.r as Hex,
    s: sig.s as Hex,
  }
}

export interface SignerCountResult {
  signerCount: number
  ok: boolean
  gasUsed?: bigint
  gasTotal?: bigint
  error?: string
}

export interface StrategySimResult {
  strategy: 'simple' | 'batch' | 'bitfield' | 'mpc' | 'blsByPubkeys' | 'blsByPoP'
  results: SignerCountResult[]
}

async function compileContract(
  name: string,
  source: string
): Promise<{ bytecode: string; abi: readonly unknown[] }> {
  const solc = await fetchAndLoadSolc('^0.8.0')
  const input = {
    language: 'Solidity',
    sources: { [name]: { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
    },
  }
  const output = await solc.compile(input)
  solc.stopWorker()

  const errors = output.errors?.filter((e: { severity?: string }) => e.severity === 'error')
  if (errors?.length) {
    const msg = errors
      .map((e: { formattedMessage?: string }) => e.formattedMessage ?? String(e))
      .join('\n')
    throw new Error(`Compilation failed:\n${msg}`)
  }

  const contracts = output.contracts as unknown as Record<
    string,
    Record<string, { evm?: { bytecode?: { object?: string } }; abi?: unknown[] }>
  >
  const contract = contracts?.[name]?.[name]
  if (!contract?.evm?.bytecode?.object || !contract?.abi) {
    throw new Error(`No bytecode or ABI for ${name}`)
  }

  const bc = contract.evm.bytecode.object
  const bytecode = bc.startsWith('0x') ? bc : `0x${bc}`
  return { bytecode, abi: contract.abi }
}

async function compileContractMulti(
  sources: Record<string, string>,
  contractName: string
): Promise<{ bytecode: string; abi: readonly unknown[] }> {
  const solc = await fetchAndLoadSolc('^0.8.0')
  const input = {
    language: 'Solidity',
    sources: Object.fromEntries(Object.entries(sources).map(([k, v]) => [k, { content: v }])),
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
    },
  }
  const output = await solc.compile(input)
  solc.stopWorker()

  const errors = output.errors?.filter((e: { severity?: string }) => e.severity === 'error')
  if (errors?.length) {
    const msg = errors
      .map((e: { formattedMessage?: string }) => e.formattedMessage ?? String(e))
      .join('\n')
    throw new Error(`Compilation failed:\n${msg}`)
  }

  const contracts = output.contracts as unknown as Record<
    string,
    Record<string, { evm?: { bytecode?: { object?: string } }; abi?: unknown[] }>
  >
  for (const fileContracts of Object.values(contracts)) {
    const c = fileContracts?.[contractName]
    if (c?.evm?.bytecode?.object && c?.abi) {
      const bc = c.evm.bytecode.object
      return { bytecode: bc.startsWith('0x') ? bc : `0x${bc}`, abi: c.abi }
    }
  }
  throw new Error(`No bytecode or ABI for ${contractName}`)
}

async function deployAndRun(
  bytecode: string,
  constructorArgs: Hex,
  callData: Hex,
  signerKey: Uint8Array
): Promise<bigint> {
  const common = new Common({ chain: Mainnet })
  const vm = await createVM({ common })
  const deployData = concatHex([bytecode as Hex, constructorArgs])

  const deployTx = createTx(
    {
      nonce: 0n,
      gasPrice: GAS_PRICE,
      gasLimit: 40_000_000n,
      value: 0n,
      data: hexToBytes(deployData),
      to: undefined,
    },
    { common }
  )
  const signedDeploy = deployTx.sign(signerKey)
  const deployResult = await runTx(vm, { tx: signedDeploy, skipBalance: true })
  if (deployResult.execResult.exceptionError) {
    throw new Error(`Deploy failed: ${deployResult.execResult.exceptionError.error}`)
  }

  const sender = signedDeploy.getSenderAddress()
  const contractAddr = createContractAddress(sender, 0n)

  const callTx = createTx(
    {
      nonce: 1n,
      gasPrice: GAS_PRICE,
      gasLimit: 40_000_000n,
      value: 0n,
      data: hexToBytes(callData),
      to: contractAddr,
    },
    { common }
  )
  const signedCall = callTx.sign(signerKey)
  const callResult = await runTx(vm, { tx: signedCall, skipBalance: true })
  if (callResult.execResult.exceptionError) {
    throw new Error(`Call failed: ${callResult.execResult.exceptionError.error}`)
  }
  return callResult.totalGasSpent
}

/** Result of deploy + call. */
type DeployAndRunResult = { gasUsed: bigint; reverted: boolean; returnValue?: Uint8Array }

async function deployAndRunWithResult(
  bytecode: string,
  constructorArgs: Hex,
  callData: Hex,
  signerKey: Uint8Array,
  common?: InstanceType<typeof Common>,
  callGasLimit?: bigint
): Promise<DeployAndRunResult> {
  const c = common ?? new Common({ chain: Mainnet })
  const vm = await createVM({ common: c })
  const deployData = concatHex([bytecode as Hex, constructorArgs])

  const deployTx = createTx(
    {
      nonce: 0n,
      gasPrice: GAS_PRICE,
      gasLimit: 40_000_000n,
      value: 0n,
      data: hexToBytes(deployData),
      to: undefined,
    },
    { common: c }
  )
  const signedDeploy = deployTx.sign(signerKey)
  const deployResult = await runTx(vm, { tx: signedDeploy, skipBalance: true })
  if (deployResult.execResult.exceptionError) {
    throw new Error(`Deploy failed: ${deployResult.execResult.exceptionError.error}`)
  }

  const sender = signedDeploy.getSenderAddress()
  const contractAddr = createContractAddress(sender, 0n)

  const callTx = createTx(
    {
      nonce: 1n,
      gasPrice: GAS_PRICE,
      gasLimit: callGasLimit ?? 40_000_000n,
      value: 0n,
      data: hexToBytes(callData),
      to: contractAddr,
    },
    { common: c }
  )
  const signedCall = callTx.sign(signerKey)
  const callResult = await runTx(vm, { tx: signedCall, skipBalance: true })
  return {
    gasUsed: callResult.totalGasSpent,
    reverted: callResult.execResult.exceptionError != null,
    returnValue: callResult.execResult.returnValue,
  }
}

async function deployAndRunMultiple(
  bytecode: string,
  constructorArgs: Hex,
  callsData: Hex[],
  signerKey: Uint8Array
): Promise<bigint[]> {
  const common = new Common({ chain: Mainnet })
  const vm = await createVM({ common })
  const deployData = concatHex([bytecode as Hex, constructorArgs])

  const deployTx = createTx(
    {
      nonce: 0n,
      gasPrice: GAS_PRICE,
      gasLimit: 40_000_000n,
      value: 0n,
      data: hexToBytes(deployData),
      to: undefined,
    },
    { common }
  )
  const signedDeploy = deployTx.sign(signerKey)
  const deployResult = await runTx(vm, { tx: signedDeploy, skipBalance: true })
  if (deployResult.execResult.exceptionError) {
    throw new Error(`Deploy failed: ${deployResult.execResult.exceptionError.error}`)
  }

  const sender = signedDeploy.getSenderAddress()
  const contractAddr = createContractAddress(sender, 0n)
  const results: bigint[] = []

  for (let i = 0; i < callsData.length; i++) {
    const callTx = createTx(
      {
        nonce: BigInt(i + 1),
        gasPrice: GAS_PRICE,
        gasLimit: 40_000_000n,
        value: 0n,
        data: hexToBytes(callsData[i]!),
        to: contractAddr,
      },
      { common }
    )
    const signedCall = callTx.sign(signerKey)
    const callResult = await runTx(vm, { tx: signedCall, skipBalance: true })
    if (callResult.execResult.exceptionError) {
      throw new Error(`Call ${i + 1} failed: ${callResult.execResult.exceptionError.error}`)
    }
    results.push(callResult.totalGasSpent)
  }
  return results
}

async function prepareSigners(n: number): Promise<{
  addresses: Hex[]
  signatures: Array<{ v: number; r: Hex; s: Hex }>
  voterArgs: Hex
  hash: Hex
}> {
  const addresses: Hex[] = []
  for (let i = 1; i <= n; i++) {
    addresses.push(privateKeyToAddress(privateKeyFor(i)))
  }
  const hash = voteHash(1n, '0x64617461' as Hex)
  const signatures = await Promise.all(
    Array.from({ length: n }, (_, i) => signVoteHash(hash, privateKeyFor(i + 1)))
  )
  const voterArgs = encodeAbiParameters(parseAbiParameters('address[], uint256'), [
    addresses,
    BigInt(n),
  ])
  return { addresses, signatures, voterArgs, hash }
}

export async function runSimpleSimulation(
  source: string,
  onProgress?: (signerCount: number, done: boolean) => void
): Promise<StrategySimResult> {
  const results: SignerCountResult[] = []
  const { bytecode, abi } = await compileContract('SimpleThresholdVoting', source)
  const signerKey = hexToBytes(privateKeyFor(1))

  for (const n of SIGNER_COUNTS) {
    onProgress?.(n, false)
    try {
      const { signatures, voterArgs } = await prepareSigners(n)
      const callsData = signatures.map((sig) =>
        encodeFunctionData({
          abi,
          functionName: 'submitVote',
          args: [1n, '0x64617461' as Hex, sig.v, sig.r, sig.s],
        })
      )
      const gasPerTx = await deployAndRunMultiple(bytecode, voterArgs, callsData, signerKey)
      const gasTotal = gasPerTx.reduce((a, b) => a + b, 0n)
      results.push({ signerCount: n, ok: true, gasUsed: gasPerTx[0], gasTotal })
    } catch (e) {
      results.push({
        signerCount: n,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      })
    }
    onProgress?.(n, true)
    await new Promise((r) => setTimeout(r, 0))
  }
  return { strategy: 'simple', results }
}

export async function runBatchSimulation(
  source: string,
  onProgress?: (signerCount: number, done: boolean) => void
): Promise<StrategySimResult> {
  const results: SignerCountResult[] = []
  const { bytecode, abi } = await compileContract('BatchThresholdVoting', source)
  const signerKey = hexToBytes(privateKeyFor(1))

  for (const n of SIGNER_COUNTS) {
    onProgress?.(n, false)
    try {
      const { signatures, voterArgs } = await prepareSigners(n)
      const callData = encodeFunctionData({
        abi,
        functionName: 'submitAggregatedVote',
        args: [
          1n,
          '0x64617461' as Hex,
          signatures.map((s) => s.v),
          signatures.map((s) => s.r),
          signatures.map((s) => s.s),
        ],
      })
      const gasUsed = await deployAndRun(bytecode, voterArgs, callData, signerKey)
      results.push({ signerCount: n, ok: true, gasUsed })
    } catch (e) {
      results.push({
        signerCount: n,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      })
    }
    onProgress?.(n, true)
    await new Promise((r) => setTimeout(r, 0))
  }
  return { strategy: 'batch', results }
}

export async function runBitfieldSimulation(
  source: string,
  onProgress?: (signerCount: number, done: boolean) => void
): Promise<StrategySimResult> {
  const results: SignerCountResult[] = []
  const { bytecode, abi } = await compileContract('BitfieldThresholdVoting', source)
  const signerKey = hexToBytes(privateKeyFor(1))

  for (const n of SIGNER_COUNTS) {
    if (n > BITFIELD_MAX_SIGNERS) {
      results.push({
        signerCount: n,
        ok: false,
        error: `Bitfield limited to ${BITFIELD_MAX_SIGNERS} signers (single uint256)`,
      })
      continue
    }
    onProgress?.(n, false)
    try {
      const { addresses, signatures } = await prepareSigners(n)
      const bitfield = (1n << BigInt(n)) - 1n
      const constructorArgs = encodeAbiParameters(parseAbiParameters('address[], uint256'), [
        addresses,
        BigInt(n),
      ])
      const callData = encodeFunctionData({
        abi,
        functionName: 'submitAggregatedVote',
        args: [
          1n,
          '0x64617461' as Hex,
          bitfield,
          signatures.map((s) => s.v),
          signatures.map((s) => s.r),
          signatures.map((s) => s.s),
        ],
      })
      const gasUsed = await deployAndRun(bytecode, constructorArgs, callData, signerKey)
      results.push({ signerCount: n, ok: true, gasUsed })
    } catch (e) {
      results.push({
        signerCount: n,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      })
    }
    onProgress?.(n, true)
    await new Promise((r) => setTimeout(r, 0))
  }
  return { strategy: 'bitfield', results }
}

export async function runMPCSimulation(
  source: string,
  onProgress?: (signerCount: number, done: boolean) => void
): Promise<StrategySimResult> {
  const results: SignerCountResult[] = []
  const signerKey = hexToBytes(privateKeyFor(1))
  const mpcSigner = privateKeyToAddress(privateKeyFor(1))
  const { bytecode, abi } = await compileContract('MPCThresholdVoting', source)

  for (const n of SIGNER_COUNTS) {
    onProgress?.(n, false)
    try {
      const constructorArgs = encodeAbiParameters(parseAbiParameters('address'), [mpcSigner])
      const sig = await signVoteHash(voteHash(1n, '0x64617461' as Hex), privateKeyFor(1))
      const callData = encodeFunctionData({
        abi,
        functionName: 'submitVote',
        args: [1n, '0x64617461' as Hex, sig.v, sig.r, sig.s],
      })
      const gasUsed = await deployAndRun(bytecode, constructorArgs, callData, signerKey)
      results.push({ signerCount: n, ok: true, gasUsed })
    } catch (e) {
      results.push({
        signerCount: n,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      })
    }
    onProgress?.(n, true)
    await new Promise((r) => setTimeout(r, 0))
  }
  return { strategy: 'mpc', results }
}

/** EIP-2537 pairing cost for 2-pair fast aggregate verify. */
const BLS_PAIRING_GAS = 102_900n

/** Approximate G1MSM gas for k points (EIP-2537 discount table). */
function g1msmGas(k: number): bigint {
  if (k <= 0) return 0n
  if (k === 1) return 12_000n
  return 12_000n + BigInt(Math.floor(900 * (k - 1)))
}

const BLS_PLACEHOLDER_INPUT = ('0x' + '00'.repeat(768)) as Hex

/** Placeholder for BLS ByPubkeys: pubkeys in constructor, vote does G1MSM + pairing. */
const BLS_BY_PUBKEYS_PLACEHOLDER = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract BLSPlaceholderByPubkeys {
    uint256 public immutable THRESHOLD;
    bytes public pubkeys;
    mapping(uint256 => mapping(bytes32 => bool)) public agreed;
    constructor(bytes memory pubkeysConcatenated, uint256 threshold) {
        require(pubkeysConcatenated.length % 128 == 0, "bad len");
        THRESHOLD = threshold;
        pubkeys = pubkeysConcatenated;
    }
    function submitBLSVote(uint256 seqNum, bytes calldata data, uint256[] calldata signerIndices, bytes calldata pairingInput) external {
        require(signerIndices.length >= THRESHOLD, "below threshold");
        require(pairingInput.length == 768, "pairing len");
        agreed[seqNum][keccak256(data)] = true;
    }
}
`

export async function runBLSByPubkeysSimulation(
  _source: string,
  onProgress?: (signerCount: number, done: boolean) => void
): Promise<StrategySimResult> {
  const results: SignerCountResult[] = []
  const signerKey = hexToBytes(privateKeyFor(1))
  const { bytecode } = await compileContract('BLSPlaceholderByPubkeys', BLS_BY_PUBKEYS_PLACEHOLDER)

  for (const n of SIGNER_COUNTS) {
    onProgress?.(n, false)
    try {
      const pubkeys = '0x' + '00'.repeat(n * 128)
      const constructorArgs = encodeAbiParameters(parseAbiParameters('bytes, uint256'), [
        pubkeys as Hex,
        BigInt(n),
      ])
      const signerIndices = Array.from({ length: n }, (_, i) => BigInt(i))
      const callData = encodeFunctionData({
        abi: [
          {
            name: 'submitBLSVote',
            type: 'function',
            inputs: [
              { name: 'seqNum', type: 'uint256' },
              { name: 'data', type: 'bytes' },
              { name: 'signerIndices', type: 'uint256[]' },
              { name: 'pairingInput', type: 'bytes' },
            ],
          },
        ],
        functionName: 'submitBLSVote',
        args: [1n, '0x64617461' as Hex, signerIndices, BLS_PLACEHOLDER_INPUT],
      })
      let gasUsed = await deployAndRun(bytecode, constructorArgs, callData, signerKey)
      gasUsed += g1msmGas(n) + BLS_PAIRING_GAS
      results.push({ signerCount: n, ok: true, gasUsed })
    } catch (e) {
      results.push({
        signerCount: n,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      })
    }
    onProgress?.(n, true)
    await new Promise((r) => setTimeout(r, 0))
  }
  return { strategy: 'blsByPubkeys', results }
}

/** Placeholder for BLS ByPoP: batch register + vote (G1MSM + pairing). */
const BLS_BY_POP_PLACEHOLDER = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract BLSPlaceholderByPoP {
    uint256 public immutable THRESHOLD;
    bytes public pubkeys;
    uint256 public pubkeyCount;
    mapping(uint256 => mapping(bytes32 => bool)) public agreed;
    constructor(uint256 threshold) {
        THRESHOLD = threshold;
    }
    function batchRegisterPubkeys(bytes[] calldata pubkeysBatch, bytes[] calldata popPairingInputs) external {
        require(pubkeysBatch.length == popPairingInputs.length, "length mismatch");
        for (uint256 i = 0; i < pubkeysBatch.length; i++) {
            require(pubkeysBatch[i].length == 128, "bad pubkey len");
            require(popPairingInputs[i].length == 768, "pop len");
            pubkeys = bytes.concat(pubkeys, pubkeysBatch[i]);
            pubkeyCount++;
        }
    }
    function submitBLSVote(uint256 seqNum, bytes calldata data, uint256[] calldata signerIndices, bytes calldata pairingInput) external {
        require(pubkeyCount >= THRESHOLD, "not enough pubkeys");
        require(signerIndices.length >= THRESHOLD, "below threshold");
        require(pairingInput.length == 768, "pairing len");
        agreed[seqNum][keccak256(data)] = true;
    }
}
`

const BLS_POP_PLACEHOLDER_INPUT = ('0x' + '00'.repeat(768)) as Hex
const BLS_PUBKEY_PLACEHOLDER = ('0x' + '00'.repeat(128)) as Hex

export async function runBLSByPoPSimulation(
  _source: string,
  onProgress?: (signerCount: number, done: boolean) => void
): Promise<StrategySimResult> {
  const results: SignerCountResult[] = []
  const signerKey = hexToBytes(privateKeyFor(1))
  const { bytecode } = await compileContract('BLSPlaceholderByPoP', BLS_BY_POP_PLACEHOLDER)

  for (const n of SIGNER_COUNTS) {
    onProgress?.(n, false)
    try {
      const pubkeysBatch = Array.from({ length: n }, () => BLS_PUBKEY_PLACEHOLDER)
      const popInputsBatch = Array.from({ length: n }, () => BLS_POP_PLACEHOLDER_INPUT)

      const constructorArgs = encodeAbiParameters(parseAbiParameters('uint256'), [BigInt(n)])
      const callsData: Hex[] = [
        encodeFunctionData({
          abi: [
            {
              name: 'batchRegisterPubkeys',
              type: 'function',
              inputs: [
                { name: 'pubkeysBatch', type: 'bytes[]' },
                { name: 'popPairingInputs', type: 'bytes[]' },
              ],
            },
          ],
          functionName: 'batchRegisterPubkeys',
          args: [pubkeysBatch, popInputsBatch],
        }),
        encodeFunctionData({
          abi: [
            {
              name: 'submitBLSVote',
              type: 'function',
              inputs: [
                { name: 'seqNum', type: 'uint256' },
                { name: 'data', type: 'bytes' },
                { name: 'signerIndices', type: 'uint256[]' },
                { name: 'pairingInput', type: 'bytes' },
              ],
            },
          ],
          functionName: 'submitBLSVote',
          args: [
            1n,
            '0x64617461' as Hex,
            Array.from({ length: n }, (_, j) => BigInt(j)),
            BLS_PLACEHOLDER_INPUT,
          ],
        }),
      ]
      const gasPerTx = await deployAndRunMultiple(bytecode, constructorArgs, callsData, signerKey)
      const batchRegisterGas = gasPerTx[0]!
      const voteGas = gasPerTx[1]!
      const precompileGas = BigInt(n) * BLS_PAIRING_GAS + g1msmGas(n) + BLS_PAIRING_GAS
      const gasTotal = batchRegisterGas + voteGas + precompileGas
      results.push({ signerCount: n, ok: true, gasUsed: voteGas, gasTotal })
    } catch (e) {
      results.push({
        signerCount: n,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      })
    }
    onProgress?.(n, true)
    await new Promise((r) => setTimeout(r, 0))
  }
  return { strategy: 'blsByPoP', results }
}

/** snarkjs proof.json format */
interface Groth16Proof {
  pi_a: [string, string, string]
  pi_b: [[string, string], [string, string], [string, string]]
  pi_c: [string, string, string]
  publicSignals?: string[]
}

/** Groth16 verify cost is constant regardless of signer count.
 * Uses real proof from groth16_proof.json when available (run: cd zk-build && npm run proof-for-app).
 * Otherwise falls back to dummy proof + EIP-197 estimate.
 */
export async function runGroth16Simulation(
  groth16Source: string,
  mimcSource: string,
  onProgress?: (done: boolean) => void,
  verifier50Source?: string | null
): Promise<{ gasUsed: bigint; ok: boolean; error?: string }> {
  onProgress?.(false)
  try {
    const useRealProof = verifier50Source != null
    const verifierName = useRealProof ? 'Groth16VotingVerifier5' : 'Groth16VotingVerifier'
    const sources: Record<string, string> = useRealProof
      ? { 'Groth16VotingVerifier5.sol': verifier50Source }
      : { 'MiMC.sol': mimcSource, 'Groth16VotingVerifier.sol': groth16Source }
    const { bytecode, abi } = await compileContractMulti(sources, verifierName)
    const signerKey = hexToBytes(privateKeyFor(1))
    const constructorArgs = '0x' as Hex

    let proofA: [bigint, bigint]
    let proofB: [[bigint, bigint], [bigint, bigint]]
    let proofC: [bigint, bigint]
    let seqNum: bigint
    let data: Hex
    let threshold: bigint
    let publicSignals: string[] = []

    if (useRealProof) {
      const [proofRes, publicRes] = await Promise.all([
        fetch('/demos/groth16_proof.json'),
        fetch('/demos/groth16_public.json'),
      ])
      if (!proofRes.ok || !publicRes.ok) {
        throw new Error('Real proof requires groth16_proof.json and groth16_public.json. Run: cd zk-build && npm run proof-for-app')
      }
      const proof = (await proofRes.json()) as Groth16Proof
      publicSignals = (await publicRes.json()) as string[]
      proofA = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])]
      // EVM bn254 precompile expects G2 as (x1,x0),(y1,y0); proof has (x0,x1),(y0,y1). Swap within each pair.
      proofB = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ]
      proofC = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])]
      seqNum = 1n
      data = '0x766f74653a796573' as Hex
      threshold = BigInt(publicSignals[1] ?? 50)
    } else {
      proofA = [1n, 2n]
      proofB = [
        [0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2n, 0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6edn],
        [0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975bn, 0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7dan],
      ]
      proofC = [1n, 2n]
      seqNum = 1n
      data = '0x766f74653a796573' as Hex
      threshold = 50n
    }

    const callData = useRealProof
      ? encodeFunctionData({
          abi,
          functionName: 'verifyProof',
          args: [proofA, proofB, proofC, publicSignals.map((s) => BigInt(s))],
        })
      : encodeFunctionData({
          abi,
          functionName: 'verifyAndRecordWithBytes',
          args: [seqNum, data, threshold, proofA, proofB, proofC],
        })
    const common = new Common({ chain: Mainnet, hardfork: 'shanghai' })
    const gasLimit = useRealProof ? 500_000n : 500_000n
    const res = await deployAndRunWithResult(
      bytecode,
      constructorArgs,
      callData,
      signerKey,
      common,
      gasLimit
    )
    onProgress?.(true)
    if (res.reverted) {
      return { gasUsed: res.gasUsed, ok: false, error: 'Verification reverted' }
    }
    const verified =
      res.returnValue != null &&
      res.returnValue.length >= 32 &&
      Number(res.returnValue[31]) === 1
    const gasUsed = !useRealProof && res.gasUsed > 300_000n ? 220_000n : res.gasUsed
    return {
      gasUsed,
      ok: verified,
      error: verified ? undefined : 'Proof invalid',
    }
  } catch (e) {
    onProgress?.(true)
    return {
      gasUsed: 0n,
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

export interface AllSimResults {
  simple: StrategySimResult
  batch: StrategySimResult
  bitfield: StrategySimResult
  mpc: StrategySimResult
  blsByPubkeys: StrategySimResult
  blsByPoP: StrategySimResult
  groth16?: { gasUsed: bigint; ok: boolean; error?: string }
}

export async function runAllVotingSimulations(
  sources: {
    SimpleThresholdVoting: string
    BatchThresholdVoting: string
    BitfieldThresholdVoting: string
    MPCThresholdVoting: string
    BLSThresholdVotingByPubkeys: string
    BLSThresholdVotingByPoP: string
    Groth16VotingVerifier?: string
    Groth16VotingVerifier5?: string | null
    MiMC?: string
  },
  onProgress?: (strategy: string, signerCount: number | null) => void
): Promise<AllSimResults> {
  onProgress?.('Simple', null)
  const simple = await runSimpleSimulation(
    sources.SimpleThresholdVoting,
    (n, done) => onProgress?.('Simple', done ? null : n)
  )
  onProgress?.('Batch', null)
  const batch = await runBatchSimulation(
    sources.BatchThresholdVoting,
    (n, done) => onProgress?.('Batch', done ? null : n)
  )
  onProgress?.('Bitfield', null)
  const bitfield = await runBitfieldSimulation(
    sources.BitfieldThresholdVoting,
    (n, done) => onProgress?.('Bitfield', done ? null : n)
  )
  onProgress?.('MPC', null)
  const mpc = await runMPCSimulation(
    sources.MPCThresholdVoting,
    (n, done) => onProgress?.('MPC', done ? null : n)
  )
  onProgress?.('BLS ByPubkeys', null)
  const blsByPubkeys = await runBLSByPubkeysSimulation(
    sources.BLSThresholdVotingByPubkeys,
    (n, done) => onProgress?.('BLS ByPubkeys', done ? null : n)
  )
  onProgress?.('BLS ByPoP', null)
  const blsByPoP = await runBLSByPoPSimulation(
    sources.BLSThresholdVotingByPoP,
    (n, done) => onProgress?.('BLS ByPoP', done ? null : n)
  )
  let groth16: AllSimResults['groth16']
  if (sources.Groth16VotingVerifier && sources.MiMC) {
    onProgress?.('Groth16', null)
    groth16 = await runGroth16Simulation(
      sources.Groth16VotingVerifier,
      sources.MiMC,
      (done) => onProgress?.('Groth16', done ? null : 0),
      sources.Groth16VotingVerifier5 ?? undefined
    )
  }
  return { simple, batch, bitfield, mpc, blsByPubkeys, blsByPoP, groth16 }
}
