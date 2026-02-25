import { useState, useEffect } from 'react'
import './SolidityToChainDemo.css'

const AUTO_ADVANCE_MS = 2200

const STEPS = [
  {
    title: 'Solidity source',
    text: 'You write a smart contract in Solidity, the main language for Ethereum contracts. The source file defines the logic and storage of your contract.',
    stepIndex: 0,
  },
  {
    title: 'Solidity compiler',
    text: 'The Solidity compiler (e.g. solc) compiles your source code. It produces two outputs: bytecode for deployment and an ABI (Application Binary Interface) file that describes the contract functions and events.',
    stepIndex: 1,
  },
  {
    title: 'Bytecode',
    text: 'The compiler outputs bytecode: a sequence of EVM opcodes. This is what gets deployed and stored on the chain, not the original Solidity.',
    stepIndex: 2,
  },
  {
    title: 'Deploy on chain',
    text: 'You send a transaction that deploys the bytecode to the blockchain. The transaction is broadcast and included in a block.',
    stepIndex: 3,
  },
  {
    title: 'Deployed',
    text: 'Once the transaction is confirmed, the contract is on chain. The chain returns a contract address (derived from your address and nonce). You use this address to call the contract later.',
    stepIndex: 4,
  },
  {
    title: 'ABI interface (from compiler)',
    text: 'The compiler generated this ABI when it compiled your Solidity source. It is output alongside the bytecode: a JSON file that describes the contract interface (function names, parameters, events). Wallets and apps use the ABI to encode transactions when calling the contract.',
    stepIndex: 5,
  },
  {
    title: 'Build transaction',
    text: 'An SDK (e.g. ethers, viem, web3.js) uses the ABI and the contract address to build the transaction. You pass the ABI and address to the SDK; it encodes the function call (e.g. increment()) into a transaction ready to send.',
    stepIndex: 6,
  },
  {
    title: 'Broadcast',
    text: 'You send the transaction to the network. The SDK broadcasts it to nodes; it is propagated and picked up by block producers. You get a transaction hash once it is submitted.',
    stepIndex: 7,
  },
  {
    title: 'Confirmed',
    text: 'Once the transaction is included in a block, it is confirmed. The contract call has been executed on chain. You can look up the transaction hash on a block explorer. We will expand on this in the smart contract section later.',
    stepIndex: 8,
  },
]

