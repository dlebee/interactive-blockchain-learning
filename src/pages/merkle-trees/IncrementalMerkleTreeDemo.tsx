import { useState, useMemo } from 'react'
import './MerkleTreeDemo.css'
import './IncrementalMerkleTreeDemo.css'

function simpleHash(input: string): string {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h).toString(16).padStart(8, '0').slice(-8)
}

const ZERO_HASH = simpleHash('0')

interface MerkleLevel {
  hashes: string[]
  zeroIndices: Set<number>
}

function buildLevels(leaves: string[]): MerkleLevel[] {
  if (leaves.length === 0) return []
  const result: MerkleLevel[] = []
  let current = leaves.map((l) => simpleHash(l))
  while (current.length > 0) {
    const zeros = new Set<number>()
    if (current.length > 1 && current.length % 2 === 1) {
      zeros.add(current.length)
      current.push(ZERO_HASH)
    }
    result.push({ hashes: [...current], zeroIndices: zeros })
    if (current.length <= 1) break
    const next: string[] = []
    for (let i = 0; i < current.length; i += 2) {
      next.push(simpleHash(current[i] + current[i + 1]))
    }
    current = next
  }
  return result
}

interface ProofStep {
  nodeHash: string
  siblingHash: string
  nodeIsLeft: boolean
  siblingIsZero: boolean
  parentHash: string
}

function getProofSteps(levels: MerkleLevel[], leafIdx: number): ProofStep[] {
  const steps: ProofStep[] = []
  let idx = leafIdx
  for (let L = 0; L < levels.length - 1; L++) {
    const sibIdx = idx ^ 1
    const nodeHash = levels[L].hashes[idx]
    const sibHash = levels[L].hashes[sibIdx]
    const isLeft = idx % 2 === 0
    const left = isLeft ? nodeHash : sibHash
    const right = isLeft ? sibHash : nodeHash
    steps.push({
      nodeHash,
      siblingHash: sibHash,
      nodeIsLeft: isLeft,
      siblingIsZero: levels[L].zeroIndices.has(sibIdx),
      parentHash: simpleHash(left + right),
    })
    idx = Math.floor(idx / 2)
  }
  return steps
}

const NW = 58
const NH = 28
const LEVEL_GAP = 56
const H_STEP = NW + 20

interface LayoutNode {
  hash: string
  x: number
  y: number
  isZero: boolean
}

function treeLayout(levels: MerkleLevel[], width: number): LayoutNode[][] {
  if (levels.length === 0) return []
  const totalLevels = levels.length
  const rows: LayoutNode[][] = []
  const leafCount = levels[0].hashes.length
  const leafWidth = (leafCount - 1) * H_STEP
  const leafStartX = (width - leafWidth) / 2
  const leafRow: LayoutNode[] = []
  for (let i = 0; i < leafCount; i++) {
    leafRow.push({
      hash: levels[0].hashes[i],
      x: leafStartX + i * H_STEP,
      y: (totalLevels - 1) * LEVEL_GAP + NH / 2 + 14,
      isZero: levels[0].zeroIndices.has(i),
    })
  }
  rows.push(leafRow)
  for (let L = 1; L < totalLevels; L++) {
    const prevRow = rows[L - 1]
    const row: LayoutNode[] = []
    const y = (totalLevels - 1 - L) * LEVEL_GAP + NH / 2 + 14
    for (let i = 0; i < levels[L].hashes.length; i++) {
      const leftChildIdx = i * 2
      const rightChildIdx = i * 2 + 1
      const leftChild = leftChildIdx < prevRow.length ? prevRow[leftChildIdx] : null
      const rightChild = rightChildIdx < prevRow.length ? prevRow[rightChildIdx] : null
      let x: number
      if (leftChild && rightChild) {
        x = (leftChild.x + rightChild.x) / 2
      } else if (leftChild) {
        x = leftChild.x
      } else {
        x = row.length > 0 ? row[row.length - 1].x + H_STEP : width / 2
      }
      row.push({
        hash: levels[L].hashes[i],
        x,
        y,
        isZero: levels[L].zeroIndices.has(i),
      })
    }
    rows.push(row)
  }
  return rows
}

const SLOT_COUNT = 4

function nextLeafLabel(count: number): string {
  return `leaf_${count}`
}

function emptySlots(): (string | null)[] {
  return Array(SLOT_COUNT).fill(null)
}

