import { useState, useEffect } from 'react'
import './MnemonicCreationDemo.css'

type Phase = 'write-down' | 'confirm' | 'safeguard'

// Sample 12-word phrase (BIP-39 style, for demo only)
const WORDS = [
  'abandon', 'ability', 'able', 'about',
  'above', 'absorb', 'abstract', 'absurd',
  'abuse', 'access', 'accident', 'account',
]

const CONFIRM_INDICES = [2, 6, 10] // Words to confirm: 3rd, 7th, 11th

export function MnemonicCreationDemo() {
  const [phase, setPhase] = useState<Phase>('write-down')
  const [visibleCount, setVisibleCount] = useState(0)
  const [confirmedCount, setConfirmedCount] = useState(0)

  useEffect(() => {
    if (phase === 'write-down') {
      setVisibleCount(0)
      const timers: ReturnType<typeof setTimeout>[] = []
      for (let i = 0; i < WORDS.length; i++) {
        timers.push(
          setTimeout(() => setVisibleCount((c) => c + 1), 200 + i * 120)
        )
      }
      const advance = setTimeout(() => setPhase('confirm'), 4200)
      return () => {
        timers.forEach(clearTimeout)
        clearTimeout(advance)
      }
    }
    if (phase === 'confirm') {
      setConfirmedCount(0)
      const advance1 = setTimeout(() => setConfirmedCount(1), 600)
      const advance2 = setTimeout(() => setConfirmedCount(2), 1200)
      const advance3 = setTimeout(() => setConfirmedCount(3), 1800)
      const next = setTimeout(() => setPhase('safeguard'), 2800)
      return () => {
        clearTimeout(advance1)
        clearTimeout(advance2)
        clearTimeout(advance3)
        clearTimeout(next)
      }
    }
  }, [phase])

  const handleReplay = () => {
    setVisibleCount(0)
    setConfirmedCount(0)
    setPhase('write-down')
  }

  return (
    <div className="mnemonic-creation-demo">
      <div className="mnemonic-demo-card">
        {phase === 'write-down' && (
          <>
            <h4 className="mnemonic-demo-title">Back up your recovery phrase</h4>
            <p className="mnemonic-demo-hint">Write these down. Never share them.</p>
            <div className="mnemonic-words-grid">
              {WORDS.map((word, i) => (
                <span
                  key={i}
                  className={`mnemonic-word ${i < visibleCount ? 'mnemonic-word-visible' : ''}`}
                >
                  <span className="mnemonic-word-num">{i + 1}.</span>
                  {word}
                </span>
              ))}
            </div>
          </>
        )}

        {phase === 'confirm' && (
          <>
            <h4 className="mnemonic-demo-title">Confirm your phrase</h4>
            <p className="mnemonic-demo-hint">Select the correct word for each position.</p>
            <div className="mnemonic-confirm-row">
              {CONFIRM_INDICES.map((idx, i) => (
                <div key={idx} className="mnemonic-confirm-slot">
                  <span className="mnemonic-confirm-label">{idx + 1}.</span>
                  <span
                    className={`mnemonic-confirm-word ${
                      i < confirmedCount ? 'mnemonic-confirm-word-done' : ''
                    }`}
                  >
                    {i < confirmedCount ? WORDS[idx] : '……'}
                  </span>
                  {i < confirmedCount && (
                    <span className="mnemonic-confirm-check">✓</span>
                  )}
                </div>
              ))}
            </div>
            <p className="mnemonic-demo-progress">
              {confirmedCount < 3
                ? `Verifying… ${confirmedCount}/3`
                : 'All correct'}
            </p>
          </>
        )}

        {phase === 'safeguard' && (
          <>
            <h4 className="mnemonic-demo-title">Wallet created</h4>
            <div className="mnemonic-safeguard-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <path d="M12 16v2" />
                <circle cx="12" cy="16" r="1.5" />
              </svg>
            </div>
            <p className="mnemonic-safeguard-text">
              Your recovery phrase is secured. Keep it offline and never share it online.
            </p>
          </>
        )}
      </div>

      <div className="mnemonic-phase-dots">
        <span className={phase === 'write-down' ? 'active' : phase !== 'safeguard' ? 'done' : ''}>1</span>
        <span className={phase === 'confirm' ? 'active' : phase === 'safeguard' ? 'done' : ''}>2</span>
        <span className={phase === 'safeguard' ? 'active' : ''}>3</span>
      </div>

      <p className="mnemonic-demo-caption">
        {phase === 'write-down' && 'Write down → '}
        {phase === 'confirm' && 'Confirm words → '}
        {phase === 'safeguard' && 'Safeguard offline'}
      </p>

      {phase === 'safeguard' && (
        <button type="button" className="mnemonic-demo-replay" onClick={handleReplay}>
          Replay
        </button>
      )}
    </div>
  )
}
