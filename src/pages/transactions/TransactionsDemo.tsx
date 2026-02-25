import { useState } from 'react'
import { Link } from 'react-router-dom'
import './TransactionsDemo.css'

interface StepConfig {
  title: string
  text: string
  showBlocks: number[]
  highlightVerify?: boolean
  showSummary?: boolean
}

const STEPS: StepConfig[] = [
  {
    title: 'Why blocks?',
    text: 'Each block contains a digest and a reference to the previous block. This allows blocks to hold a set of transactions that can be verified using the data from preceding blocks.',
    showBlocks: [],
  },
  {
    title: 'Genesis block',
    text: 'Consider the genesis block (Block 0), where Account A starts with 100,000 tokens.',
    showBlocks: [0],
  },
  {
    title: 'First transfer',
    text: 'In Block 1, which references Block 0, Account A decides to transfer 10 tokens to Account B.',
    showBlocks: [0, 1],
  },
  {
    title: 'Verification',
    text: 'To verify this transaction, you check Block 0 to confirm that Account A has enough tokens to make the transfer.',
    showBlocks: [0, 1],
    highlightVerify: true,
  },
  {
    title: 'Chain integrity',
    text: 'By following the chain of blocks, you can calculate all transactions and ensure that no anomalies are introduced, maintaining financial accuracy and consistency.',
    showBlocks: [0, 1],
    showSummary: true,
  },
]

const BLOCK_0 = {
  id: 0,
  prevHash: '00000000',
  digest: 'a1b2c3d4',
  balances: { A: 100_000, B: 0 },
}

const BLOCK_1 = {
  id: 1,
  prevHash: 'a1b2c3d4',
  digest: 'e5f6g7h8',
  transaction: { from: 'A', to: 'B', amount: 10 },
  balances: { A: 99_990, B: 10 },
}

export function TransactionsDemo() {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="transactions-demo">
      <div className="transactions-demo-card">
        <h3>{current.title}</h3>
        <p className="transactions-demo-text">{current.text}</p>

        {(current.showBlocks.length > 0 || current.showSummary === true) && (
          <div className="transactions-demo-blocks">
            {current.showBlocks.includes(0) && (
              <div
                className={`block-card genesis ${current.highlightVerify === true ? 'highlight' : ''}`}
              >
                <div className="block-card-header">Block 0</div>
                <div className="block-card-field">
                  <span className="block-card-label">Prev hash</span>
                  <code>{BLOCK_0.prevHash}</code>
                </div>
                <div className="block-card-field">
                  <span className="block-card-label">Digest</span>
                  <code>{BLOCK_0.digest}</code>
                </div>
                <div className="block-card-field balances">
                  <span className="block-card-label">Balances</span>
                  <div className="balance-row">
                    <span>Account A:</span>
                    <strong>100,000</strong>
                  </div>
                  <div className="balance-row">
                    <span>Account B:</span>
                    <strong>0</strong>
                  </div>
                </div>
              </div>
            )}
            {current.showBlocks.includes(0) && current.showBlocks.includes(1) && (
              <div className="block-arrow" aria-hidden>
                ←
              </div>
            )}
            {current.showBlocks.includes(1) && (
              <div
                className={`block-card ${current.highlightVerify === true ? 'highlight-target' : ''}`}
              >
                <div className="block-card-header">Block 1</div>
                <div className="block-card-field">
                  <span className="block-card-label">Prev hash</span>
                  <code>{BLOCK_1.prevHash}</code>
                </div>
                <div className="block-card-field">
                  <span className="block-card-label">Digest</span>
                  <code>{BLOCK_1.digest}</code>
                </div>
                <div className="block-card-field transaction">
                  <span className="block-card-label">Transaction</span>
                  <div className="tx-row">
                    A → B: <strong>10 tokens</strong>
                  </div>
                </div>
                <div className="block-card-field balances">
                  <span className="block-card-label">Balances after</span>
                  <div className="balance-row">
                    <span>Account A:</span>
                    <strong>{BLOCK_1.balances.A.toLocaleString()}</strong>
                  </div>
                  <div className="balance-row">
                    <span>Account B:</span>
                    <strong>{BLOCK_1.balances.B.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}
            {current.showSummary === true && (
              <div className="verification-badge">
                <span className="verification-check">✓</span>
                Chain verified: A had 100,000, spent 10, balance 99,990
              </div>
            )}
          </div>
        )}

        <div className="transactions-demo-actions">
          {!isLast ? (
            <button
              type="button"
              className="next-btn"
              onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="next-btn"
              onClick={() => setStep(0)}
            >
              Start over
            </button>
          )}
        </div>
      </div>
      {isLast && (
        <p className="transactions-demo-link">
          Next up: where do those tokens live?{' '}
          <Link to="/wallet">Accounts →</Link>
        </p>
      )}
    </div>
  )
}
