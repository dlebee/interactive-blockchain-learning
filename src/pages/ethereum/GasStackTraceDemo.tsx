import { useState, useEffect } from 'react'
import './GasStackTraceDemo.css'

const TRACE_STEPS = [
  { op: 'Transaction base', gas: 21000 },
  { op: 'CALLDATALOAD + dispatch', gas: 520 },
  { op: 'transfer() → _transfer()', gas: 2600 },
  { op: 'SSTORE (balance update)', gas: 20000 },
  { op: 'LOG1 (Transfer event)', gas: 750 },
  { op: 'RETURN', gas: 0 },
]

const CYCLE_MS = 2200
const HOLD_END_MS = 1500

export function GasStackTraceDemo() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const advance = () => {
      setStep((s) => {
        if (s >= TRACE_STEPS.length - 1) {
          return 0
        }
        return s + 1
      })
    }
    const delay = step === TRACE_STEPS.length - 1 ? HOLD_END_MS : CYCLE_MS
    const t = setTimeout(advance, delay)
    return () => clearTimeout(t)
  }, [step])

  const accumulatedGas = TRACE_STEPS.slice(0, step + 1).reduce((sum, s) => sum + s.gas, 0)
  const currentGas = TRACE_STEPS[step]?.gas ?? 0

  return (
    <div className="gas-stack-demo" aria-label="Animation: stack trace accumulating gas cost">
      <h4 className="gas-stack-title">Stack trace: gas accumulating per opcode</h4>
      <div className="gas-stack-container">
        <div className="gas-stack-trace">
          {TRACE_STEPS.map((s, i) => (
            <div
              key={i}
              className={`gas-stack-row ${i <= step ? 'executed' : ''} ${i === step ? 'current' : ''}`}
            >
              <span className="gas-stack-op">{s.op}</span>
              <span className="gas-stack-cost">+{s.gas} gas</span>
            </div>
          ))}
        </div>
        <div className="gas-stack-total">
          <span className="gas-total-label">Total</span>
          <span className="gas-total-value">{accumulatedGas.toLocaleString()} gas</span>
          {step < TRACE_STEPS.length && currentGas > 0 && (
            <span className="gas-current-add">+{currentGas}</span>
          )}
        </div>
      </div>
    </div>
  )
}
