import { useState, useEffect } from 'react'
import './BlockspaceDemo.css'

const CAPPED_INTERVAL = 900
const CAPPED_TIME = '6s'
const CAPPED_SIZE = '1MB'

const UNCAPPED_DATA = [
  { delay: 300, time: '0.3s', size: '0.3MB', width: 38 },
  { delay: 2200, time: '2.2s', size: '3.8MB', width: 78 },
  { delay: 500, time: '0.5s', size: '0.5MB', width: 42 },
  { delay: 3000, time: '3s', size: '4.2MB', width: 88 },
  { delay: 200, time: '0.2s', size: '0.2MB', width: 34 },
  { delay: 1800, time: '1.8s', size: '2.5MB', width: 68 },
]
const MAX_BLOCKS = 6

export function BlockspaceDemo() {
  const [cappedCount, setCappedCount] = useState(0)
  const [uncappedCount, setUncappedCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCappedCount((c) => (c >= MAX_BLOCKS ? 0 : c + 1))
    }, CAPPED_INTERVAL)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let i = 0
    const run = () => {
      if (i >= UNCAPPED_DATA.length) {
        i = 0
        setUncappedCount(0)
      }
      const delay = UNCAPPED_DATA[i].delay
      const t = setTimeout(() => {
        setUncappedCount((c) => c + 1)
        i++
        run()
      }, delay)
      return t
    }
    const t = run()
    return () => clearTimeout(t)
  }, [])

  const uncappedToShow = UNCAPPED_DATA.slice(0, Math.min(uncappedCount, MAX_BLOCKS))

  return (
    <div className="blockspace-demo">
      <div className="blockspace-row">
        <div className="blockspace-label">
          <span className="blockspace-title">Capped</span>
          <span className="blockspace-hint">steady size, on time</span>
        </div>
        <div className="blockspace-chain capped-chain">
          {Array.from({ length: cappedCount }, (_, i) => (
            <span key={i} className="blockspace-segment">
              {i > 0 && <span className="blockspace-arrow" aria-hidden>←</span>}
              <span className="blockspace-block capped-block">
                <span className="block-time">{CAPPED_TIME}</span>
                <span className="block-size">{CAPPED_SIZE}</span>
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="blockspace-row">
        <div className="blockspace-label">
          <span className="blockspace-title">Uncapped</span>
          <span className="blockspace-hint">varied size, unpredictable</span>
        </div>
        <div className="blockspace-chain uncapped-chain">
          {uncappedToShow.map((block, i) => (
            <span key={i} className="blockspace-segment">
              {i > 0 && <span className="blockspace-arrow" aria-hidden>←</span>}
              <span
                className="blockspace-block uncapped-block"
                style={{ minWidth: `${block.width}px` }}
              >
                <span className="block-time">{block.time}</span>
                <span className="block-size">{block.size}</span>
              </span>
            </span>
          ))}
        </div>
      </div>

      <p className="blockspace-caption">
        Capped blocks fill on schedule. Uncapped blocks vary in size and timing.
      </p>
    </div>
  )
}
