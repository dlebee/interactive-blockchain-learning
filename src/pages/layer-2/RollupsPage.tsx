import { Link } from 'react-router-dom'
import { RollupsDemo } from './RollupsDemo'

export function RollupsPage() {
  return (
    <div className="page">
      <h1>Rollups</h1>
      <p className="lead">
        A rollup executes transactions off-chain in bulk, then posts compressed data and a
        correctness proof to Layer 1. One on-chain post covers thousands of transactions.
      </p>

      <h2 id="core-idea">
        <a href="#core-idea" className="anchor-link" aria-label="Link to this section">
          The core idea
        </a>
      </h2>
      <p>
        On a plain Layer 1, every node re-executes every transaction. Rollups flip this: a{' '}
        <strong>sequencer</strong> batches many transactions and executes them off-chain. It then
        posts to L1 only what's needed to verify the result:
      </p>
      <ul>
        <li>Compressed transaction data, so anyone can reconstruct the L2 state independently</li>
        <li>The new state root (a hash representing all account balances after the batch)</li>
        <li>A proof that the state transition from old root to new root was correct</li>
      </ul>
      <p>
        The L1 doesn't re-execute the transactions. It only verifies the proof and stores the
        data. This is dramatically cheaper per transaction than running everything on L1.
      </p>

      <RollupsDemo />

      <h2 id="optimistic">
        <a href="#optimistic" className="anchor-link" aria-label="Link to this section">
          Optimistic rollups
        </a>
      </h2>
      <p>
        Optimistic rollups assume every batch is valid and don't require an upfront proof. Instead,
        they open a <strong>challenge window</strong> (typically seven days) during which anyone
        watching the chain can submit a <strong>fraud proof</strong> if they detect an invalid
        state transition.
      </p>
      <p>
        If no fraud proof is submitted within the window, the batch is finalized. If a valid fraud
        proof is accepted, the invalid batch is reverted and the sequencer is penalized. The system
        relies on at least one honest party monitoring the chain.
      </p>
      <p>
        The tradeoff: batches are cheap to produce, but users must wait for the challenge period to
        expire before they can withdraw funds to L1. Liquidity providers often abstract this away
        by advancing funds immediately and collecting the bridged funds later.
      </p>

      <h2 id="zk">
        <a href="#zk" className="anchor-link" aria-label="Link to this section">
          ZK rollups
        </a>
      </h2>
      <p>
        ZK rollups generate a cryptographic <strong>validity proof</strong> alongside every batch.
        The L1 verifies this proof, which takes milliseconds, and rejects any batch where the
        proof fails. There is no challenge window: if the proof verifies, the state transition
        is guaranteed correct.
      </p>
      <p>
        Because correctness is proved upfront, withdrawals can be finalized as soon as the proof
        is verified on L1, often within minutes. The tradeoff: generating a validity proof is
        computationally expensive, which increases the hardware requirements for sequencers and
        can create centralization pressure.
      </p>

      <h2 id="comparison">
        <a href="#comparison" className="anchor-link" aria-label="Link to this section">
          Comparison
        </a>
      </h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Optimistic rollup</th>
            <th>ZK rollup</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Withdrawal finality</td>
            <td>~7 days (challenge window)</td>
            <td>Minutes (after proof verification)</td>
          </tr>
          <tr>
            <td>Security model</td>
            <td>Fraud proofs (requires at least one honest watcher)</td>
            <td>Validity proofs (cryptographic guarantee)</td>
          </tr>
          <tr>
            <td>Sequencer compute</td>
            <td>Low</td>
            <td>High (proof generation)</td>
          </tr>
          <tr>
            <td>EVM compatibility</td>
            <td>Easier (run the EVM directly)</td>
            <td>Harder (must prove EVM execution in a circuit)</td>
          </tr>
        </tbody>
      </table>

      <p className="page-next-link">
        <Link to="/layer-2">Back to Layer 2 Scaling</Link>
        {' · '}
        <Link to="/layer-2/state-channels">State Channels</Link>
      </p>
    </div>
  )
}
