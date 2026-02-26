import { useState, useEffect, useRef } from 'react'
import './IncrementalMerkleTreeDemo.css'

type Phase = 'idle' | 'addFlying' | 'addLanded' | 'proofFlying' | 'proofLanded' | 'paused'

function simpleRoot(seed: number): string {
  let h = seed * 31
  h = (h << 5) - h
  h = h & 0xffffff
  return h.toString(16).padStart(6, '0').slice(-6)
}

const ROOT_0 = simpleRoot(1)
const ROOT_1 = simpleRoot(2)

export function IncrementalMerkleTreeRaceDemo() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [leafCount, setLeafCount] = useState(1)
  const [historicalRoots, setHistoricalRoots] = useState<string[]>([ROOT_0])
  const [flyingTx, setFlyingTx] = useState<'add' | 'proof' | null>(null)
  const [showAccepted, setShowAccepted] = useState(false)
  const pauseRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleReset = () => {
    if (pauseRef.current) {
      clearTimeout(pauseRef.current)
      pauseRef.current = null
    }
    setPhase('idle')
    setLeafCount(1)
    setHistoricalRoots([ROOT_0])
    setFlyingTx(null)
    setShowAccepted(false)
  }

  useEffect(() => {
    if (phase === 'idle') {
      const t = setTimeout(() => {
        setFlyingTx('add')
        setPhase('addFlying')
      }, 600)
      return () => clearTimeout(t)
    }
    if (phase === 'addFlying') {
      const t = setTimeout(() => {
        setFlyingTx(null)
        setLeafCount(2)
        setHistoricalRoots([ROOT_0, ROOT_1])
        setPhase('addLanded')
      }, 480)
      return () => clearTimeout(t)
    }
    if (phase === 'addLanded') {
      const t = setTimeout(() => {
        setFlyingTx('proof')
        setPhase('proofFlying')
      }, 500)
      return () => clearTimeout(t)
    }
    if (phase === 'proofFlying') {
      const t = setTimeout(() => {
        setFlyingTx(null)
        setShowAccepted(true)
        setPhase('proofLanded')
      }, 480)
      return () => clearTimeout(t)
    }
    if (phase === 'proofLanded') {
      const t = setTimeout(() => {
        setShowAccepted(false)
        setPhase('paused')
      }, 1400)
      return () => clearTimeout(t)
    }
    if (phase === 'paused') {
      pauseRef.current = setTimeout(() => {
        handleReset()
        pauseRef.current = null
      }, 2800)
      return () => {
        if (pauseRef.current) clearTimeout(pauseRef.current)
      }
    }
    return undefined
  }, [phase])

  const mempoolHasAdd = phase === 'idle'
  const mempoolHasProof = phase === 'idle' || phase === 'addFlying' || phase === 'addLanded'

  return (
    <div className="imt-demo">
      <div className="imt-layout">
        <div className="imt-contract-section">
          <span className="imt-contract-label">Contract (IMT)</span>
          <div className="imt-contract-box">
            <div className="imt-leaves-row">
              <span className="imt-leaves-label">Leaves:</span>
              <div className="imt-leaves-slots">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className={`imt-leaf-slot ${i < leafCount ? 'filled' : 'zero'}`}>
                    {i < leafCount ? simpleRoot(i + 1).slice(0, 4) : '0'}
                  </div>
                ))}
              </div>
            </div>
            <div className="imt-roots-block">
              <span className="imt-roots-label">Historical roots</span>
              <div className="imt-roots-list">
                {historicalRoots.map((r, i) => (
                  <div key={i} className="imt-root-chip">
                    <span className="imt-root-name">R{i}</span>
                    <span className="imt-root-hash">{r}</span>
                  </div>
                ))}
              </div>
            </div>
            {showAccepted && (
              <div className="imt-accepted-badge">
                Accepted (R0)
              </div>
            )}
          </div>
        </div>

        <div className="imt-flow-zone">
          {flyingTx === 'add' && (
            <span className="imt-flying-tx imt-flying-add" key="fly-add">
              Add leaf
            </span>
          )}
          {flyingTx === 'proof' && (
            <span className="imt-flying-tx imt-flying-proof" key="fly-proof">
              Submit proof (R0)
            </span>
          )}
          <span className="imt-flow-arrow" aria-hidden>↑</span>
        </div>

        <div className="imt-mempool-section">
          <span className="imt-queue-label">Mempool</span>
          <div className="imt-mempool">
            {mempoolHasAdd && (
              <div className={`imt-tx imt-tx-add ${flyingTx === 'add' ? 'flying' : ''}`}>
                <span className="imt-tx-label">Add leaf</span>
              </div>
            )}
            {mempoolHasProof && (
              <div className={`imt-tx imt-tx-proof ${flyingTx === 'proof' ? 'flying' : ''}`}>
                <span className="imt-tx-label">Submit proof (R0)</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="imt-footer">
        <p className="imt-caption">
          One race: Add leaf is applied first (tree grows, R1 added to historical roots). Then the prover submits a proof for R0. Because R0 is still in historical roots, the proof is accepted.
        </p>
        <button type="button" className="imt-reset-btn" onClick={handleReset}>
          Replay
        </button>
      </div>
    </div>
  )
}
