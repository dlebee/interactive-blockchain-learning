import { Link } from 'react-router-dom'
import { GossipInOutDemo } from './GossipInOutDemo'
import { GossipDeltaSection } from './GossipDeltaSection'
import { GossipUnconnectedDemo } from './GossipUnconnectedDemo'

export function NodesGossipPage() {
  return (
    <div className="page">
      <h1 id="gossip">
        <a href="#gossip" className="anchor-link" aria-label="Link to this section">
          Gossip
        </a>
      </h1>
      <p className="lead">
        How messages travel the P2P network: in-peers and out-peers, network
        delay (delta), and delivery between nodes that are not directly connected.
      </p>

      <h2 id="in-peers-and-out-peers">
        <a href="#in-peers-and-out-peers" className="anchor-link" aria-label="Link to this section">
          In-peers and out-peers
        </a>
      </h2>
      <p>
        In a realistic P2P graph, each node has two kinds of neighbors. Its{" "}
        <strong>in-peers</strong> are the nodes that send messages to it. Its{" "}
        <strong>out-peers</strong> are the nodes it sends messages to. An arrow
        from A to B means A sends to B: B has A as an in-peer, and A has B as an
        out-peer.
      </p>
      <GossipInOutDemo />

      <h2 id="network-delay-delta">
        <a href="#network-delay-delta" className="anchor-link" aria-label="Link to this section">
          Network delay (delta)
        </a>
      </h2>
      <p>
        There is a typical network delay, often called{" "}
        <strong>delta</strong> (Δ). Nodes assume they must gossip each message
        for roughly a delta of network latency. In practice: a node receives
        messages from its in-peers and forwards them to its out-peers. It keeps
        doing this until the delta has passed, then it stops gossiping that
        message.
      </p>
      <GossipDeltaSection />

      <h2 id="unconnected-nodes">
        <a href="#unconnected-nodes" className="anchor-link" aria-label="Link to this section">
          Message delivery between unconnected nodes
        </a>
      </h2>
      <GossipUnconnectedDemo />

      <h2 id="discovery">
        <a href="#discovery" className="anchor-link" aria-label="Link to this section">
          Discovery
        </a>
      </h2>
      <p>
        Typical discovery such as{" "}
        <a
          href="https://docs.libp2p.io/concepts/discovery-routing/kaddht/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Kademlia DHT
        </a>{" "}
        is optimized for reliability of the P2P gossip mesh, not for direct
        delivery. Gossiping to all nodes can create too much traffic. For
        specific operations, some protocols build custom discovery on top of
        Kademlia DHT to find a specific node and send a message directly without
        hops. An example is{" "}
        <a
          href="https://paritytech.github.io/polkadot-sdk/master/sc_authority_discovery/index.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          authority discovery
        </a>{" "}
        (Substrate). This comes with its own risks: discoverable nodes become
        targets of denial of service. Sometimes the trade off is necessary.
      </p>

      <p className="page-next-link">
        <Link to="/nodes">Back to Nodes</Link>
      </p>
    </div>
  )
}
