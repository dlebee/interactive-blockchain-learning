import './NonceWhyDemo.css'

export function NonceWhyDemo() {
  return (
    <div className="nonce-why-demo">
      <div className="nonce-why-layout">
        <div className="nonce-why-user">
          <span className="nonce-why-label">You</span>
          <span className="nonce-why-hint">send tx A, B, C (no nonce)</span>
        </div>
        <div className="nonce-why-arrows">
          <span className="nonce-why-arrow">↗</span>
          <span className="nonce-why-arrow">→</span>
          <span className="nonce-why-arrow">↘</span>
        </div>
        <div className="nonce-why-nodes">
          <div className="nonce-why-node">
            <span className="nonce-why-node-label">Node 1</span>
            <span className="nonce-why-order">A → B → C</span>
            <span className="nonce-why-time">t: 10:00:01</span>
          </div>
          <div className="nonce-why-node">
            <span className="nonce-why-node-label">Node 2</span>
            <span className="nonce-why-order">C → A → B</span>
            <span className="nonce-why-time">t: 10:00:03</span>
          </div>
          <div className="nonce-why-node">
            <span className="nonce-why-node-label">Node 3</span>
            <span className="nonce-why-order">B → C → A</span>
            <span className="nonce-why-time">t: 10:00:02</span>
          </div>
        </div>
      </div>
      <p className="nonce-why-caption">
        Different clocks, different network paths. Nodes cannot agree on order. You provide the nonce.
      </p>
    </div>
  )
}
