import { Link } from 'react-router-dom'
import { IncrementalMerkleTreeDemo } from './IncrementalMerkleTreeDemo'

export function IncrementalMerkleTreePage() {
  return (
    <div className="page">
      <h1 id="incremental-merkle-tree">
        <a href="#incremental-merkle-tree" className="anchor-link" aria-label="Link to this section">
          Incremental Merkle Tree
        </a>
      </h1>
      <p className="lead">
        An incremental Merkle tree is like a Merkle tree that is already filled with
        zeros. You add leaves into it over time, often maintained in a smart contract.
        If you keep historical roots on chain, users can submit Merkle proofs against an
        older root that is still valid, so multiple people can prove membership without
        everyone using the latest root.
      </p>

      <h2 id="how-it-works">
        <a href="#how-it-works" className="anchor-link" aria-label="Link to this section">
          How it works
        </a>
      </h2>
      <p>
        In a standard Merkle tree you have a fixed set of leaves (e.g. all transactions
        in a block). You hash them, pair and hash up to the root, and store or transmit
        the root. Proofs are paths from a leaf to the root.
      </p>
      <p>
        An incremental Merkle tree is like a tree that is <strong>pre-filled with zeros</strong>:
        the shape and "empty" slots are fixed (often as a constant zero or default hash).
        You only <strong>add leaves</strong> into it over time, and the tree is typically
        maintained in a <strong>smart contract</strong>: insert leaf, update root, and
        optionally store the new root. The implementation keeps only O(log n) state (e.g. a
        frontier along the right edge) so inserts and proofs stay efficient.
      </p>

      <h2 id="main-benefit">
        <a href="#main-benefit" className="anchor-link" aria-label="Link to this section">
          Main benefit: historical roots
        </a>
      </h2>
      <p>
        If you keep only the latest root, then every time someone adds a leaf the root
        changes. Users who obtained a Merkle proof earlier would have an "outdated" root
        and could be rejected. If you instead <strong>keep historical roots on chain</strong>,
        then proofs against any of those roots remain valid. So multiple people can
        submit Merkle proofs with an older root that is still accepted. That lets users
        prove membership at the time they committed, without requiring everyone to use the
        single latest root, which is important for privacy and UX (e.g. withdraw anytime).
      </p>

      <IncrementalMerkleTreeDemo />

      <h2 id="common-uses">
        <a href="#common-uses" className="anchor-link" aria-label="Link to this section">
          Common uses
        </a>
      </h2>
      <ul>
        <li>
          <strong>Zcash</strong>: The commitment tree for shielded transactions is an
          incremental Merkle tree. New commitments are appended; spend proofs show
          inclusion in the current root.
        </li>
        <li>
          <strong>Tornado Cash-style protocols</strong>: Deposits are inserted as leaves;
          a Merkle proof of membership is used when withdrawing, without revealing which
          deposit.
        </li>
        <li>
          <strong>Semaphore and similar</strong>: Group membership is represented as an
          IMT; members prove they are in the set with a Merkle proof (often combined with
          zero-knowledge proofs).
        </li>
        <li>
          <strong>Ethereum beacon chain</strong>: The list of validators is maintained as
          an incremental Merkle tree; proofs of validator set membership use this structure.
        </li>
      </ul>

      <h2 id="implementations">
        <a href="#implementations" className="anchor-link" aria-label="Link to this section">
          Implementations and further reading
        </a>
      </h2>
      <ul>
        <li>
          <a href="https://github.com/zcash/incrementalmerkletree" target="_blank" rel="noopener noreferrer">
            Zcash incremental Merkle tree
          </a>
          {' '}
          (Rust): Reference implementation with fast-forwarding witnesses.
        </li>
        <li>
          <a href="https://www.npmjs.com/package/@zk-kit/incremental-merkle-tree.sol" target="_blank" rel="noopener noreferrer">
            @zk-kit/incremental-merkle-tree.sol
          </a>
          {' '}
          (Solidity): On-chain IMT with insert, update, remove, and verify; used in
          Semaphore and similar apps.
        </li>
      </ul>

      <p className="page-next-link">
        <Link to="/advanced-topics/merkle-trees">Merkle Trees</Link>
        {' · '}
        <Link to="/advanced-topics">Advanced Topics</Link>
      </p>
    </div>
  )
}
