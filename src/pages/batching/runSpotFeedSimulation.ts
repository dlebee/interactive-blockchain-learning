/**
 * Compile SpotFeed.sol with web-solc and run gas simulations via @ethereumjs/vm.
 * Uses predefined dummy data; returns gas used for submit or submitBatch.
 */

import { Common, Mainnet } from '@ethereumjs/common';
import { createTx } from '@ethereumjs/tx';
import { createContractAddress, hexToBytes } from '@ethereumjs/util';
import { createVM, runTx } from '@ethereumjs/vm';
import { encodeFunctionData } from 'viem';
import { fetchAndLoadSolc } from 'web-solc';

const SOURCE_NAME = 'SpotFeed.sol';
const CONTRACT_NAME = 'SpotFeed';

/** Format token index as 20-byte address (0x-prefixed, 40 hex chars). address(0) = native (ETH). */
function tokenAddress(i: number): `0x${string}` {
  return `0x${i.toString(16).padStart(40, '0')}` as const;
}

type SpotUpdate = {
  left: `0x${string}`;
  right: `0x${string}`;
  price: bigint;
  timestamp: bigint;
  expiry: bigint;
};

/** Generate N unique (left, right) pairs with left < right; includes native (0) vs tokens (1,2,...). */
function generatePairs(n: number): SpotUpdate[] {
  const timestamp = 1700000000n;
  const expiry = 1700003600n;
  const basePrice = 2000n * 10n ** 8n;
  const prices = [
    basePrice, // ETH-like
    1n * 10n ** 8n, // USDC-like
    40000n * 10n ** 8n, // BTC-like
    3000n * 10n ** 8n,
    500n * 10n ** 8n,
  ];
  const out: SpotUpdate[] = [];
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) {
    const left = tokenAddress(a);
    const right = tokenAddress(b);
    const price = prices[i % prices.length]!;
    out.push({ left, right, price, timestamp, expiry });
    a++;
    if (a >= b) {
      b++;
      a = 0;
    }
  }
  return out;
}

/** Private key whose address will be owner and oracle (constructor sets oracle = msg.sender). */
const ORACLE_PRIVATE_KEY = hexToBytes(
  '0x0000000000000000000000000000000000000000000000000000000000000001'
);

/** Gas price >= block baseFeePerGas (Prague default ~7). Use 1 gwei for safety. */
const GAS_PRICE = 10n ** 9n;

export interface CompileResult {
  bytecode: string;
  abi: readonly unknown[];
}

/**
 * Compile SpotFeed source in the browser; returns bytecode and ABI.
 * Throws if compilation fails.
 */