const SAMPLE_SOLIDITY = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    uint256 public count;
    function increment() public { count++; }
}`

const SAMPLE_BYTECODE = '6080604052348015600f57600080fd5b5060...'

const SAMPLE_ABI = `[
  { "inputs": [], "name": "increment", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "count", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" }
]`

const SAMPLE_CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1'

const SAMPLE_ETHERS_CODE = `const contract = new ethers.Contract(
  address,
  abi,
  signer
);
const tx = await contract.increment();
console.log('Tx hash:', tx.hash);`

const SAMPLE_TX_HASH = '0x7f3b2a1c9e8d4f6a5b0c8e7d6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f'

export function SolidityToChainDemo() {
  const [step, setStep] = useState(0)
  const [txHash, setTxHash] = useState<string | null>(null)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => setStep(2), AUTO_ADVANCE_MS)
      return () => clearTimeout(t)
    }
    if (step === 3) {
      const t = setTimeout(() => setStep(4), AUTO_ADVANCE_MS)
      return () => clearTimeout(t)
    }
    if (step === 7) {
      const t = setTimeout(() => setStep(8), AUTO_ADVANCE_MS)
      return () => clearTimeout(t)
    }
  }, [step])

  return (
    <div className="solidity-demo">
      <div className="solidity-demo-card">
        <div className="solidity-demo-step-indicator">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <h3>{current.title}</h3>
        <p className="solidity-demo-text">{current.text}</p>

        <div className="solidity-demo-pipeline-wrapper">
          <div className="pipeline-row">
            <span className="pipeline-row-label">Deploy</span>
            <div className="solidity-demo-pipeline">
              <div className={`pipeline-stage ${current.stepIndex >= 0 ? 'active' : ''} ${current.stepIndex === 0 ? 'current' : ''}`}>
                <div className="stage-icon stage-source" title="Solidity source">
                  <span className="stage-label">.sol</span>
                </div>
                <span className="stage-name">Source</span>
              </div>
              <div className={`pipeline-arrow ${current.stepIndex >= 1 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${current.stepIndex >= 1 ? 'active' : ''} ${current.stepIndex === 1 ? 'current' : ''}`}>
                <div className={`stage-icon stage-compiler ${current.stepIndex === 1 ? 'working' : ''}`} title="Compiler">
                  {current.stepIndex === 1 ? (
                    <span className="compiler-spinner" aria-hidden />
                  ) : (
                    <span className="stage-label">solc</span>
                  )}
                </div>
                <span className="stage-name">Compiler</span>
              </div>
              <div className={`pipeline-arrow ${current.stepIndex >= 2 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${current.stepIndex >= 2 ? 'active' : ''} ${current.stepIndex === 2 ? 'current' : ''}`}>
                <div className="stage-icon stage-bytecode" title="Bytecode">
                  <span className="stage-label">0x</span>
                </div>
                <span className="stage-name">Bytecode</span>
              </div>
              <div className={`pipeline-arrow ${current.stepIndex >= 3 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${current.stepIndex >= 3 ? 'active' : ''} ${current.stepIndex === 3 ? 'current' : ''}`}>
                <div className={`stage-icon stage-deploy ${current.stepIndex === 3 ? 'working' : ''}`} title="Deploy">
                  <span className="stage-label">↑</span>
                </div>
                <span className="stage-name">Deploy</span>
              </div>
              <div className={`pipeline-arrow ${current.stepIndex >= 4 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${current.stepIndex >= 4 ? 'active' : ''} ${current.stepIndex === 4 ? 'current' : ''}`}>
                <div className="stage-icon stage-deployed" title="Deployed">
                  <span className="stage-label">✓</span>
                </div>
                <span className="stage-name">Deployed</span>
              </div>
            </div>
          </div>
          <div className="pipeline-row pipeline-row-execute">
            <span className="pipeline-row-label">Call contract</span>
            <div className="solidity-demo-pipeline">
              <div className={`pipeline-stage ${current.stepIndex >= 0 ? 'active' : ''} ${current.stepIndex === 0 ? 'current' : ''}`}>
                <div className="stage-icon stage-source" title="Solidity source">
                  <span className="stage-label">.sol</span>
                </div>
                <span className="stage-name">Source</span>
              </div>
              <div className={`pipeline-arrow ${current.stepIndex >= 5 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${current.stepIndex >= 5 ? 'active' : ''} ${current.stepIndex === 5 ? 'current' : ''}`}>
                <div className="stage-icon stage-abi" title="Generate ABI (compiler)">
                  <span className="stage-label">ABI</span>
                </div>
                <span className="stage-name">Generate ABI</span>
              </div>
              <div className={`pipeline-arrow ${current.stepIndex >= 6 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${current.stepIndex >= 6 ? 'active' : ''} ${current.stepIndex === 6 ? 'current' : ''}`}>
                <div className="stage-icon stage-build" title="Build transaction">
                  <span className="stage-label">tx</span>
                </div>
                <span className="stage-name">Build tx</span>
              </div>
              <div className={`pipeline-arrow ${current.stepIndex >= 7 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${current.stepIndex >= 7 ? 'active' : ''} ${current.stepIndex === 7 ? 'current' : ''}`}>
                <div className={`stage-icon stage-broadcast ${current.stepIndex === 7 ? 'working' : ''}`} title="Broadcast">
                  <span className="stage-label">↑</span>
                </div>
                <span className="stage-name">Broadcast</span>
              </div>
              <div className={`pipeline-arrow ${current.stepIndex >= 8 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${current.stepIndex >= 8 ? 'active' : ''} ${current.stepIndex === 8 ? 'current' : ''}`}>
                <div className="stage-icon stage-executed" title="Confirmed">
                  <span className="stage-label">✓</span>
                </div>
                <span className="stage-name">Confirmed</span>
              </div>
            </div>
          </div>
        </div>

        {(current.stepIndex === 0 || current.stepIndex === 1) && (
          <div className="solidity-demo-preview source-preview">
            {current.stepIndex === 1 && (
              <div className="activity-bar compiling-bar">
                <span className="activity-label">Compiling</span>
                <div className="activity-progress">
                  <div className="activity-progress-fill" />
                </div>
              </div>
            )}
            <pre className="solidity-preview-code">{SAMPLE_SOLIDITY}</pre>
          </div>
        )}
        {current.stepIndex === 2 && (
          <div className="solidity-demo-preview bytecode-preview">
            <code className="bytecode-text">{SAMPLE_BYTECODE}</code>
          </div>
        )}
        {current.stepIndex === 3 && (
          <div className="solidity-demo-preview bytecode-preview">
            <div className="activity-bar deploying-bar">
              <span className="activity-label">Deploying to chain</span>
              <div className="activity-progress">
                <div className="activity-progress-fill deploying-fill" />
              </div>
            </div>
            <code className="bytecode-text">{SAMPLE_BYTECODE}</code>
          </div>
        )}
        {current.stepIndex === 4 && (
          <div className="solidity-demo-preview deployed-preview">
            <span className="deployed-label">Contract address (returned)</span>
            <code className="deployed-address">{SAMPLE_CONTRACT_ADDRESS}</code>
          </div>
        )}
        {current.stepIndex === 5 && (
          <div className="solidity-demo-preview abi-preview">
            <pre className="abi-preview-code">{SAMPLE_ABI}</pre>
          </div>
        )}
        {current.stepIndex === 6 && (
          <div className="solidity-demo-preview execute-preview">
            <div className="execute-flow">
              <span className="execute-flow-label">SDK</span>
              <span className="execute-flow-plus">+</span>
              <span className="execute-flow-label">ABI</span>
              <span className="execute-flow-plus">+</span>
              <span className="execute-flow-label">contract address</span>
              <span className="execute-flow-arrow">→</span>
              <span className="execute-flow-result">build transaction</span>
            </div>
            <pre className="ethers-example-code">{SAMPLE_ETHERS_CODE}</pre>
            <div className="execute-demo-actions">
              <button
                type="button"
                className="execute-tx-btn"
                onClick={() => {
                  setTxHash(SAMPLE_TX_HASH)
                  setStep(7)
                }}
                disabled={!!txHash}
              >
                Broadcast
              </button>
            </div>
            <span className="execute-hint">Libraries like ethers, viem, or web3.js use the ABI to build calldata. Click Broadcast to send the tx. More in the smart contract section.</span>
          </div>
        )}
        {current.stepIndex === 7 && (
          <div className="solidity-demo-preview bytecode-preview">
            <div className="activity-bar deploying-bar">
              <span className="activity-label">Broadcasting transaction</span>
              <div className="activity-progress">
                <div className="activity-progress-fill deploying-fill" />
              </div>
            </div>
            <span className="execute-hint">Transaction sent to the network. Waiting for inclusion in a block…</span>
          </div>
        )}
        {current.stepIndex === 8 && (
          <div className="solidity-demo-preview executed-preview">
            <span className="deployed-label">Transaction hash</span>
            <code className="tx-hash-value tx-hash-value-block">{txHash || SAMPLE_TX_HASH}</code>
            <span className="execute-hint">The transaction was confirmed in a block. You can look up this hash on a block explorer.</span>
          </div>
        )}

        <div className="solidity-demo-actions">
          {isLast ? (
            <span className="solidity-demo-completed">Done</span>
          ) : (
            <button
              type="button"
              className="solidity-next-btn"
              onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
            >
              Next
            </button>
          )}
          <button
            type="button"
            className="solidity-start-over-btn"
            onClick={() => {
              setStep(0)
              setTxHash(null)
            }}
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  )
}
