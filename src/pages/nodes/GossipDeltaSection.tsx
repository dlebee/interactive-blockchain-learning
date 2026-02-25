import './GossipDeltaSection.css'

export function GossipDeltaSection() {
  return (
    <div className="gossip-delta-section">
      <div className="gossip-delta-diagram">
        <div className="delta-timeline">
          <div className="delta-label">t = 0</div>
          <div className="delta-node in">in-peer</div>
          <div className="delta-arrow">→</div>
          <div className="delta-node me">me</div>
          <div className="delta-arrow">→</div>
          <div className="delta-node out">out-peers</div>
        </div>
        <div className="delta-bar">
          <span className="delta-bar-label">Δ time</span>
          <div className="delta-bar-fill" />
        </div>
        <p className="delta-caption">
          Receive from in-peers, forward to out-peers until Δ has passed
        </p>
      </div>
    </div>
  )
}
