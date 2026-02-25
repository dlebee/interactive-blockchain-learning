import { useState, useEffect } from 'react'
import './ConsensusSlotDemo.css'

const SLOT_COUNT = 5

export function ConsensusSlotDemo() {
  const [currentSlot, setCurrentSlot] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlot((s) => (s + 1) % SLOT_COUNT)
    }, 1400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="consensus-slot-demo">
      <div className="slot-timeline">
        {Array.from({ length: SLOT_COUNT }, (_, i) => (
          <span key={i} className="slot-timeline-segment">
            <div
              className={`slot-cell ${i === currentSlot ? 'active' : ''} ${
                i < currentSlot ? 'has-block' : ''
              }`}
            >
              <span className="slot-label">slot {i + 1}</span>
              {i <= currentSlot && (
                <div className="slot-block">
                  <span className="block-label">block</span>
                </div>
              )}
            </div>
            {i < SLOT_COUNT - 1 && i < currentSlot && (
              <span className="slot-arrow" aria-hidden>←</span>
            )}
          </span>
        ))}
      </div>
      <p className="slot-caption">
        Time flows left to right. Each slot is a window; a block may be produced.
      </p>
    </div>
  )
}
