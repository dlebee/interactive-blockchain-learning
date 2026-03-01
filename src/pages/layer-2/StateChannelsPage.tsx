import { Link } from 'react-router-dom'
import { StateChannelDemo } from './StateChannelDemo'

export function StateChannelsPage() {
  return (
    <div className="page">
      <h1>State Channels</h1>
      <p className="lead">
        Two parties can exchange thousands of signed state updates off-chain, then settle the final
        result with only two on-chain transactions: one to open the channel, one to close it.
      </p>

      <h2 id="opening">
        <a href="#opening" className="anchor-link" aria-label="Link to this section">
          Opening a channel
        </a>
      </h2>
      <p>
        To open a channel, both parties submit an on-chain transaction that locks their funds into
        a shared contract. This is the <strong>funding transaction</strong>. From this point, the
        blockchain holds the funds as collateral, but the parties interact directly with each
        other, not through the chain.
      </p>

      <h2 id="off-chain">
        <a href="#off-chain" className="anchor-link" aria-label="Link to this section">
          Off-chain payments
        </a>
      </h2>
      <p>
        Each payment is a signed message: a new state update reflecting who owns what. Both parties
        sign each update. The latest co-signed state is always the valid one; older states are
        superseded and can be rejected. None of these messages touch the chain; they are instant
        and cost nothing to exchange.
      </p>
      <p>
        The parties don't need a miner, validator, or any third party to process their payments.
        They only need each other, and the chain as a backstop if something goes wrong.
      </p>

      <StateChannelDemo />

      <h2 id="closing">
        <a href="#closing" className="anchor-link" aria-label="Link to this section">
          Closing a channel
        </a>
      </h2>
      <p>
        Either party can submit the latest co-signed state to the chain at any time to close the
        channel cooperatively. The contract verifies the signatures and distributes the locked funds
        according to the final balances. This is the second and last on-chain transaction.
      </p>

      <h2 id="disputes">
        <a href="#disputes" className="anchor-link" aria-label="Link to this section">
          Dispute resolution
        </a>
      </h2>
      <p>
        If one party goes offline or tries to close the channel using an outdated state (to reclaim
        funds they already spent), the other party has a <strong>challenge period</strong> to
        submit a newer co-signed state as evidence. The contract accepts the most recent valid state
        and penalizes the dishonest party.
      </p>
      <p>
        This means both parties must remain able to respond within the challenge window. If you go
        offline for too long, a dishonest counterparty could finalize an old state unchallenged.
      </p>

      <h2 id="limitations">
        <a href="#limitations" className="anchor-link" aria-label="Link to this section">
          Limitations
        </a>
      </h2>
      <p>
        State channels excel at repeated bilateral interactions, like a streaming payment between
        two known parties. They are not well suited for:
      </p>
      <ul>
        <li>Open-ended interactions with unknown or many counterparties</li>
        <li>Applications requiring global shared state, such as a public marketplace</li>
        <li>Users who need to go offline for extended periods</li>
      </ul>
      <p>
        For general-purpose scaling, where any user can interact with any contract,{' '}
        <Link to="/layer-2/rollups">rollups</Link> are the more practical solution.
      </p>

      <p className="page-next-link">
        <Link to="/layer-2">Back to Layer 2 Scaling</Link>
        {' · '}
        <Link to="/layer-2/rollups">Rollups</Link>
      </p>
    </div>
  )
}