export function IncrementalMerkleTreeDemo() {
  const [slots, setSlots] = useState<(string | null)[]>(() => emptySlots())
  const [selectedRootIndex, setSelectedRootIndex] = useState(0)
  const [selectedLeafIdx, setSelectedLeafIdx] = useState<number | null>(null)

  const filledCount = slots.filter((s): s is string => s !== null).length
  const canAddLeaf = filledCount < SLOT_COUNT

  const historicalLevels = useMemo(() => {
    const out: MerkleLevel[][] = []
    for (let k = 0; k <= filledCount; k++) {
      const values =
        k === 0
          ? Array(SLOT_COUNT).fill('0')
          : [...slots.slice(0, k).map((s) => s!), ...Array(SLOT_COUNT - k).fill('0')]
      out.push(buildLevels(values))
    }
    return out
  }, [slots, filledCount])

  const selectedIdx = Math.min(
    Math.max(0, selectedRootIndex),
    Math.max(0, historicalLevels.length - 1)
  )
  const levels = historicalLevels[selectedIdx] ?? []

  const proofSteps = useMemo(() => {
    if (selectedLeafIdx === null || levels.length === 0) return null
    if (selectedLeafIdx >= (levels[0]?.hashes.length ?? 0)) return null
    return getProofSteps(levels, selectedLeafIdx)
  }, [selectedLeafIdx, levels])

  const proofSet = useMemo(() => {
    if (selectedLeafIdx === null || !proofSteps) return new Set<string>()
    const set = new Set<string>()
    let idx = selectedLeafIdx
    for (let L = 0; L < levels.length - 1; L++) {
      const sibIdx = idx ^ 1
      if (sibIdx < levels[L].hashes.length) set.add(`${L}-${sibIdx}`)
      idx = Math.floor(idx / 2)
    }
    return set
  }, [selectedLeafIdx, proofSteps, levels])

  const selectedPath = useMemo(() => {
    if (selectedLeafIdx === null) return new Set<string>()
    const set = new Set<string>()
    let idx = selectedLeafIdx
    for (let L = 0; L < levels.length; L++) {
      set.add(`${L}-${idx}`)
      idx = Math.floor(idx / 2)
    }
    return set
  }, [selectedLeafIdx, levels])

  const leafCount = levels.length > 0 ? levels[0].hashes.length : 0
  const treeW = Math.max(400, leafCount * H_STEP + NW + 40)
  const rows = useMemo(() => treeLayout(levels, treeW), [levels, treeW])
  const treeH = levels.length > 0 ? levels.length * LEVEL_GAP + 28 : 100

  const rootHash =
    proofSteps && proofSteps.length > 0
      ? proofSteps[proofSteps.length - 1].parentHash
      : proofSteps && selectedLeafIdx !== null && levels.length > 0
        ? levels[0].hashes[selectedLeafIdx]
        : null
  const refHash =
    proofSteps?.[0]?.nodeHash ??
    (selectedLeafIdx !== null && levels[0] ? levels[0].hashes[selectedLeafIdx] : '')

  const handleAddLeaf = () => {
    if (!canAddLeaf) return
    const idx = slots.findIndex((s) => s === null)
    if (idx < 0) return
    setSlots((p) => {
      const next = [...p]
      next[idx] = nextLeafLabel(filledCount)
      return next
    })
    setSelectedRootIndex(filledCount + 1)
    setSelectedLeafIdx(null)
  }

  const handleReset = () => {
    setSlots(emptySlots())
    setSelectedRootIndex(0)
    setSelectedLeafIdx(null)
  }

  const handleSelectRoot = (i: number) => {
    setSelectedRootIndex(i)
    setSelectedLeafIdx(null)
  }

  return (
    <div className="merkle-tree-demo imt-interactive-demo">
      <div className="merkle-tree-controls">
        <button
          type="button"
          className="merkle-add-btn"
          onClick={handleAddLeaf}
          disabled={!canAddLeaf}
        >
          Add leaf
        </button>
        <button type="button" className="merkle-reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>
      <p className="merkle-tree-hint">
        {filledCount === 0 && selectedRootIndex === 0
          ? 'Tree is pre-filled with 4 zero slots (depth 2). Add leaf to fill the next slot; each add stores a new historical root.'
          : selectedLeafIdx !== null
            ? 'Proof for the selected leaf in this root version. Switch root below to see another version.'
            : 'Click a leaf to see its Merkle proof for the currently selected root. Click a historical root below to view that version of the tree.'}
      </p>

      <div className="merkle-tree-pair">
        <svg
          viewBox={`0 0 ${treeW} ${treeH}`}
          className="merkle-tree-svg merkle-main-svg"
        >
          {levels.length === 0 && (
            <text
              x={treeW / 2}
              y={treeH / 2}
              className="merkle-empty-label"
              textAnchor="middle"
              dominantBaseline="central"
            >
              No leaves yet
            </text>
          )}
          {rows.length > 0 && (
            <>
              {rows.slice(0, -1).map((childRow, L) =>
                childRow.map((child, ci) => {
                  const pi = Math.floor(ci / 2)
                  const parent = rows[L + 1]?.[pi]
                  if (!parent) return null
                  return (
                    <line
                      key={`e-${L}-${ci}`}
                      x1={parent.x}
                      y1={parent.y + NH / 2}
                      x2={child.x}
                      y2={child.y - NH / 2}
                      className="merkle-edge"
                    />
                  )
                })
              )}
              {rows.map((row, L) =>
                row.map((node, i) => {
                  const key = `${L}-${i}`
                  const isOnPath = selectedPath.has(key)
                  const isSibling = proofSet.has(key)
                  const isLeaf = L === 0
                  const isRoot = L === levels.length - 1
                  const isRefLeaf = isLeaf && isOnPath
                  const zeroInProof = node.isZero && isSibling
                  const nodeClass = isRefLeaf
                    ? 'merkle-node-ref'
                    : zeroInProof
                      ? 'merkle-node-proof'
                      : node.isZero
                        ? 'merkle-node-zero'
                        : isOnPath && isRoot
                          ? 'merkle-node-root'
                          : isOnPath
                            ? 'merkle-node-selected'
                            : isSibling
                              ? 'merkle-node-proof'
                              : ''
                  return (
                    <g
                      key={key}
                      onClick={isLeaf ? () => setSelectedLeafIdx(i) : undefined}
                      style={isLeaf ? { cursor: 'pointer' } : undefined}
                    >
                      <rect
                        x={node.x - NW / 2}
                        y={node.y - NH / 2}
                        width={NW}
                        height={NH}
                        rx="4"
                        className={`merkle-node ${nodeClass}`.trim()}
                      />
                      <text
                        x={node.x}
                        y={node.y + 1}
                        className="merkle-node-label"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {node.isZero ? '0' : node.hash.slice(0, 6)}
                      </text>
                    </g>
                  )
                })
              )}
            </>
          )}
        </svg>

        <div className="merkle-proof-array-panel">
          {proofSteps === null ? (
            <p className="merkle-proof-placeholder">
              {levels.length === 0 ? '' : 'Click a leaf'}
            </p>
          ) : (
            <div className="merkle-proof-visual-array">
              {rootHash !== null && (
                <div className="merkle-proof-item">
                  <span className="merkle-proof-box merkle-proof-box-root">root</span>
                  <span className="merkle-proof-box merkle-proof-box-root merkle-proof-hash-right">
                    {rootHash.slice(0, 6)}
                  </span>
                </div>
              )}
              {[...proofSteps].reverse().map((step, i) => {
                const isResultRoot = step.parentHash === rootHash
                return (
                  <div key={i} className="merkle-proof-item">
                    <span className="merkle-proof-box merkle-proof-box-sibling">
                      {step.nodeIsLeft ? 'R' : 'L'}
                    </span>
                    <span
                      className={`merkle-proof-box merkle-proof-box-sibling${step.siblingIsZero ? ' merkle-proof-box-zero' : ''}`}
                    >
                      {step.siblingIsZero ? '0' : step.siblingHash.slice(0, 6)}
                    </span>
                    {isResultRoot ? (
                      <span
                        className="merkle-proof-box merkle-proof-box-noop merkle-proof-hash-right"
                        title="Result is root, already shown above"
                      >
                        root
                      </span>
                    ) : (
                      <span className="merkle-proof-hash merkle-proof-result merkle-proof-hash-right">
                        {step.parentHash.slice(0, 6)}
                      </span>
                    )}
                  </div>
                )
              })}
              <div className="merkle-proof-item">
                <span className="merkle-proof-box merkle-proof-box-ref">ref</span>
                <span className="merkle-proof-box merkle-proof-box-ref merkle-proof-hash-right">
                  {refHash.slice(0, 6)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {historicalLevels.length > 0 && (
        <div className="imt-historical-panel">
          <span className="imt-historical-label">Historical roots (click to view that tree)</span>
          <div className="imt-historical-roots">
            {historicalLevels.map((_, i) => {
              const lv = historicalLevels[i]
              const rootH = lv.length > 0 ? lv[lv.length - 1].hashes[0] : ''
              const isSelected = selectedIdx === i
              return (
                <button
                  key={i}
                  type="button"
                  className={`imt-root-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectRoot(i)}
                >
                  <span className="imt-root-btn-label">R{i}</span>
                  <span className="imt-root-btn-hash">{rootH.slice(0, 6)}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="merkle-proof-legend">
        <p className="merkle-proof-legend-title">Proof panel colours:</p>
        <ul className="merkle-proof-legend-list">
          <li><span className="merkle-legend-swatch merkle-legend-root" /> root</li>
          <li><span className="merkle-legend-swatch merkle-legend-ref" /> ref = leaf</li>
          <li><span className="merkle-legend-swatch merkle-legend-sibling" /> sibling (L/R + hash or 0)</li>
          <li><span className="merkle-legend-swatch merkle-legend-result" /> result (right)</li>
          <li><span className="merkle-legend-swatch merkle-legend-noop" /> gray = no-op (result is root)</li>
        </ul>
      </div>
    </div>
  )
}
