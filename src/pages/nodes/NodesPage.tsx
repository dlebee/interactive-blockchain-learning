import { Link } from 'react-router-dom'
import { NodesP2PDemo } from './NodesP2PDemo'
import { NodeMessageAuthDemo } from './NodeMessageAuthDemo'
import { NodesFullPictureDemo } from './NodesFullPictureDemo'

export function NodesPage() {
  return (
    <div className="page">
      <h1>Nodes: The Software Behind Operators</h1>
      <p className="lead">
        Operators are people. Nodes are the node software they run. This page walks
        through what nodes do, how they authenticate messages, and how they fit
        into the full picture.
      </p>

      <h2>P2P network: nodes and messages</h2>
      <p>
        Nodes connect to each other in a mesh. They keep a copy of the
        blockchain and gossip about transactions and blocks. Below, you see only
        the nodes and the messages flowing between them. No users, no blocks,
        just the P2P layer.
      </p>
      <NodesP2PDemo />

      <h2>How messages are authenticated</h2>
      <p>
        Nodes cannot trust messages from strangers. Like users signing
        transactions, nodes use asymmetric encryption to sign the messages they
        send. Other nodes verify those signatures before forwarding.
      </p>
      <NodeMessageAuthDemo />

      <h2>The full picture</h2>
      <p>
        All nodes keep a copy of the blockchain. Each maintains the canonical
        chain and gossips transactions and blocks with its peers. Below, you see
        many nodes, each with a copy of the chain underneath, exchanging
        messages.
      </p>
      <NodesFullPictureDemo />

      <h2>Why operators use node software</h2>
      <p>
        Operators running the chain themselves would be too slow. Voting on every
        transaction, computing balances, and keeping the ledger consistent would
        be impossible at scale: humans cannot do it as fast as computers. That is
        why operators run nodes. The node software gossips, proposes, and verifies.
        Users submit transactions and pay fees. The nodes do the rest.
      </p>

      <h2>What made it possible</h2>
      <p>
        Blockchains build on decades of progress: cryptography for secure
        signatures and hashing, a stable and widespread internet for P2P
        connectivity, and years of software engineering for distributed systems.
        Nodes are the backbone that ties all of this together.
      </p>

      <p className="page-next-link">
        <Link to="/nodes/gossip">Gossip (advanced)</Link>
        {' · '}
        <Link to="/consensus">Consensus</Link>
        {' · '}
        <Link to="/operators-users">Operators & Users</Link>
      </p>
    </div>
  )
}
