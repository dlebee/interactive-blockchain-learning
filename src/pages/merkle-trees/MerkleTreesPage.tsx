import { Link } from 'react-router-dom'
import { MerkleTreeDemo } from './MerkleTreeDemo'

export function MerkleTreesPage() {
  return (
    <div className="page">
      <h1 id="merkle-trees">
        <a href="#merkle-trees" className="anchor-link" aria-label="Link to this section">
          Merkle Trees
        </a>
      </h1>
      <p className="lead">
        A Merkle tree (also called a hash tree) is a data structure that lets you
        verify that a piece of data belongs in a larger set without downloading the
        entire set. Blockchains use Merkle trees to efficiently represent transactions,
        account state, and other data within blocks.
      </p>

      <h2 id="how-it-works">
        <a href="#how-it-works" className="anchor-link" aria-label="Link to this section">
          How it works
        </a>
      </h2>
      <p>
        You start with a list of items (e.g., transactions). Each item is hashed.
        Pairs of these hashes are concatenated and hashed again to form a parent node.
        This process repeats until you reach a single root hash, the{" "}
        <strong>Merkle root</strong>.
      </p>
      <p>
        To prove that a specific item is in the set, you only need the hashes along
        the path from that item to the root (a <strong>Merkle proof</strong>). You do
        not need the full tree or the other items. Anyone with the Merkle root can
        verify the proof in logarithmic time.
      </p>

      <MerkleTreeDemo />

      <h2 id="why-blockchains-use-them">
        <a href="#why-blockchains-use-them" className="anchor-link" aria-label="Link to this section">
          Why blockchains use them
        </a>
      </h2>
      <p>
        Blocks store many transactions. Without Merkle trees, verifying that a
        transaction is in a block would require fetching and checking every
        transaction. With a Merkle tree, the block stores only the Merkle root. To
        prove inclusion, you send a small Merkle proof instead of the full list.
      </p>
      <p>
        Light clients, wallets, and indexers rely on this. They can trust that a
        transaction is included without storing or processing the entire block. The
        Merkle root in the block header ties everything together: if any transaction
        changes, the root changes, and the block hash changes.
      </p>

      <h2 id="common-uses">
        <a href="#common-uses" className="anchor-link" aria-label="Link to this section">
          Common uses
        </a>
      </h2>
      <ul>
        <li>
          <strong>Transaction roots</strong>: Bitcoin and Ethereum store a Merkle root
          of transactions in the block header.
        </li>
        <li>
          <strong>State roots</strong>: Ethereum uses a Merkle Patricia trie for account
          state; the state root is in the block header.
        </li>
        <li>
          <strong>SPV proofs</strong>: Simplified Payment Verification allows lightweight
          clients to verify transaction inclusion with Merkle proofs.
        </li>
      </ul>

      <p className="page-next-link">
        <Link to="/advanced-topics">Back to Advanced Topics</Link>
        {' · '}
        <Link to="/blocks-hashing">Blocks & Hashing</Link>
        {' · '}
        <Link to="/transactions">Transactions</Link>
      </p>
    </div>
  )
}
