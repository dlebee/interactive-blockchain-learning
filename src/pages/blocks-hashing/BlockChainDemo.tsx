import { useState, useEffect, useMemo, Fragment } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  Position,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { BlockNode } from './BlockNode'
import { BlockNodeEditable } from './BlockNodeEditable'
import type { BlockNodeEditableData } from './BlockNodeEditable'
import './BlockChainDemo.css'

const NODE_WIDTH = 100
const HORIZONTAL_GAP = 25

function simpleHash(input: string): string {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h).toString(16).padStart(8, '0').slice(-8)
}

function randomContent(): string {
  const chars = 'abcdef0123456789'
  return `tx_${Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`
}

interface BlockData {
  id: number
  content: string
  prevHash: string
}

function computeChain(blocks: BlockData[]): { hash: string; isValid: boolean }[] {
  const results: { hash: string; isValid: boolean }[] = []
  let expectedPrev = '00000000'
  let chainBroken = false

  for (let i = 0; i < blocks.length; i++) {
    const input = blocks[i].content + blocks[i].prevHash
    const hash = simpleHash(input)
    const prevMatches = blocks[i].prevHash === expectedPrev
    if (!prevMatches) chainBroken = true
    results.push({ hash, isValid: prevMatches && !chainBroken })
    expectedPrev = hash
  }
  return results
}

const nodeTypes = {
  block: BlockNode,
  blockEditable: BlockNodeEditable,
}

function BuildChain({
  blocks,
  hashes,
}: {
  blocks: BlockData[]
  hashes: { hash: string; isValid?: boolean }[]
}) {
  return (
    <div className="build-chain">
      {blocks.map((block, i) => (
        <Fragment key={block.id}>
          {i > 0 && (
            <div className="build-chain-arrow" aria-hidden>
              ←
            </div>
          )}
          <div
            className={`block-node ${hashes[i]?.isValid === false ? 'invalid' : ''}`}
          >
            <div className="block-node-header">Block {block.id}</div>
            <div className="block-node-field">
              <span className="block-node-label">Content</span>
              <span className="block-node-value">{block.content}</span>
            </div>
            <div className="block-node-field">
              <span className="block-node-label">Prev hash</span>
              <code className="block-node-hash">{block.prevHash}</code>
            </div>
            <div className="block-node-field digest">
              <span className="block-node-label">Digest</span>
              <code className="block-node-hash">{hashes[i]?.hash ?? ''}</code>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function EditFlow({
  nodes,
  edges,
}: {
  nodes: Node[]
  edges: Edge[]
}) {
  const { fitView } = useReactFlow()

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      fitView({ padding: 0.2, minZoom: 0.15, maxZoom: 1.2 })
    })
    return () => cancelAnimationFrame(timer)
  }, [nodes, fitView])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={() => {}}
      onEdgesChange={() => {}}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2, minZoom: 0.15, maxZoom: 1.2 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={true}
      zoomOnScroll={true}
    />
  )
}

function blocksToEditFlow(
  blocks: BlockData[],
  hashes: { hash: string }[],
  variant: 'original' | 'tampered' | 'shared',
  onContentChange?: (id: number, content: string) => void
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = blocks.map((block, i) => ({
    id: `${variant}-block-${block.id}`,
    type: 'blockEditable',
    position: { x: i * (NODE_WIDTH + HORIZONTAL_GAP), y: 0 },
    data: {
      blockId: block.id,
      content: block.content,
      prevHash: block.prevHash,
      hash: hashes[i]?.hash ?? '',
      invalid:
        typeof (hashes[i] as { isValid?: boolean })?.isValid === 'boolean'
          ? !(hashes[i] as { isValid?: boolean }).isValid
          : false,
      variant,
      onContentChange:
        variant === 'tampered' && onContentChange
          ? (c: string) => onContentChange(block.id, c)
          : undefined,
    } satisfies BlockNodeEditableData,
    sourcePosition: Position.Left,
    targetPosition: Position.Right,
  }))

  const edges: Edge[] = []
  for (let i = 1; i < blocks.length; i++) {
    edges.push({
      id: `e-${variant}-${blocks[i - 1].id}-${blocks[i].id}`,
      source: `${variant}-block-${blocks[i].id}`,
      target: `${variant}-block-${blocks[i - 1].id}`,
      markerEnd: { type: MarkerType.ArrowClosed },
      type: 'straight',
    })
  }

  return { nodes, edges }
}

