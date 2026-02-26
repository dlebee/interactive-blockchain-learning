import { useState, useEffect } from 'react'
import './EIP1559Demo.css'

const GAS_TARGET = 50

function nextBaseFee(parentBaseFee: number, parentFill: number): number {
  const gasUsed = parentFill
  const gasTarget = GAS_TARGET
  if (gasUsed > gasTarget) {
    const delta = Math.max(
      (parentBaseFee * (gasUsed - gasTarget)) / gasTarget / 8,
      0.001
    )
    return Math.round((parentBaseFee + delta) * 10) / 10
  }
  if (gasUsed < gasTarget) {
    const delta = (parentBaseFee * (gasTarget - gasUsed)) / gasTarget / 8
    return Math.max(3, Math.round((parentBaseFee - delta) * 10) / 10)
  }
  return parentBaseFee
}

const FILL_SEQUENCE = [
  25, 28, 32, 38, 45, 52, 62, 72, 82, 88, 92,
  88, 82, 72, 58, 45, 38, 32, 28, 25,
]

const INITIAL_BASE_FEE = 12

function buildSequence(): { blockNum: number; fill: number; baseFee: number }[] {
  const out: { blockNum: number; fill: number; baseFee: number }[] = []
  let fee = INITIAL_BASE_FEE
  FILL_SEQUENCE.forEach((fill, i) => {
    out.push({ blockNum: i, fill, baseFee: fee })
    fee = nextBaseFee(fee, fill)
  })
  return out
}

const SEQUENCE = buildSequence()
const TICK_MS = 550

const CHART_WIDTH = 400
const CHART_HEIGHT = 120
const PAD = { left: 32, right: 12, top: 8, bottom: 24 }

export function EIP1559Demo() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SEQUENCE.length)
    }, TICK_MS)
    return () => clearInterval(t)
  }, [])

  const visibleCount = 10
  const startIdx = Math.max(0, index - visibleCount + 1)
  const visibleBlocks = SEQUENCE.slice(
    startIdx,
    Math.min(startIdx + visibleCount, SEQUENCE.length)
  )
  if (visibleBlocks.length < visibleCount && SEQUENCE.length >= visibleCount) {
    const wrapCount = visibleCount - visibleBlocks.length
    visibleBlocks.push(...SEQUENCE.slice(0, wrapCount))
  }

  const chartMinY = Math.min(...SEQUENCE.map((s) => s.baseFee)) - 1
  const chartMaxY = Math.max(...SEQUENCE.map((s) => s.baseFee)) + 1
  const chartInnerW = CHART_WIDTH - PAD.left - PAD.right
  const chartInnerH = CHART_HEIGHT - PAD.top - PAD.bottom

  function xScale(blockNum: number) {
    return PAD.left + (blockNum / (SEQUENCE.length - 1)) * chartInnerW
  }
  function yScale(fee: number) {
    return PAD.top + chartInnerH - ((fee - chartMinY) / (chartMaxY - chartMinY)) * chartInnerH
  }

  const pathD = SEQUENCE.map((s, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(s.blockNum)} ${yScale(s.baseFee)}`
  ).join(' ')

  const currentX = xScale(SEQUENCE[index].blockNum)

  return (
    <div className="eip1559-demo" aria-label="Animation: blocks with fill %, gas price chart by block number">
      <h4 className="eip1559-title">Block fullness and base fee over time</h4>
      <div className="eip1559-content">
        <div className="eip1559-blocks-section">
          <div className="eip1559-blocks-row">
            {visibleBlocks.map((block, i) => {
              const seqIdx = (startIdx + i) % SEQUENCE.length
              const isCurrent = seqIdx === index
              return (
                <div
                  key={block.blockNum}
                  className={`eip1559-block-slot ${isCurrent ? 'current' : ''}`}
                >
                  <span className="eip1559-block-num">#{block.blockNum}</span>
                  <div className="eip1559-block-bar">
                    <div
                      className={`eip1559-block-fill ${
                        block.fill > GAS_TARGET ? 'above' : block.fill < GAS_TARGET ? 'below' : 'target'
                      }`}
                      style={{ width: `${block.fill}%` }}
                    />
                    <div className="eip1559-target-marker" style={{ left: '50%' }} />
                  </div>
                  <span className="eip1559-block-pct">{block.fill}%</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="eip1559-chart-section">
          <svg
            className="eip1559-chart"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <line
              x1={PAD.left}
              y1={PAD.top}
              x2={PAD.left}
              y2={CHART_HEIGHT - PAD.bottom}
              className="eip1559-axis"
            />
            <line
              x1={PAD.left}
              y1={CHART_HEIGHT - PAD.bottom}
              x2={CHART_WIDTH - PAD.right}
              y2={CHART_HEIGHT - PAD.bottom}
              className="eip1559-axis"
            />
            <text x={CHART_WIDTH / 2} y={CHART_HEIGHT - 4} className="eip1559-axis-label">
              Block number
            </text>
            <text
              x={10}
              y={CHART_HEIGHT / 2}
              className="eip1559-axis-label"
              textAnchor="middle"
              transform={`rotate(-90, 10, ${CHART_HEIGHT / 2})`}
            >
              Base fee (gwei)
            </text>
            {[0, 5, 10, 15, 19].map((n) => (
              <text
                key={n}
                x={xScale(n)}
                y={CHART_HEIGHT - PAD.bottom + 14}
                className="eip1559-tick-label"
              >
                {n}
              </text>
            ))}
            {[chartMinY, (chartMinY + chartMaxY) / 2, chartMaxY].map((v) => (
              <text
                key={v}
                x={PAD.left - 6}
                y={yScale(v) + 4}
                className="eip1559-tick-label"
                textAnchor="end"
              >
                {Math.round(v)}
              </text>
            ))}
            <path d={pathD} className="eip1559-line" fill="none" />
            <line
              x1={currentX}
              y1={PAD.top}
              x2={currentX}
              y2={CHART_HEIGHT - PAD.bottom}
              className="eip1559-current-line"
            />
            <circle
              cx={currentX}
              cy={yScale(SEQUENCE[index].baseFee)}
              r={4}
              className="eip1559-current-dot"
            />
          </svg>
        </div>
      </div>
      <p className="eip1559-caption">
        Blocks show fill %. Base fee (chart) rises when blocks are full, falls when they calm.
      </p>
    </div>
  )
}
