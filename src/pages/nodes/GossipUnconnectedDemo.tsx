import './GossipUnconnectedDemo.css'

export function GossipUnconnectedDemo() {
  return (
    <div className="gossip-unconnected-demo">
      <div className="unconnected-principle">
        All messages in a P2P network are authenticated. Every message is signed
        by its sender, so receivers can verify who sent it.
      </div>

      <div className="unconnected-problem">
        <h4>A sends to C but is not connected</h4>
        <div className="problem-diagram">
          <span className="node-badge">A</span>
          <span className="node-link">→</span>
          <span className="node-ellipsis">N .. nodes</span>
          <span className="node-link">→</span>
          <span className="node-badge">C</span>
          <span className="gap">(A no link to C)</span>
        </div>
      </div>

      <div className="unconnected-wrap">
        <h4>Wrap signing: A → B → C</h4>
        <p>
          In this simplified case, A is connected to C via B, but A is not aware
          of that path. The delivery happens like so:
        </p>
        <p>
          A creates a message: delivery to B, inner (content for C, pubkey_A,
          sig_A), and sig_A authenticates the message. B receives it, then
          creates a new message: delivery to C, inner unchanged (content for C,
          pubkey_A, sig_A), and sig_B authenticates. The inner stays the same;
          each hop adds an outer signature as part of its message.
        </p>
        <div className="wrap-flow">
          <div className="wrap-block">
            <span className="wrap-block-title">A → B</span>
            <div className="wrap-outer wrap-from-a">
              <span className="wrap-label">message</span>
              <span className="wrap-delivery">delivery to B</span>
              <div className="wrap-inner">
                <span className="wrap-inner-label">inner (unchanged)</span>
                <div className="wrap-message-content">
                  <span>content for C</span>
                  <span className="wrap-pubkey">pubkey_A</span>
                  <span className="wrap-sig">sig_A</span>
                </div>
              </div>
              <span className="wrap-outer-sig">sig_A</span>
            </div>
          </div>
          <span className="wrap-flow-arrow">→</span>
          <div className="wrap-block">
            <span className="wrap-block-title">B → C</span>
            <div className="wrap-outer wrap-from-b">
              <span className="wrap-label">message</span>
              <span className="wrap-delivery">delivery to C</span>
              <div className="wrap-inner">
                <span className="wrap-inner-label">inner (unchanged)</span>
                <div className="wrap-message-content">
                  <span>content for C</span>
                  <span className="wrap-pubkey">pubkey_A</span>
                  <span className="wrap-sig">sig_A</span>
                </div>
              </div>
              <span className="wrap-outer-sig">sig_B</span>
            </div>
          </div>
        </div>

        <div className="unconnected-caveat">
          <p>
            We oversimplify here by showing A → B → C. In practice there may be
            many more hops, and no node knows a direct path to the final peer. The
            message is gossiped to everyone for delta time. It is assumed it will
            eventually reach the destination by spreading through the network.
          </p>
        </div>
      </div>
    </div>
  )
}
