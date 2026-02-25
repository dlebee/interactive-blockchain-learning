import { Link } from 'react-router-dom'
import { NonceDemo } from './NonceDemo'
import { NonceWhyDemo } from './NonceWhyDemo'
import { SkippedNonceDemo } from './SkippedNonceDemo'

export function TransactionInclusionNoncePage() {
  return (
    <div className="page">
      <h1>Nonce</h1>
      <p className="lead">
        A nonce is an ordered number for each account. Each transaction gets the
        next nonce (0, 1, 2, 3, …), and transactions must be sent in order.
      </p>

      <h2 id="why-nonce">
        <a href="#why-nonce" className="anchor-link" aria-label="Link to this section">
          Why the nonce is required
        </a>
      </h2>
      <p>
        Imagine you send several transactions from the same account to different
        nodes across the network. Without a nonce, nodes cannot agree on which
        transaction came first. Why? Time is not deterministic: every computer
        has its own clock, and network delays vary. Nodes receive your
        transactions in different orders. They cannot agree on a global ordering
        based on arrival time or a shared counter they do not have.
      </p>
      <p>
        The solution: let the <strong>user</strong> keep the counter. You assign
        a nonce to each transaction. The protocol enforces that transactions
        are processed in nonce order. This also ensures you stay in control of
        which transaction gets included first.
      </p>
      <NonceWhyDemo />

      <h2 id="queue-behavior">
        <a href="#queue-behavior" className="anchor-link" aria-label="Link to this section">
          How the queue behaves
        </a>
      </h2>
      <p>
        When your transaction arrives at a node, the node checks: is this the
        correct next nonce for your account? If yes, it goes into the mempool
        and can be picked for inclusion in a block. If not (for example, you
        sent nonce 5 before nonce 4), it goes into the future queue, where it
        waits until the missing earlier nonces are submitted and confirmed.
      </p>
      <NonceDemo />

      <h2 id="stuck-queue">
        <a href="#stuck-queue" className="anchor-link" aria-label="Link to this section">
          Stuck nonce queue
        </a>
      </h2>
      <p>
        If you skip a nonce and never submit it, all later transactions get
        stuck in the future queue. Suppose you have confirmed nonces 0, 1, 2,
        but you never send nonce 3. If you then submit transactions with nonce
        4, 5, 6, they will sit in the future queue indefinitely until you
        submit nonce 3.
      </p>
      <SkippedNonceDemo />

      <h2 id="queue-limits">
        <a href="#queue-limits" className="anchor-link" aria-label="Link to this section">
          Queue limits and eviction
        </a>
      </h2>
      <p>
        Chains typically do not allow unlimited transactions in the mempool or
        future queue. They enforce <strong>per account limits</strong> (for
        example, how many pending transactions one account can have) and
        <strong> global queue limits</strong>. When limits are reached, nodes
        evict transactions, often dropping the oldest or lowest fee first.
      </p>
      <p>
        Some chains use <strong>mortality</strong>: a transaction can only
        remain in the mempool or future queue for a predictable amount of time
        (for example, a block range). After that, it expires and must be
        resubmitted. Polkadot uses this for its extrinsics; see{' '}
        <a
          href="https://wiki.polkadot.network/learn/learn-transactions/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mortal and Immortal Extrinsics
        </a>
        {' '}
        in the Polkadot wiki.
      </p>

      <p className="page-next-link">
        <Link to="/transaction-inclusion">Back to Transaction Inclusion</Link>
        {' · '}
        <Link to="/transaction-inclusion/replacing">Replacing / cancelling</Link>
      </p>
    </div>
  )
}
