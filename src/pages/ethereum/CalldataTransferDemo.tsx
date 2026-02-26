import { useState } from 'react'
import './CalldataDemo.css'

const STEPS = [
  { title: 'The Solidity function', text: 'We want to call transfer(address _to, uint256 _value) on a token contract. This sends tokens from the caller to the recipient. The ABI and contract address tell us how to build the transaction.', stepIndex: 0 },
  { title: 'Function selector', text: 'The first 4 bytes are the selector: Keccak-256("transfer(address,uint256)")[0:4] = 0xa9059cbb.', stepIndex: 1 },
  { title: 'ABI-encoded arguments', text: 'Each argument is padded to 32 bytes. The address is left-padded; the uint256 is right-padded. Order matches the function parameters.', stepIndex: 2 },
  { title: 'The data field', text: 'Selector plus encoded args: 0xa9059cbb + 32 bytes for _to + 32 bytes for _value.', stepIndex: 3 },
  { title: 'Full transaction', text: 'The transaction sends 0 ETH (value) to the USDT contract (to), with the calldata. The chain executes transfer() and moves tokens from sender to recipient.', stepIndex: 4 },
]

const SOLIDITY_FUNCTION = 'function transfer(address _to, uint256 _value)\n    external\n    returns (bool);'

const SELECTOR_DERIVATION = '"transfer(address,uint256)" -> Keccak-256 -> first 4 bytes -> 0xa9059cbb'

const TRANSFER_ETHERSCAN_URL = 'https://etherscan.io/tx/0xb4d11184204428e48d24bc28276510382140facb09831c0ea53d9742b6a21a14'

const TX_JSON = `{
  "to": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "value": "0x0",
  "data": "0xa9059cbb000000000000000000000000738a8ad3bff18a20c64ec82db59aa77d394bc6890000000000000000000000000000000000000000000000000000000000000078"
}`

export function CalldataTransferDemo() {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="calldata-demo" aria-label="Interactive: building calldata for ERC-20 transfer">
      <div className="calldata-demo-card">
        <div className="calldata-demo-step-indicator">
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
        <p className="calldata-demo-text">{current.text}</p>

        <div className="calldata-demo-pipeline">
          <div className={`calldata-stage ${step >= 0 ? 'active' : ''} ${step === 0 ? 'current' : ''}`}>
            <div className="calldata-icon calldata-solidity" title="Solidity">
              <span className="calldata-icon-label">fn</span>
            </div>
            <span className="calldata-stage-name">Function</span>
          </div>
          <div className={`calldata-arrow ${step >= 1 ? 'active' : ''}`} />
          <div className={`calldata-stage ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>
            <div className={`calldata-icon calldata-selector ${step === 1 ? 'working' : ''}`} title="Selector">
              <span className="calldata-icon-label">#</span>
            </div>
            <span className="calldata-stage-name">Selector</span>
          </div>
          <div className={`calldata-arrow ${step >= 2 ? 'active' : ''}`} />
          <div className={`calldata-stage ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>
            <div className="calldata-icon calldata-args" title="Args">
              <span className="calldata-icon-label">[]</span>
            </div>
            <span className="calldata-stage-name">Args</span>
          </div>
          <div className={`calldata-arrow ${step >= 3 ? 'active' : ''}`} />
          <div className={`calldata-stage ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}>
            <div className="calldata-icon calldata-data" title="Data">
              <span className="calldata-icon-label">0x</span>
            </div>
            <span className="calldata-stage-name">Data</span>
          </div>
          <div className={`calldata-arrow ${step >= 4 ? 'active' : ''}`} />
          <div className={`calldata-stage ${step >= 4 ? 'active' : ''} ${step === 4 ? 'current' : ''}`}>
            <div className="calldata-icon calldata-tx" title="Transaction">
              <span className="calldata-icon-label">tx</span>
            </div>
            <span className="calldata-stage-name">Transaction</span>
          </div>
        </div>

        {current.stepIndex === 0 && (
          <div className="calldata-demo-preview">
            <span className="calldata-preview-label">ERC-20 transfer function</span>
            <pre className="calldata-demo-code">{SOLIDITY_FUNCTION}</pre>
          </div>
        )}
        {current.stepIndex === 1 && (
          <div className="calldata-demo-preview calldata-selector-preview">
            <div className="calldata-derivation-formula">{SELECTOR_DERIVATION}</div>
            <div className="calldata-selector-result">
              <span className="calldata-selector-label">Function selector (4 bytes)</span>
              <code className="calldata-selector-value">0xa9059cbb</code>
            </div>
          </div>
        )}
        {current.stepIndex === 2 && (
          <div className="calldata-demo-preview">
            <span className="calldata-preview-label">ABI-encoded arguments</span>
            <div className="calldata-args-breakdown">
              <div className="calldata-arg-row">
                <span className="calldata-arg-label">_to (address, 32 bytes)</span>
                <code>0x0000...738a8ad3bff18a20c64ec82db59aa77d394bc689</code>
              </div>
              <div className="calldata-arg-row">
                <span className="calldata-arg-label">_value (uint256, 32 bytes)</span>
                <code>0x0000...0078</code>
                <span className="calldata-arg-hint">120 = 0.00012 USDT (6 decimals)</span>
              </div>
            </div>
          </div>
        )}
        {current.stepIndex === 3 && (
          <div className="calldata-demo-preview calldata-data-preview">
            <span className="calldata-preview-label">Data field</span>
            <code className="calldata-data-value calldata-data-long">0xa9059cbb000000000000000000000000738a8ad3bff18a20c64ec82db59aa77d394bc6890000000000000000000000000000000000000000000000000000000000000078</code>
          </div>
        )}
        {current.stepIndex === 4 && (
          <div className="calldata-demo-preview calldata-tx-preview">
            <span className="calldata-preview-label">Transaction (to USDT, value 0, data)</span>
            <pre className="calldata-demo-code">{TX_JSON}</pre>
            <a href={TRANSFER_ETHERSCAN_URL} target="_blank" rel="noopener noreferrer" className="calldata-etherscan-link">
              View on Etherscan
            </a>
          </div>
        )}

        <div className="calldata-demo-actions">
          {isLast ? (
            <span className="calldata-demo-completed">Done</span>
          ) : (
            <button type="button" className="calldata-next-btn" onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}>
              Next
            </button>
          )}
          <button type="button" className="calldata-reset-btn" onClick={() => setStep(0)}>
            Start over
          </button>
        </div>
      </div>
    </div>
  )
}