export async function compileSpotFeed(source: string): Promise<CompileResult> {
  const solc = await fetchAndLoadSolc('^0.8.0');
  const input = {
    language: 'Solidity',
    sources: {
      [SOURCE_NAME]: { content: source },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };
  const output = await solc.compile(input);
  solc.stopWorker();

  const errors = output.errors?.filter(
    (e: { severity?: string }) => e.severity === 'error'
  );
  if (errors?.length) {
    const msg = errors.map((e: { formattedMessage?: string }) => e.formattedMessage ?? String(e)).join('\n');
    throw new Error(`Compilation failed:\n${msg}`);
  }

  const sources = output.contracts as unknown as Record<string, Record<string, { evm?: { bytecode?: { object?: string } }; abi?: unknown[] }>> | undefined;
  const contract = sources?.[SOURCE_NAME]?.[CONTRACT_NAME];
  if (!contract?.evm?.bytecode?.object || !contract?.abi) {
    throw new Error('Compilation did not produce bytecode or ABI for SpotFeed');
  }

  const rawBytecode = contract.evm.bytecode.object;
  const bytecode = rawBytecode.startsWith('0x') ? rawBytecode : `0x${rawBytecode}`;
  return { bytecode, abi: contract.abi };
}

/**
 * Deploy SpotFeed and run one call (submit or submitBatch with N items);
 * returns gas used for that call. Uses same VM state for deploy then call.
 */
export async function runSpotFeedSimulation(
  bytecode: string,
  abi: readonly unknown[],
  mode: 'submit' | 'submitBatch',
  batchSize: number = 1
): Promise<{ gasUsed: bigint }> {
  const common = new Common({ chain: Mainnet });
  const vm = await createVM({ common });

  const deployTx = createTx(
    {
      nonce: 0n,
      gasPrice: GAS_PRICE,
      gasLimit: 10_000_000n,
      value: 0n,
      data: hexToBytes(bytecode as `0x${string}`),
      to: undefined,
    },
    { common }
  );
  const signedDeploy = deployTx.sign(ORACLE_PRIVATE_KEY);
  const deployResult = await runTx(vm, {
    tx: signedDeploy,
    skipBalance: true,
  });
  if (deployResult.execResult.exceptionError) {
    throw new Error(
      `Deploy failed: ${deployResult.execResult.exceptionError.error}`
    );
  }

  const senderAddress = signedDeploy.getSenderAddress();
  const contractAddress = createContractAddress(senderAddress, 0n);

  type SpotFeedAbi = readonly unknown[];
  const spotFeedAbi = abi as SpotFeedAbi;
  const pairs = generatePairs(batchSize);
  let callData: `0x${string}`;
  if (mode === 'submit' && batchSize === 1) {
    const p = pairs[0]!;
    callData = encodeFunctionData({
      abi: spotFeedAbi,
      functionName: 'submit',
      args: [p.left, p.right, p.price, p.timestamp, p.expiry],
    });
  } else {
    callData = encodeFunctionData({
      abi: spotFeedAbi,
      functionName: 'submitBatch',
      args: [
        pairs.map((p) => p.left),
        pairs.map((p) => p.right),
        pairs.map((p) => p.price),
        pairs.map((p) => p.timestamp),
        pairs.map((p) => p.expiry),
      ],
    });
  }

  const callTx = createTx(
    {
      nonce: 1n,
      gasPrice: GAS_PRICE,
      gasLimit: 30_000_000n, // varied pairs = cold storage per slot; 300 slots can exceed 10M
      value: 0n,
      data: hexToBytes(callData),
      to: contractAddress,
    },
    { common }
  );
  const signedCall = callTx.sign(ORACLE_PRIVATE_KEY);
  const callResult = await runTx(vm, {
    tx: signedCall,
    skipBalance: true,
  });
  if (callResult.execResult.exceptionError) {
    throw new Error(
      `Call failed: ${callResult.execResult.exceptionError.error}`
    );
  }

  return { gasUsed: callResult.totalGasSpent };
}

/** Batch sizes to simulate. */
export const BATCH_SIZES = [1, 10, 25, 50, 100, 200] as const;

export type SimulationResultItem =
  | { batchSize: number; ok: true; gasUsed: bigint }
  | { batchSize: number; ok: false; error: string };

export type SimulationResult = SimulationResultItem[];

/**
 * Run simulations for all batch sizes; returns success or error per size.
 * Failed sizes do not abort the run.
 * onProgress(completed, total, batchSize) called after each simulation.
 */
export async function runAllSimulations(
  bytecode: string,
  abi: readonly unknown[],
  onProgress?: (completed: number, total: number, batchSize: number) => void
): Promise<SimulationResult> {
  const results: SimulationResult = [];
  const total = BATCH_SIZES.length;
  onProgress?.(0, total, BATCH_SIZES[0]!);
  await new Promise((r) => setTimeout(r, 0));
  for (let i = 0; i < total; i++) {
    const n = BATCH_SIZES[i]!;
    const mode = n === 1 ? 'submit' : 'submitBatch';
    try {
      const { gasUsed } = await runSpotFeedSimulation(bytecode, abi, mode, n);
      results.push({ batchSize: n, ok: true, gasUsed });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ batchSize: n, ok: false, error: msg });
    }
    onProgress?.(i + 1, total, n);
    await new Promise((r) => setTimeout(r, 0));
  }
  return results;
}
