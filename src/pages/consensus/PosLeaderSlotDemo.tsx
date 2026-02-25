import { useState, useEffect } from 'react'
import './PosLeaderSlotDemo.css'

const VALIDATORS = ['V1', 'V2', 'V3', 'V4']
const SLOT_COUNT = 8

export function PosLeaderSlotDemo() {
  const [slotIndex, setSlotIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSlotIndex((i) => (i + 1) % SLOT_COUNT)
    }, 1200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="pos-leader-demo">
      <p className="pos-leader-caption">
        Each slot has a designated validator. Time flows left to right.
      </p>
      <div className="pos-validators-row">
        {VALIDATORS.map((v, i) => (
          <div
            key={v}
            className={`pos-validator ${i === slotIndex % VALIDATORS.length ? 'leader' : ''}`}
          >
            <span className="pos-validator-label">{v}</span>
            {i === slotIndex % VALIDATORS.length && (
              <span className="pos-validator-badge">authors</span>
            )}
          </div>
        ))}
      </div>
      <div className="pos-slots">
        {Array.from({ length: SLOT_COUNT }, (_, i) => {
          const producer = VALIDATORS[i % VALIDATORS.length]
          const isCurrent = i === slotIndex
          return (
            <div key={i} className={`pos-slot ${isCurrent ? 'current' : ''}`}>
              <span className="pos-slot-num">slot {i + 1}</span>
              <span className="pos-slot-validator">{producer}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
