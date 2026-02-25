import { Link } from 'react-router-dom'
import { ConsensusSlotDemo } from './ConsensusSlotDemo'
import { ConsensusWhoDemo } from './ConsensusWhoDemo'
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

      <h2 id="more-to-come">
        <a href="#more-to-come" className="anchor-link" aria-label="Link to this section">
          More to come
        </a>
      </h2>
      <p>
        Consensus is a deep topic. This page introduced slots, block time, and
        the distinction between leaderless and leader based designs. Sub sections
        will cover specific mechanisms in more detail.
      </p>

      <p className="page-next-link">
        <Link to="/nodes">Nodes</Link>
        {' · '}
        <Link to="/operators-users">Operators & Users</Link>
      </p>
    </div>
  )
}
