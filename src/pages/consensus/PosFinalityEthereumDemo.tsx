import React, { useState, useEffect } from 'react'
import './PosFinalityDemo.css'

const SLOTS_PER_EPOCH = 32
const VALIDATORS = ['A', 'B', 'C', 'D']
const TICK_MS = 120

export function PosFinalityEthereumDemo() {
  const [slotIndex, setSlotIndex] = useState(0)

  const SLOTS_AFTER_FINAL = 24
  const totalSlots = SLOTS_PER_EPOCH * 2 + SLOTS_AFTER_FINAL

  useEffect(() => {
    const id = setInterval(() => {
      setSlotIndex((i) => (i + 1) % (totalSlots + 8))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [])

  const visibleSlots = Math.min(slotIndex + 1, totalSlots)

  const elements: React.ReactNode[] = []
  for (let i = 0; i < visibleSlots; i++) {
    if (i % SLOTS_PER_EPOCH === 0 && i < SLOTS_PER_EPOCH * 2) {
      elements.push(
        <div key={`epoch-${i}`} className="pos-epoch-row">
          Epoch {Math.floor(i / SLOTS_PER_EPOCH) + 1}
        </div>
      )
    }
    const author = VALIDATORS[i % VALIDATORS.length]
    const isSafe = i === SLOTS_PER_EPOCH - 1
    const isFinal = i === SLOTS_PER_EPOCH * 2 - 1
    const isLatest = i === slotIndex

    elements.push(
      <div key={i} className="pos-finality-block-wrap">
        <div
          className={`pos-finality-block ${isLatest ? 'latest' : ''}`}
          title={`slot ${i + 1}, author ${author}`}
        >
          <span className="pos-block-author">{author}</span>
          <span className="pos-block-votes">✓✓✓</span>
        </div>
        {isSafe && <span className="pos-finality-label safe">safe</span>}
        {isFinal && <span className="pos-finality-label final">final</span>}
      </div>
    )
  }

  return (
    <div className="pos-finality-demo pos-finality-ethereum">
      <h4 className="pos-finality-subtitle">Ethereum-style: 32 slots per epoch, safe at 1 epoch, final at 2 epochs</h4>
      <div className="pos-finality-meta">
        <span>Author per slot</span>
        <span>Others vote on blocks</span>
      </div>
      <div className="pos-finality-chain-wrap">{elements}</div>
    </div>
  )
}
