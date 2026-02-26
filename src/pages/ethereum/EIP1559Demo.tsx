import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
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

const CHART_COLORS = {
  stroke: 'rgba(6, 182, 212, 0.9)',
  grid: 'rgba(148, 163, 184, 0.15)',
  axis: 'rgba(148, 163, 184, 0.8)',
  referenceLine: 'rgba(6, 182, 212, 0.5)',
}

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

  const currentBlock = SEQUENCE[index]

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
          <ResponsiveContainer width="100%" height={140}>
            <LineChart
              data={SEQUENCE}
              margin={{ top: 8, right: 12, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="blockNum"
                name="Block number"
                stroke={CHART_COLORS.axis}
                tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                tickLine={{ stroke: CHART_COLORS.axis }}
                axisLine={{ stroke: CHART_COLORS.axis }}
              />
              <YAxis
                dataKey="baseFee"
                name="Base fee (gwei)"
                stroke={CHART_COLORS.axis}
                tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                tickLine={{ stroke: CHART_COLORS.axis }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: 6,
                }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number | undefined) => [`${value ?? 0} gwei`, 'Base fee']}
                labelFormatter={(label) => `Block #${label}`}
              />
              <Line
                type="monotone"
                dataKey="baseFee"
                stroke={CHART_COLORS.stroke}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <ReferenceLine
                x={currentBlock.blockNum}
                stroke={CHART_COLORS.referenceLine}
                strokeDasharray="3 2"
                strokeWidth={1}
              />
              <ReferenceDot
                x={currentBlock.blockNum}
                y={currentBlock.baseFee}
                r={4}
                fill={CHART_COLORS.stroke}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="eip1559-caption">
        Blocks show fill %. Base fee (chart) rises when blocks are full, falls when they calm.
      </p>
    </div>
  )
}
