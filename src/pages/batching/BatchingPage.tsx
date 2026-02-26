import { Link } from 'react-router-dom'

export function BatchingPage() {
  return (
    <div className="page">
      <h1 id="batching">
        <a href="#batching" className="anchor-link" aria-label="Link to this section">
          Batching
        </a>
      </h1>
      <p className="lead">
        Batching means grouping many operations and handling them together instead of
        one by one. In blockchains and layer 2s, batching is used to amortize cost,
        cut per item overhead, and scale verification so the system can process more
        with less on chain work.
      </p>
      <p>
        Batching is the ability to <strong>submit more information in one go</strong>.
        It does not by itself mean that the batched data is verified, replay safe, or
        authoritative. Ensuring that batched items are actually checked, protected
        against replay, and correctly applied takes more care and often mixes in other
        advanced topics (e.g. commitments, proofs, ordering, and access control).
      </p>

      <h2 id="how-it-works">
        <a href="#how-it-works" className="anchor-link" aria-label="Link to this section">
          How it works
        </a>
      </h2>
      <p>
        Instead of submitting or verifying each item separately, you <strong>batch</strong> them:
        collect a set of items (transactions, state updates, proofs, or signatures) and
        submit or verify them in one go. The fixed cost (e.g. one transaction fee, one
        block slot, one verification call) is shared across the batch, so the cost per
        item goes down as the batch size grows.
      </p>
      <p>
        Batching can happen at different layers: many user actions can be batched into
        a single rollup block, many rollup blocks or state roots can be batched into a
        single submission to the base chain, and many signatures or zero knowledge
        proofs can be verified in one batch to save gas or computation.
      </p>

      <h2 id="why-it-matters">
        <a href="#why-it-matters" className="anchor-link" aria-label="Link to this section">
          Why it matters
        </a>
      </h2>
      <p>
        Base layer block space is scarce and expensive. If every small action required
        its own on chain transaction, throughput would be limited and fees would stay
        high. Batching lets systems do more off chain or in a side chain, then settle
        in bulk on chain. That improves throughput and lowers effective cost per user
        action. Batch verification (e.g. checking many signatures or proofs in one
        operation) also reduces verification cost and helps scaling.
      </p>

      <h2 id="where-you-see-it">
        <a href="#where-you-see-it" className="anchor-link" aria-label="Link to this section">
          Where you see it
        </a>
      </h2>
      <ul>
        <li>
          <strong>Rollups</strong>: Many layer 2 transactions are executed off chain,
          then a single batch (or a compressed summary) is posted to the base chain. One
          L1 transaction can represent hundreds or thousands of L2 transactions.
        </li>
        <li>
          <strong>Optimistic rollups</strong>: State roots or transaction data are
          submitted in batches; fraud proofs or dispute resolution apply to the batch
          or a part of it.
        </li>
        <li>
          <strong>ZK rollups</strong>: A single zero knowledge proof often attests to
          the correct execution of a batch of transactions. The verifier checks one
          proof instead of re running every transaction.
        </li>
        <li>
          <strong>Signature and proof verification</strong>: Protocols may verify many
          signatures or many ZK proofs in one batch to reduce gas and computation
          (e.g. BLS signature aggregation, batch proof verification).
        </li>
        <li>
          <strong>Account abstraction and paymasters</strong>: User operations can be
          batched so one transaction pays for or executes many operations, improving
          UX and cost.
        </li>
      </ul>

      <h2 id="basic-batching">
        <a href="#basic-batching" className="anchor-link" aria-label="Link to this section">
          Basic batching
        </a>
      </h2>
      <p>
        The simplest form of batching is when the only gain is amortizing the{" "}
        <strong>base cost of the transaction</strong> across many items: one
        transaction carries multiple items, so you pay the fixed per transaction
        overhead once instead of once per item.{" "}
        <Link to="/advanced-topics/batching/basic">Basic batching</Link> goes into
        this case in more detail.
      </p>

      <p className="page-next-link">
        <Link to="/advanced-topics">Advanced Topics</Link>
        {' · '}
        <Link to="/advanced-topics/batching/basic">Basic Batching</Link>
        {' · '}
        <Link to="/advanced-topics/merkle-trees">Merkle Trees</Link>
        {' · '}
        <Link to="/advanced-topics/incremental-merkle-tree">Incremental Merkle Tree</Link>
      </p>
    </div>
  )
}
