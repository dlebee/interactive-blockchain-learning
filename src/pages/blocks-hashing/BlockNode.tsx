import type { NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'

export type BlockNodeData = {
  blockId: number
  content: string
  prevHash: string
  hash: string
  invalid?: boolean
}

export function BlockNode(props: NodeProps) {
  const d = (props.data ?? {}) as BlockNodeData

  return (
    <>
      <Handle type="target" position={Position.Right} />
      <div className={`block-node ${d.invalid ? 'invalid' : ''}`}>
        <div className="block-node-header">Block {d.blockId}</div>
        <div className="block-node-field">
          <span className="block-node-label">Content</span>
          <span className="block-node-value">{d.content}</span>
        </div>
        <div className="block-node-field">
          <span className="block-node-label">Prev hash</span>
          <code className="block-node-hash">{d.prevHash}</code>
        </div>
        <div className="block-node-field digest">
          <span className="block-node-label">Digest</span>
          <code className="block-node-hash">{d.hash}</code>
        </div>
      </div>
      <Handle type="source" position={Position.Left} />
    </>
  )
}
