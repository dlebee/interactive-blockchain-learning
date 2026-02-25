import { Link } from 'react-router-dom'
import { BlockspaceDemo } from './BlockspaceDemo'

export function BlockspacePage() {
  return (
    <div className="page">
      <h1>Blockspace</h1>
      <p className="lead">
        For nodes to create blocks at a steady pace, blocks cannot take too long
        to create or be too big. Blockspace is how protocols manage this.
      </p>

      <h2 id="size-and-time">
        <a href="#size-and-time" className="anchor-link" aria-label="Link to this section">
          Size and time
        </a>
      </h2>
      <p>
        There are two main ways to think about limiting blocks: <strong>size</strong>{" "}
        and <strong>time</strong>. A block that is too large takes longer to
        propagate and validate. A block that takes too long to produce delays
        the next slot. Different blockchains prefer different limits. Some cap
        block size. Others cap block time. Many use a combination of compute,
        storage, time, or processing difficulty.
      </p>
      <BlockspaceDemo />

      <h2 id="liveness">
        <a href="#liveness" className="anchor-link" aria-label="Link to this section">
          Liveness
        </a>
      </h2>
      <p>
        By capping the size of blocks (or the work required to produce them),
        protocols maximize the guarantee that nodes can create blocks at the
        expected block slot. This is often called <strong>liveness</strong>. If
        blocks are unbounded, production and propagation can slip, and the
        network may fail to make progress on schedule. Blockspace limits keep
        production predictable and aligned with the consensus slot.
      </p>
      <p>
        Liveness can also be defined as: any transaction that is valid should
        make it into a block. Protocols must balance liveness and security, but
        they always choose security over liveness when the two conflict. We
        expand on how valid transactions get included in{' '}
        <Link to="/transaction-inclusion">Transaction Inclusion</Link>.
      </p>

      <p className="page-next-link">
        <Link to="/consensus">Consensus</Link>
        {' · '}
        <Link to="/transaction-inclusion">Transaction Inclusion</Link>
        {' · '}
        <Link to="/blocks-hashing">Blocks & Hashing</Link>
      </p>
    </div>
  )
}