function blocksToForkFlow(
  builtBlocks: BlockData[],
  forkBlocks: BlockData[],
  builtHashes: { hash: string }[],
  forkHashes: { hash: string }[],
  firstTamperedIndex: number,
  onContentChange: (id: number, content: string) => void
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const sharedBlocks = builtBlocks.slice(0, firstTamperedIndex)
  const sharedHashes = builtHashes.slice(0, firstTamperedIndex)
  const origBlocks = builtBlocks.slice(firstTamperedIndex)
  const origHashes = builtHashes.slice(firstTamperedIndex)
  const forkBlocksTail = forkBlocks.slice(firstTamperedIndex)
  const forkHashesTail = forkHashes.slice(firstTamperedIndex)

  let x = 0
  sharedBlocks.forEach((block, i) => {
    const isLastShared = i === sharedBlocks.length - 1
    nodes.push({
      id: `shared-${block.id}`,
      type: 'blockEditable',
      position: { x, y: 80 },
      data: {
        blockId: block.id,
        content: block.content,
        prevHash: block.prevHash,
        hash: sharedHashes[i]?.hash ?? '',
        variant: 'shared',
        connectOnRight: isLastShared,
      } satisfies BlockNodeEditableData,
      sourcePosition: Position.Left,
      targetPosition: Position.Right,
    })
    if (i > 0) {
      edges.push({
        id: `e-shared-${sharedBlocks[i - 1].id}-${block.id}`,
        source: `shared-${block.id}`,
        target: `shared-${sharedBlocks[i - 1].id}`,
        markerEnd: { type: MarkerType.ArrowClosed },
        type: 'straight',
      })
    }
    x += NODE_WIDTH + HORIZONTAL_GAP
  })

  const branchStartX = x + NODE_WIDTH + HORIZONTAL_GAP
  let origX = branchStartX
  origBlocks.forEach((block, j) => {
    nodes.push({
      id: `orig-${block.id}`,
      type: 'blockEditable',
      position: { x: origX, y: 0 },
      data: {
        blockId: block.id,
        content: block.content,
        prevHash: block.prevHash,
        hash: origHashes[j]?.hash ?? '',
        variant: 'original',
        targetOnLeft: j === 0,
      } satisfies BlockNodeEditableData,
      sourcePosition: Position.Left,
      targetPosition: Position.Right,
    })
    if (j === 0 && sharedBlocks.length > 0) {
      edges.push({
        id: 'e-shared-orig',
        source: `shared-${sharedBlocks[sharedBlocks.length - 1].id}`,
        sourceHandle: 'right',
        target: `orig-${block.id}`,
        targetHandle: 'left',
        label: 'Truthful chain',
        labelStyle: { fill: '#22c55e', fontSize: 11 },
        labelShowBg: true,
        labelBgStyle: { fill: 'rgba(0,0,0,0.85)' },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: { type: MarkerType.ArrowClosed },
        type: 'straight',
      })
    } else if (j > 0) {
      edges.push({
        id: `e-orig-${origBlocks[j - 1].id}-${block.id}`,
        source: `orig-${block.id}`,
        target: `orig-${origBlocks[j - 1].id}`,
        markerEnd: { type: MarkerType.ArrowClosed },
        type: 'straight',
      })
    }
    origX += NODE_WIDTH + HORIZONTAL_GAP
  })

  let tamperedX = branchStartX
  forkBlocksTail.forEach((block, j) => {
    nodes.push({
      id: `tampered-${block.id}`,
      type: 'blockEditable',
      position: { x: tamperedX, y: 160 },
      data: {
        blockId: block.id,
        content: block.content,
        prevHash: block.prevHash,
        hash: forkHashesTail[j]?.hash ?? '',
        variant: 'tampered',
        onContentChange: (c: string) => onContentChange(block.id, c),
        targetOnLeft: j === 0,
      } satisfies BlockNodeEditableData,
      sourcePosition: Position.Left,
      targetPosition: Position.Right,
    })
    if (j === 0 && sharedBlocks.length > 0) {
      edges.push({
        id: 'e-shared-tampered',
        source: `shared-${sharedBlocks[sharedBlocks.length - 1].id}`,
        sourceHandle: 'right',
        target: `tampered-${block.id}`,
        targetHandle: 'left',
        label: 'Tampered hostile fork',
        labelStyle: { fill: '#ef4444', fontSize: 11 },
        labelShowBg: true,
        labelBgStyle: { fill: 'rgba(0,0,0,0.85)' },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: { type: MarkerType.ArrowClosed },
        type: 'straight',
      })
    } else if (j > 0) {
      edges.push({
        id: `e-tampered-${forkBlocksTail[j - 1].id}-${block.id}`,
        source: `tampered-${block.id}`,
        target: `tampered-${forkBlocksTail[j - 1].id}`,
        markerEnd: { type: MarkerType.ArrowClosed },
        type: 'straight',
      })
    }
    tamperedX += NODE_WIDTH + HORIZONTAL_GAP
  })

  return { nodes, edges }
}

