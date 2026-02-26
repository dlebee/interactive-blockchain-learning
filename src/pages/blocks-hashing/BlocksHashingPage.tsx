import { Link } from 'react-router-dom'
import { BlockChainDemo } from './BlockChainDemo'

export function BlocksHashingPage() {
  return (
    <div className="page">
      <h1>Blocks & Hashing</h1>
      <p className="lead">
        Blocks hold different kinds of information. Usually that means
        transactions, though the exact format varies by blockchain.
      </p>
      <p>
        A <strong>digest</strong> (or hash) turns any information into a unique
        digital signature. Change one character and the digest changes
        completely. On its own, though, a block’s digest does not tell you the
        history of what happened before it.
      </p>
      <p>
        That is why each block stores the digest of the <em>previous</em> block.
        By tying its own digest to the previous block’s hash, each block becomes
        reactive to everything that came before it. If someone changes an old
        block, its digest changes. That breaks the next block, which expected the
        old digest. To fix it, they would need to recalculate every hash from
        that point onward and convince everyone on the network that the new
        chain is valid. In practice, that is not possible.
      </p>
      <p>Try it yourself. Build a chain, then edit any block and watch the digests update.</p>
      <BlockChainDemo />
      <p>
        Blocks often use <Link to="/advanced-topics/merkle-trees">Merkle trees</Link> to represent
        transactions efficiently. See how blocks hold and verify transactions in{' '}
        <Link to="/transactions">Transactions →</Link>
      </p>
    </div>
  )
}
