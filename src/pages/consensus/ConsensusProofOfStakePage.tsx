import { Link } from 'react-router-dom'
import { PosStakeSlashDemo } from './PosStakeSlashDemo'
import { PosLeaderSlotDemo } from './PosLeaderSlotDemo'
import { PosFinalityEthereumDemo } from './PosFinalityEthereumDemo'
import { PosFinalityNposDemo } from './PosFinalityNposDemo'
import './ConsensusProofOfStakePage.css'

export function ConsensusProofOfStakePage() {
  return (
    <div className="page">
      <h1>
        <a href="#proof-of-stake" className="anchor-link" aria-label="Link to this section">
          Proof of Stake
        </a>
      </h1>
      <p className="lead">
        Proof of Stake (PoS) has been implemented differently by different systems, but
        most share common concepts: validators stake collateral, commit to liveness,
        participate in leader election for block authorship, and may reach finality through
        explicit voting.
      </p>

      <h2 id="staking">
        <a href="#staking" className="anchor-link" aria-label="Link to this section">
          Staking and slashing
        </a>
      </h2>
      <p>
        Typically, PoS systems require operators called <strong>validators</strong> to stake
        some <strong>native currency</strong> (lock or bond it) as collateral for good
        behavior. If the validator behaves as expected, they receive rewards. If they behave
        poorly, whether intentionally or not, their stake is <strong>slashed</strong>.
      </p>
      <PosStakeSlashDemo />

      <h2 id="commitment">
        <a href="#commitment" className="anchor-link" aria-label="Link to this section">
          Commitment to liveness
        </a>
      </h2>
      <p>
        By staking, validators essentially commit to <strong>liveness</strong>. If they go
        offline for too long, they may be kicked out or slashed. This ensures the network
        keeps producing blocks and does not stall.
      </p>

      <h2 id="leader-election">
        <a href="#leader-election" className="anchor-link" aria-label="Link to this section">
          Leader election
        </a>
      </h2>
      <p>
        Proof of stake blockchains aim to author blocks with a smaller footprint and more
        predictable timing than PoW. They do this by defining which validator is
        responsible for authoring the next slot, instead of racing to solve a puzzle.
      </p>
      <PosLeaderSlotDemo />
      <p>
        There are different forms of leader election with different benefits; these are
        covered in more advanced topics.
      </p>

      <h2 id="finality">
        <a href="#finality" className="anchor-link" aria-label="Link to this section">
          Finality
        </a>
      </h2>
      <p>
        Proof of stake introduces the concept of <strong>finality</strong>. Systems separate
        block authorship from finalization: validators author blocks, then vote to finalize
        them. Blocks reach &quot;safe&quot; (probabilistic) and then &quot;final&quot; once a
        supermajority has voted. The animations below show how this works in practice.
      </p>

      <PosFinalityEthereumDemo />

      <PosFinalityNposDemo />

      <h2 id="economic-finality">
        <a href="#economic-finality" className="anchor-link" aria-label="Link to this section">
          Economic finality vs probabilistic finality
        </a>
      </h2>
      <p>
        <strong>Economic finality</strong> means blocks are considered final once a supermajority
        of validators (2/3+1) has voted on them. Before PoS, systems relied on
        <strong>probabilistic finality</strong>: treating a block as final after a certain
        number of confirmations. Remnants remain. For Ethereum: 1 epoch is the &quot;safe&quot;
        block (probabilistic), and 2 epochs is economic finality.
      </p>
      <p>
        Finality is often not stored in the blockchain state itself. Instead, nodes understand
        and agree on it outside the block data (Ethereum, Polkadot NPoS). Ethereum, with
        many validators, takes 2 epochs; Polkadot NPoS, with fewer validators holding more
        stake, reaches finality faster.
      </p>
      <p>
        Crucially, even with economic finality, <strong>all nodes still execute every transaction
        and verify blocks against their own local state before accepting them</strong>. As
        covered in consensus, non-authors receive proposed blocks, execute the transactions
        themselves, and must agree with the author&apos;s claimed hash. This verification
        happens regardless of whether finality has been reached. Even if finality were paused,
        nodes would still validate blocks. Understanding this is essential for protocols
        that rely on <strong>probabilistic finality over economic finality</strong>, such as
        rollups or cross-chain designs that cannot wait for economic finality.
      </p>

      <p className="page-next-link">
        <Link to="/consensus">Back to Consensus</Link>
        {' · '}
        <Link to="/consensus/proof-of-work">Proof of Work</Link>
        {' · '}
        <Link to="/blockspace">Blockspace</Link>
      </p>
    </div>
  )
}