export function BlockChainDemo() {
  const [builtBlocks, setBuiltBlocks] = useState<BlockData[]>([
    { id: 0, content: randomContent(), prevHash: '00000000' },
  ])
  const [editBlocks, setEditBlocks] = useState<BlockData[] | null>(null)

  const builtHashes = computeChain(builtBlocks)
  const canAddBlock = builtBlocks.length < 5

  const addBlock = () => {
    if (!canAddBlock) return
    const prevHash = builtHashes[builtHashes.length - 1].hash
    setBuiltBlocks((prev) => [
      ...prev,
      { id: prev.length, content: randomContent(), prevHash },
    ])
  }

  useEffect(() => {
    if (builtBlocks.length >= 2 && editBlocks === null) {
      setEditBlocks(builtBlocks.map((b) => ({ ...b })))
    }
  }, [builtBlocks, editBlocks])

  useEffect(() => {
    if (!editBlocks || builtBlocks.length <= editBlocks.length) return
    const editHashes = computeChain(editBlocks)
    const newBlock = builtBlocks[builtBlocks.length - 1]
    const prevHash = editHashes[editBlocks.length - 1].hash
    setEditBlocks([...editBlocks, { ...newBlock, prevHash }])
  }, [builtBlocks, editBlocks])

  const displayEditBlocks = editBlocks ?? builtBlocks
  const editHashes = computeChain(displayEditBlocks)

  const firstTamperedIndex = displayEditBlocks.findIndex(
    (b, i) => builtBlocks[i] && b.content !== builtBlocks[i].content
  )
  const hasTampered = firstTamperedIndex >= 0

  const { forkBlocks, forkHashes } = useMemo(() => {
    const blocks: BlockData[] = []
    const hashes: { hash: string }[] = []
    if (firstTamperedIndex >= 0 && displayEditBlocks.length > 0) {
      let expectedPrev = '00000000'
      for (let i = 0; i < displayEditBlocks.length; i++) {
        const content =
          i < firstTamperedIndex ? builtBlocks[i].content : displayEditBlocks[i].content
        const block: BlockData = {
          id: displayEditBlocks[i].id,
          content,
          prevHash: expectedPrev,
        }
        const hash = simpleHash(block.content + block.prevHash)
        blocks.push(block)
        hashes.push({ hash })
        expectedPrev = hash
      }
    }
    return { forkBlocks: blocks, forkHashes: hashes }
  }, [firstTamperedIndex, displayEditBlocks, builtBlocks])

  const updateBlockContent = (id: number, content: string) => {
    setEditBlocks((prev) => {
      if (!prev) return prev
      return prev.map((b) => (b.id === id ? { ...b, content } : b))
    })
  }

  const tamperChain = () => {
    setEditBlocks((prev) => {
      if (!prev || prev.length < 2) return prev
      const blockToTamper = 1
      return prev.map((b, i) =>
        i === blockToTamper ? { ...b, content: b.content + '_X' } : { ...b }
      )
    })
  }

  const resetChain = () => {
    setBuiltBlocks([{ id: 0, content: randomContent(), prevHash: '00000000' }])
    setEditBlocks(null)
  }

  const editFlow = useMemo(() => {
    if (hasTampered && forkBlocks.length > 0) {
      return blocksToForkFlow(
        builtBlocks,
        forkBlocks,
        builtHashes,
        forkHashes,
        firstTamperedIndex,
        updateBlockContent
      )
    }
    return blocksToEditFlow(
      displayEditBlocks,
      editHashes,
      'original',
      undefined
    )
  }, [
    hasTampered,
    forkBlocks,
    builtBlocks,
    builtHashes,
    forkHashes,
    firstTamperedIndex,
    displayEditBlocks,
    editHashes,
  ])

  return (
    <div className="block-chain-demo">
      <section className="demo-section">
        <h3>Build your chain</h3>
        <p className="section-desc">
          Start with one block. Click Next to add more (up to 5).
        </p>
        <div className="flow-container build-flow">
          <BuildChain blocks={builtBlocks} hashes={builtHashes} />
        </div>
        <button
          type="button"
          className="next-btn"
          onClick={addBlock}
          disabled={!canAddBlock}
        >
          Next
        </button>
      </section>

      {builtBlocks.length >= 2 && displayEditBlocks.length >= 2 && (
        <section className="demo-section edit-section">
          <h3>See what happens when you tamper</h3>
          <p className="section-desc">
            Click the button below to tamper the chain. Watch how the fork
            appears and hashes change downstream.
          </p>
          <div className="flow-container edit-flow">
            <ReactFlowProvider>
              <EditFlow
                nodes={editFlow.nodes}
                edges={editFlow.edges}
              />
            </ReactFlowProvider>
          </div>
          {!hasTampered ? (
            <button
              type="button"
              className="next-btn tamper-btn"
              onClick={tamperChain}
            >
              Tamper the chain
            </button>
          ) : (
            <button
              type="button"
              className="next-btn tamper-btn reset-btn"
              onClick={resetChain}
            >
              Reset and try again
            </button>
          )}
        </section>
      )}
    </div>
  )
}
