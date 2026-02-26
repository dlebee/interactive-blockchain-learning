import { useState, useEffect } from 'react'
import './AbiDemo.css'

const STEPS = [
  {
    title: 'Solidity source (.sol)',
    text: 'You write a smart contract in Solidity. The .sol file defines the contract interface: functions, events, state variables, and their types.',
    stepIndex: 0,
  },
  {
    title: 'solc compiles',
    text: 'The Solidity compiler (solc) reads your .sol file and produces output artifacts. One of them is the ABI: a JSON description of the contract.',
    stepIndex: 1,
  },
  {
    title: 'ABI (JSON)',
    text: 'The compiler outputs a JSON file. This ABI is a structured representation of your contract. SDKs and tools use it to encode calls, decode events, and interact with the contract.',
    stepIndex: 2,
  },
]

const SAMPLE_SOLIDITY = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    uint256 public count;

    function increment() public {
        count++;
    }

    event CountUpdated(uint256 newCount);
}`

const SAMPLE_ABI = `[
  {
    "inputs": [],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "count",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "uint256", "name": "newCount" }],
    "name": "CountUpdated",
    "type": "event"
  }
]`

const AUTO_ADVANCE_MS = 2000

export function AbiDemo() {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => setStep(2), AUTO_ADVANCE_MS)
      return () => clearTimeout(t)
    }
  }, [step])

  return (
    <div className="abi-demo" aria-label="Animation: Solidity to ABI via solc">
      <div className="abi-demo-card">
        <div className="abi-demo-step-indicator">
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
        <p className="abi-demo-text">{current.text}</p>

        <div className="abi-demo-pipeline">
          <div className={`abi-demo-stage ${step >= 0 ? 'active' : ''} ${step === 0 ? 'current' : ''}`}>
            <div className="abi-demo-icon abi-demo-sol" title="Solidity source">
              <span className="abi-demo-icon-label">.sol</span>
            </div>
            <span className="abi-demo-stage-name">Source</span>
          </div>
          <div className={`abi-demo-arrow ${step >= 1 ? 'active' : ''}`} />
          <div className={`abi-demo-stage ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>
            <div className={`abi-demo-icon abi-demo-solc ${step === 1 ? 'working' : ''}`} title="solc">
              {step === 1 ? (
                <span className="abi-demo-spinner" aria-hidden />
              ) : (
                <span className="abi-demo-icon-label">solc</span>
              )}
            </div>
            <span className="abi-demo-stage-name">Compiler</span>
          </div>
          <div className={`abi-demo-arrow ${step >= 2 ? 'active' : ''}`} />
          <div className={`abi-demo-stage ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>
            <div className="abi-demo-icon abi-demo-json" title="ABI JSON">
              <span className="abi-demo-icon-label">ABI</span>
            </div>
            <span className="abi-demo-stage-name">JSON</span>
          </div>
        </div>

        {current.stepIndex === 0 && (
          <div className="abi-demo-preview abi-demo-sol-preview">
            <pre className="abi-demo-code">{SAMPLE_SOLIDITY}</pre>
          </div>
        )}
        {current.stepIndex === 1 && (
          <div className="abi-demo-preview abi-demo-compiling-preview">
            <div className="abi-demo-activity-bar">
              <span className="abi-demo-activity-label">Compiling Counter.sol</span>
              <div className="abi-demo-progress">
                <div className="abi-demo-progress-fill" />
              </div>
            </div>
            <pre className="abi-demo-code">{SAMPLE_SOLIDITY}</pre>
          </div>
        )}
        {current.stepIndex === 2 && (
          <div className="abi-demo-preview abi-demo-json-preview">
            <span className="abi-demo-preview-label">ABI output (Counter.json)</span>
            <pre className="abi-demo-code abi-demo-json-code">{SAMPLE_ABI}</pre>
          </div>
        )}

        <div className="abi-demo-actions">
          {isLast ? (
            <span className="abi-demo-completed">Done</span>
          ) : (
            <button
              type="button"
              className="abi-demo-next-btn"
              onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
            >
              Next
            </button>
          )}
          <button
            type="button"
            className="abi-demo-reset-btn"
            onClick={() => setStep(0)}
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  )
}
