import type { NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'

export type ForkBlockNodeData = {
  label: string
  variant?: 'common' | 'branch-a' | 'branch-b'
}

export function ForkBlockNode(props: NodeProps) {
  const d = (props.data ?? {}) as ForkBlockNodeData
  const variant = d.variant ?? 'common'

  return (
    <>
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <div className={`fork-block-node fork-block-node-${variant}`}>
        {d.label}
      </div>
    </>
  )
}
