import type { NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'

export type BlockNodeEditableData = {
  blockId: number
  content: string
  prevHash: string
  hash: string
  invalid?: boolean
  variant?: 'original' | 'tampered' | 'shared'
  onContentChange?: (content: string) => void
  /** When true, adds a source handle on the right for fork connections */
  connectOnRight?: boolean
  /** When true, adds a target handle on the left for receiving from shared block */
  targetOnLeft?: boolean
}

export function BlockNodeEditable(props: NodeProps) {
  const d = (props.data ?? {}) as BlockNodeEditableData
  const isEditable = d.variant === 'tampered' && d.onContentChange

  return (
    <>
      <Handle type="target" position={Position.Right} />
      {d.targetOnLeft && (
        <Handle type="target" position={Position.Left} id="left" />
      )}
      <div
        className={`block-node editable ${d.invalid ? 'invalid' : ''} variant-${d.variant ?? 'default'}`}
      >
        <div className="block-node-header">Block {d.blockId}</div>
        <div className="block-node-field">
          <span className="block-node-label">Content</span>
          {isEditable ? (
            <input
              type="text"
              className="block-node-input nodrag"
              value={d.content}
              onChange={(e) => d.onContentChange?.(e.target.value)}
            />
          ) : (
            <span className="block-node-value">{d.content}</span>
          )}
        </div>
        <div className="block-node-field digest">
          <span className="block-node-label">Digest</span>
          <code className="block-node-hash">{d.hash}</code>
        </div>
      </div>
      <Handle type="source" position={Position.Left} />
      {d.connectOnRight && (
        <Handle type="source" position={Position.Right} id="right" />
      )}
    </>
  )
}
