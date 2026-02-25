import { Link } from 'react-router-dom'
import { ConsensusSlotDemo } from './ConsensusSlotDemo'
import { ConsensusWhoDemo } from './ConsensusWhoDemo'
import { ConsensusVerifyDemo } from './ConsensusVerifyDemo'
import { ConsensusForkDemo } from './ConsensusForkDemo'
import { ConsensusLongestChainDemo } from './ConsensusLongestChainDemo'

export function ConsensusPage() {
  return (
    <div className="page">
      <h1>Consensus</h1>
      <p className="lead">
        How do nodes agree on which blocks belong to the chain? Consensus is the
        process. Blockchains make block production happen in a predictable
        amount of time, often called a slot.
      </p>

      <h2 id="slot-and-block-time">
        <a href="#slot-and-block-time" className="anchor-link" aria-label="Link to this section">
          Slot and block time
        </a>
      </h2>
      <p>
        Protocols typically define a <strong>block time</strong>: how often a
        new block can be produced. Block time can be very predictable (e.g. one
        block every six seconds, fixed) or probabilistically within an
        acceptable range (e.g. expected every ten minutes, but varies). In either
        case, the idea is the same: nodes coordinate around a shared notion of
        time, often modeled as a sequence of <strong>slots</strong>. Each slot
        is a window in which a block may be produced.
      </p>
      <ConsensusSlotDemo />

      <h2 id="who-creates-the-block">
        <a href="#who-creates-the-block" className="anchor-link" aria-label="Link to this section">
          Who creates the block
        </a>
      </h2>
      <p>
        Who produces the block in a given slot differs from one consensus to
        another. Some are <strong>leaderless</strong>: any node may attempt to
        produce a block, and the protocol defines how the network converges on
        one. Others use <strong>leader election</strong>: a subset of nodes is
        chosen (by stake, round robin, or another rule), and the designated
        leader proposes the block for that slot. We will expand on different
        forms of consensus in later sections.
      </p>
      <ConsensusWhoDemo />

      <h2 id="all-nodes-verify">
        <a href="#all-nodes-verify" className="anchor-link" aria-label="Link to this section">
          All nodes verify and agree
        </a>
      </h2>
      <p>
        In all consensus mechanisms, whether PoW, PoS, NPoS, or others, every node has the same
        job when a block is proposed: execute all transactions in the block and verify the
        block hash. Nodes that do not author blocks still receive proposed blocks, execute the
        transactions themselves, and must come to agreement with the author&apos;s claimed hash.
        If the computed hash matches, the block is accepted; if not, it is rejected.
      </p>
      <ConsensusVerifyDemo />

      <h2 id="forks">
        <a href="#forks" className="anchor-link" aria-label="Link to this section">
          Forks
        </a>
      </h2>
      <p>
        A <strong>fork</strong> occurs when there are disagreements between nodes, or when multiple
        valid extensions of the chain exist. For example, two different blocks might both extend
        the same parent block. Nodes may see or build on different branches until the protocol
        converges on one (e.g. via the longest chain rule).
      </p>
      <ConsensusForkDemo />

      <h2 id="longest-chain-rule">
        <a href="#longest-chain-rule" className="anchor-link" aria-label="Link to this section">
          Longest chain rule
        </a>
      </h2>
      <p>
        How do nodes choose the canonical chain? Many protocols use the{" "}
        <strong>longest chain rule</strong>: the chain with the most blocks
        wins. This right away suggests that racing can be problematic. If
        everyone builds at different speeds, forks and reorganizations become
        likely. Different consensus mechanisms deal with this differently. We
        will expand on that in later sections.
      </p>
      <ConsensusLongestChainDemo />

      <h2 id="consensus-mechanisms">
        <a href="#consensus-mechanisms" className="anchor-link" aria-label="Link to this section">
          Consensus mechanisms
        </a>
      </h2>
      <p>
        Consensus is a deep topic. This page introduced slots, block time, the
        distinction between leaderless and leader based designs, and the fact that
        all nodes verify blocks regardless of who authors them. Sub pages cover
        specific mechanisms (PoW, PoS, NPoS, etc.) in more detail.
      </p>
      <ul>
        <li><Link to="/consensus/proof-of-work">Proof of Work</Link></li>
      </ul>

      <p className="page-next-link">
        <Link to="/consensus/proof-of-work">Proof of Work</Link>
        {' · '}
        <Link to="/nodes">Nodes</Link>
        {' · '}
        <Link to="/blockspace">Blockspace</Link>
      </p>
    </div>
  )
}
