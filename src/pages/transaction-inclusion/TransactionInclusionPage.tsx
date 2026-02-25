import { Link } from 'react-router-dom'
import { FeeModelDemo } from './FeeModelDemo'
import { CutTheLineDemo } from './CutTheLineDemo'

export function TransactionInclusionPage() {
  return (
    <div className="page">
      <h1>Transaction Inclusion</h1>
      <p className="lead">
        How does your transaction get into a block? Chains use different
        mechanisms. Some require a fixed fee; others use competitive fees. That
        choice affects how long you wait.
      </p>

      <h2 id="blockspace-link">
        <a href="#blockspace-link" className="anchor-link" aria-label="Link to this section">
          Relationship to blockspace
        </a>
      </h2>
      <p>
        Because blocks are <Link to="/blockspace">capped for liveness</Link>,
        only a limited number of transactions fit in each block. As more people
        submit transactions, the mempool fills up. When there are more pending
        transactions than can fit in a single block, some must wait for the next
        block, or the next few. That is where the rules for including
        transactions and the role of fees start to matter, and they differ a lot
        from one chain to another.
      </p>
      <p>
        Because nodes are incentivized by rewards, including your transaction is
        not guaranteed. As a user, you compete with others to have your
        transaction included in the next block, or one of the next few.
      </p>
      <figure className="page-figure">
        <blockquote>
          Think of it like trying to get an Uber after a concert with 25,000
          attendees. If you leave early and skip the encore, you may pay less for
          your ride. But if you wait and try to get an Uber at the same time as
          everyone else, the price surges and you need to wait longer.
          Similarly, in blockchain, if many users submit transactions at once,
          it becomes a competition. You can bid a higher fee to prioritize your
          transaction for faster inclusion in the next block(s).
        </blockquote>
      </figure>
      <p>
        If you bid too low, your transaction may stay in the pending queue for a
        long time, or it may eventually be dropped from the mempool altogether.
      </p>
      <CutTheLineDemo />

      <h2 id="fixed-vs-competitive">
        <a href="#fixed-vs-competitive" className="anchor-link" aria-label="Link to this section">
          Fixed vs competitive fees
        </a>
      </h2>
      <p>
        Some blockchains charge a <strong>fixed fee</strong> per transaction.
        You pay a set amount, and your transaction is included when there is
        space. Wait times depend on block capacity and demand, but you do not
        bid against others.
      </p>
      <p>
        Others use <strong>competitive fees</strong>. Block authors (miners or
        validators) choose which transactions to include, often prioritizing
        higher fees. You are effectively bidding for inclusion. When demand is
        high, you may need to pay more to get confirmed quickly. When it is low,
        fees can drop.
      </p>
      <p>
        Some chains use a <strong>mix</strong>: a base fee adjusted by the
        protocol, plus a competitive tip. You compete on the tip while the base
        tracks network demand.
      </p>
      <FeeModelDemo />

      <h2 id="wait-times">
        <a href="#wait-times" className="anchor-link" aria-label="Link to this section">
          Impact on wait times
        </a>
      </h2>
      <p>
        The fee mechanism directly impacts how long your transaction waits to be
        included. With fixed fees, you typically wait your turn. With
        competitive fees, paying more can move you up the queue. Understanding
        how your chain handles fees helps you set expectations and, when
        possible, choose the right fee for your needs.
      </p>

      <h2 id="more-to-come">
        <a href="#more-to-come" className="anchor-link" aria-label="Link to this section">
          More to come
        </a>
      </h2>
      <p>
        Transaction inclusion gets more involved: nonces for ordering,
        replacing or cancelling stuck transactions, and how mempools work. We
        cover these in sub sections.
      </p>

      <h2 id="decentralization-competition">
        <a href="#decentralization-competition" className="anchor-link" aria-label="Link to this section">
          Decentralization and competition
        </a>
      </h2>
      <p>
        The more decentralized and permissionless a chain is, the more it tends
        to rely on <strong>competition for inclusion</strong>. Blockspace gets
        scarcer, and inclusion becomes costly. Blockchains cannot simply add more
        blockspace because they prioritize security: unbounded blocks risk
        slower propagation, heavier validation, and weaker consensus guarantees.
      </p>

      <p className="page-next-link">
        <Link to="/transaction-inclusion/nonce">Nonce</Link>
        {' · '}
        <Link to="/transaction-inclusion/replacing">Replacing / cancelling</Link>
      </p>
      <p className="page-next-link">
        <Link to="/blockspace">Blockspace</Link>
        {' · '}
        <Link to="/transactions">Transactions</Link>
      </p>
    </div>
  )
}
