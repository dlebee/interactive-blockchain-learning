import { useEffect } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  MarkerType,
  Position,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { ForkBlockNode } from './ForkBlockNode'
import './ConsensusForkDemo.css'

const NODE_WIDTH = 56
const GAP = 28
const COL = NODE_WIDTH + GAP
const BRANCH_Y = 70

// 3-layer fork left-to-right: 0→1→2, then fork to 3a/3b, then 4a/4b
// Arrows: newer block → older block (prev hash)
function buildForkFlow(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const step = (e: Partial<Edge>) =>
    edges.push({ ...e, markerEnd: { type: MarkerType.ArrowClosed }, type: 'smoothstep' } as Edge)

  // Layer 1: common chain (0, 1, 2) left to right
  nodes.push({ id: '0', type: 'forkBlock', position: { x: 0, y: BRANCH_Y }, data: { label: '0', variant: 'common' }, sourcePosition: Position.Left, targetPosition: Position.Right })
  nodes.push({ id: '1', type: 'forkBlock', position: { x: COL, y: BRANCH_Y }, data: { label: '1', variant: 'common' }, sourcePosition: Position.Left, targetPosition: Position.Right })
  nodes.push({ id: '2', type: 'forkBlock', position: { x: 2 * COL, y: BRANCH_Y }, data: { label: '2', variant: 'common' }, sourcePosition: Position.Left, targetPosition: Position.Right })
  step({ id: 'e-1-0', source: '1', target: '0', sourceHandle: 'left', targetHandle: 'right' })
  step({ id: 'e-2-1', source: '2', target: '1', sourceHandle: 'left', targetHandle: 'right' })

  // Layer 2: fork (3a above, 3b below)
  nodes.push({ id: '3a', type: 'forkBlock', position: { x: 3 * COL, y: 0 }, data: { label: '3a', variant: 'branch-a' }, sourcePosition: Position.Left, targetPosition: Position.Right })
  nodes.push({ id: '3b', type: 'forkBlock', position: { x: 3 * COL, y: BRANCH_Y * 2 }, data: { label: '3b', variant: 'branch-b' }, sourcePosition: Position.Left, targetPosition: Position.Right })
  step({ id: 'e-3a-2', source: '3a', target: '2', sourceHandle: 'left', targetHandle: 'top' })
  step({ id: 'e-3b-2', source: '3b', target: '2', sourceHandle: 'left', targetHandle: 'bottom' })

  // Layer 3: branches extend
  nodes.push({ id: '4a', type: 'forkBlock', position: { x: 4 * COL, y: 0 }, data: { label: '4a', variant: 'branch-a' }, sourcePosition: Position.Left, targetPosition: Position.Right })
  nodes.push({ id: '4b', type: 'forkBlock', position: { x: 4 * COL, y: BRANCH_Y * 2 }, data: { label: '4b', variant: 'branch-b' }, sourcePosition: Position.Left, targetPosition: Position.Right })
  step({ id: 'e-4a-3a', source: '4a', target: '3a', sourceHandle: 'left', targetHandle: 'right' })
  step({ id: 'e-4b-3b', source: '4b', target: '3b', sourceHandle: 'left', targetHandle: 'right' })

  return { nodes, edges }
}

function ForkFlow() {
  const { nodes, edges } = buildForkFlow()
  const { fitView } = useReactFlow()

  useEffect(() => {
    fitView({ padding: 0.4, minZoom: 0.2, maxZoom: 1.5 })
  }, [fitView])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={() => {}}
      onEdgesChange={() => {}}
      nodeTypes={{ forkBlock: ForkBlockNode }}
      fitView
      fitViewOptions={{ padding: 0.4, minZoom: 0.2, maxZoom: 1.5 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      className="consensus-fork-flow"
    />
  )
}

export function ConsensusForkDemo() {
  return (
    <div className="consensus-fork-demo">
      <div className="consensus-fork-flow-wrap">
        <ReactFlowProvider>
          <ForkFlow />
        </ReactFlowProvider>
      </div>
      <p className="fork-caption">
        A chain forks when multiple valid blocks extend the same parent. Layer 1: common chain. Layer 2: split. Layer 3: branches extend.
      </p>
    </div>
  )
}
