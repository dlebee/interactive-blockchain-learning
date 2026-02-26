import { useState, useMemo } from 'react'
import './MerkleTreeDemo.css'

function simpleHash(input: string): string {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h).toString(16).padStart(8, '0').slice(-8)
}

function randomLeaf(): string {
  const chars = 'abcdef0123456789'
  return `tx_${Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`
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

  // At each level, if the count is odd and > 1, append a visible PAD_HASH (0)
  // node so the tree shows the padding. This matches the Rust implementation
  // where .get(i+1).unwrap_or(&PAD_HASH) is used for the unpaired node.
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

  // Lay out leaves first (bottom), then position each parent centered over its children
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

  // Each subsequent level: center parent above its two children.
  // Padding nodes have no children, so position them next to their sibling.
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

export function MerkleTreeDemo() {
  const [leaves, setLeaves] = useState<string[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const levels = useMemo(() => buildLevels(leaves), [leaves])

  const proofSteps = useMemo(() => {
    if (selectedIdx === null || levels.length === 0) return null
    return getProofSteps(levels, selectedIdx)
  }, [selectedIdx, levels])

  const proofSet = useMemo(() => {
    if (selectedIdx === null || !proofSteps) return new Set<string>()
    const set = new Set<string>()
    let idx = selectedIdx
    for (let L = 0; L < levels.length - 1; L++) {
      const sibIdx = idx ^ 1
      if (sibIdx < levels[L].hashes.length) {
        set.add(`${L}-${sibIdx}`)
      }
      idx = Math.floor(idx / 2)
    }
    return set
  }, [selectedIdx, proofSteps, levels])

  const selectedPath = useMemo(() => {
    if (selectedIdx === null) return new Set<string>()
    const set = new Set<string>()
    let idx = selectedIdx
    for (let L = 0; L < levels.length; L++) {
      set.add(`${L}-${idx}`)
      idx = Math.floor(idx / 2)
    }
    return set
  }, [selectedIdx, levels])

  const leafCount = levels.length > 0 ? levels[0].hashes.length : 0
  const treeW = Math.max(400, leafCount * H_STEP + NW + 40)
  const rows = useMemo(() => treeLayout(levels, treeW), [levels, treeW])
  const treeH = levels.length > 0 ? levels.length * LEVEL_GAP + 28 : 100

  const rootHash =
    proofSteps && proofSteps.length > 0
      ? proofSteps[proofSteps.length - 1].parentHash
      : proofSteps && selectedIdx !== null && levels.length > 0
        ? levels[0].hashes[selectedIdx]
        : null

  const refHash =
    proofSteps?.[0]?.nodeHash ?? (selectedIdx !== null && levels[0] ? levels[0].hashes[selectedIdx] : '')

  return (
    <div className="merkle-tree-demo">
      <div className="merkle-tree-controls">
        <button type="button" className="merkle-add-btn" onClick={() => { setLeaves((p) => [...p, randomLeaf()]); setSelectedIdx(null) }}>
          Add leaf
        </button>
        <button type="button" className="merkle-reset-btn" onClick={() => { setLeaves([]); setSelectedIdx(null) }}>
          Reset
        </button>
      </div>
      <p className="merkle-tree-hint">
        {leaves.length === 0
          ? 'Press "Add leaf" to build the tree. Each leaf is a hashed transaction.'
          : selectedIdx !== null
            ? 'Right: root on top, then each sibling hash + L/R with arrow to result (orange), ref at bottom.'
            : 'Click any leaf to see its Merkle proof.'}
      </p>

      <div className="merkle-tree-pair">
        {/* Main tree */}
        <svg viewBox={`0 0 ${treeW} ${treeH}`} className="merkle-tree-svg merkle-main-svg">
          {levels.length === 0 && (
            <text x={treeW / 2} y={treeH / 2} className="merkle-empty-label" textAnchor="middle" dominantBaseline="central">
              No leaves yet
            </text>
          )}
          {rows.length > 0 && (
            <>
              {/* Edges */}
              {rows.slice(0, -1).map((childRow, L) =>
                childRow.map((child, ci) => {
                  const pi = Math.floor(ci / 2)
                  const parent = rows[L + 1]?.[pi]
                  if (!parent) return null
                  return (
                    <line key={`e-${L}-${ci}`} x1={parent.x} y1={parent.y + NH / 2} x2={child.x} y2={child.y - NH / 2} className="merkle-edge" />
                  )
                })
              )}

              {/* Nodes */}
              {rows.map((row, L) =>
                row.map((node, i) => {
                  const key = `${L}-${i}`
                  const isOnPath = selectedPath.has(key)
                  const isSibling = proofSet.has(key)
                  const isLeaf = L === 0
                  const isRoot = L === levels.length - 1
                  const isRefLeaf = isLeaf && isOnPath
                  const zeroInProof = node.isZero && isSibling
                  const nodeClass =
                    isRefLeaf ? 'merkle-node-ref' :
                    zeroInProof ? 'merkle-node-proof' :
                    node.isZero ? 'merkle-node-zero' :
                    isOnPath && isRoot ? 'merkle-node-root' :
                    isOnPath ? 'merkle-node-selected' :
                    isSibling ? 'merkle-node-proof' : ''
                  return (
                    <g
                      key={key}
                      onClick={isLeaf ? () => setSelectedIdx(i) : undefined}
                      style={isLeaf ? { cursor: 'pointer' } : undefined}
                    >
                      <rect
                        x={node.x - NW / 2} y={node.y - NH / 2} width={NW} height={NH} rx="4"
                        className={`merkle-node ${nodeClass}`.trim()}
                      />
                      <text x={node.x} y={node.y + 1} className="merkle-node-label" textAnchor="middle" dominantBaseline="central">
                        {node.isZero ? '0' : node.hash.slice(0, 6)}
                      </text>
                    </g>
                  )
                })
              )}
            </>
          )}
        </svg>

        {/* Proof: root on top; each step L/R + sibling hash, blue arrow to result (orange) when result is not root; ref at bottom */}
        <div className="merkle-proof-array-panel">
          {proofSteps === null ? (
            <p className="merkle-proof-placeholder">
              {leaves.length === 0 ? '' : 'Click a leaf'}
            </p>
          ) : (
            <div className="merkle-proof-visual-array">
              {/* Root on top — purple, same style for label and hash */}
              {rootHash !== null && (
                <div className="merkle-proof-item">
                  <span className="merkle-proof-box merkle-proof-box-root">root</span>
                  <span className="merkle-proof-box merkle-proof-box-root merkle-proof-hash-right">{rootHash.slice(0, 6)}</span>
                </div>
              )}
              {/* Each step: L/R + sibling hash; result hash in orange when not root */}
              {[...proofSteps].reverse().map((step, i) => {
                const isResultRoot = step.parentHash === rootHash
                return (
                  <div key={i} className="merkle-proof-item">
                    <span className="merkle-proof-box merkle-proof-box-sibling">
                      {step.nodeIsLeft ? 'R' : 'L'}
                    </span>
                    <span className={`merkle-proof-box merkle-proof-box-sibling${step.siblingIsZero ? ' merkle-proof-box-zero' : ''}`}>
                      {step.siblingIsZero ? '0' : step.siblingHash.slice(0, 6)}
                    </span>
                    {isResultRoot ? (
                      <span className="merkle-proof-box merkle-proof-box-noop merkle-proof-hash-right" title="Result is root, already shown above">root</span>
                    ) : (
                      <span className="merkle-proof-hash merkle-proof-result merkle-proof-hash-right">{step.parentHash.slice(0, 6)}</span>
                    )}
                  </div>
                )
              })}
              {/* Ref (initial leaf) at bottom — red, same style for label and hash */}
              <div className="merkle-proof-item">
                <span className="merkle-proof-box merkle-proof-box-ref">ref</span>
                <span className="merkle-proof-box merkle-proof-box-ref merkle-proof-hash-right">{refHash.slice(0, 6)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="merkle-proof-legend">
        <p className="merkle-proof-legend-title">Proof panel colours:</p>
        <ul className="merkle-proof-legend-list">
          <li><span className="merkle-legend-swatch merkle-legend-root" /> root</li>
          <li><span className="merkle-legend-swatch merkle-legend-ref" /> ref = initial leaf</li>
          <li><span className="merkle-legend-swatch merkle-legend-sibling" /> sibling (L/R + hash or 0)</li>
          <li><span className="merkle-legend-swatch merkle-legend-result" /> current iteration result (right)</li>
          <li><span className="merkle-legend-swatch merkle-legend-noop" /> gray = no-op (result is root, already at top)</li>
        </ul>
      </div>
    </div>
  )
}
