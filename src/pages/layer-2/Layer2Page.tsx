import { Link } from 'react-router-dom'

export function Layer2Page() {
  return (
    <div className="page">
      <h1>Layer 2 Scaling</h1>
      <p className="lead">
        Layer 1 blockchains are intentionally slow. They cap throughput to keep every node in
        sync and preserve decentralization. Layer 2 solutions run on top, processing transactions
        off-chain and anchoring trust back to the base chain.
      </p>

      <h2 id="the-scaling-problem">
        <a href="#the-scaling-problem" className="anchor-link" aria-label="Link to this section">
          The scaling problem
        </a>
      </h2>
      <p>
        Every node on a blockchain processes every transaction. This is what makes it trustless:
        you don't have to trust any single operator because you can verify the chain yourself. But
        it also means throughput is bounded by what the slowest full node can handle.
      </p>
      <p>
        <Link to="/blockspace">Blockspace</Link> is capped to keep block production predictable.
        When demand exceeds capacity, fees rise and transactions queue up. You can't simply raise
        the block limit without making it harder to run a node, which weakens decentralization.
      </p>

      <h2 id="the-trilemma">
        <a href="#the-trilemma" className="anchor-link" aria-label="Link to this section">
          The trilemma
        </a>
      </h2>
      <p>
        Blockchains face a tradeoff between three properties:{' '}
        <strong>decentralization</strong>, <strong>security</strong>, and{' '}
        <strong>scalability</strong>. Optimizing for any two typically degrades the third. A
        network with very high throughput either relies on powerful hardware (centralizing who
        can run a node) or weakens its security guarantees.
      </p>
      <p>
        Layer 2 approaches this differently: offload execution to a separate system, but inherit
        the security of Layer 1 for the final settlement. The L2 can be faster and cheaper because
        it doesn't require global consensus for every transaction; only the final result needs to
        be verifiable on-chain.
      </p>

      <h2 id="approaches">
        <a href="#approaches" className="anchor-link" aria-label="Link to this section">
          Two main approaches
        </a>
      </h2>
      <p>There are two broad families of Layer 2 solutions:</p>
      <ul>
        <li>
          <Link to="/layer-2/state-channels">State Channels</Link>: two or more parties lock
          funds on-chain, then exchange signed state updates directly off-chain. Only the opening
          and closing transactions touch the base chain.
        </li>
        <li>
          <Link to="/layer-2/rollups">Rollups</Link>: a sequencer batches many transactions,
          posts compressed data to L1, and includes a proof that the state transition was valid.
          Suitable for general-purpose applications with many users.
        </li>
      </ul>

      <p className="page-next-link">
        <Link to="/layer-2/state-channels">State Channels</Link>
        {' · '}
        <Link to="/layer-2/rollups">Rollups</Link>
        {' · '}
        <Link to="/blockspace">Blockspace</Link>
      </p>
    </div>
  )
}
