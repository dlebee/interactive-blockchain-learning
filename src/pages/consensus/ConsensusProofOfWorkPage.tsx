import { Link } from 'react-router-dom'
import { ConsensusLeaderlessDemo } from './ConsensusLeaderlessDemo'
import { PoWHashPuzzleDemo } from './PoWHashPuzzleDemo'
import { PoWDifficultyDemo } from './PoWDifficultyDemo'

export function ConsensusProofOfWorkPage() {
  return (
    <div className="page">
      <h1>
        <a href="#proof-of-work" className="anchor-link" aria-label="Link to this section">
          Proof of Work
        </a>
      </h1>
      <p className="lead">
        Proof of Work (PoW) is a consensus mechanism where nodes compete to solve a cryptographic
        puzzle. The first to find a valid solution gets to propose the next block. The puzzle
        is expensive to solve but easy to verify, which secures the network.
      </p>

      <h2 id="longest-chain-and-slots">
        <a href="#longest-chain-and-slots" className="anchor-link" aria-label="Link to this section">
          Longest chain and predictable slots
        </a>
      </h2>
      <p>
        Many protocols use the <strong>longest chain rule</strong>: the chain with the most blocks
        wins. Because the chosen chain is the longest, we must prevent participants from creating
        blocks too fast. Otherwise, someone could race ahead and dominate the network. This is
        why consensus designs rely on <strong>predictable block slots</strong>: each slot is a
        window in which at most one block should be produced, keeping the race fair.
      </p>

      <div className="pow-demo-wrapper">
        <ConsensusLeaderlessDemo
          title="Without slowdown: a chaotic race"
          caption="Nodes compete at different speeds. Without constraints, the fastest could dominate. We need a way to slow everyone down."
        />
      </div>

      <h2 id="hash-puzzle">
        <a href="#hash-puzzle" className="anchor-link" aria-label="Link to this section">
          The hash puzzle
        </a>
      </h2>
      <p>
        Proof of Work solves this by forcing nodes to solve a <strong>cryptographic puzzle</strong>
        before proposing a block. The puzzle draws on an older idea used to reduce spam: require
        significant computational work. To produce a block, a node must find a <strong>nonce</strong>{" "}
        (a number) such that when the block data (including the nonce) is hashed, the output
        meets a target. For example, the hash might need to start with a certain number of zeros.
        Finding a valid nonce is expensive; verifying it is trivial.
      </p>

      <PoWHashPuzzleDemo />

      <h2 id="difficulty">
        <a href="#difficulty" className="anchor-link" aria-label="Link to this section">
          Difficulty adjustment
        </a>
      </h2>
      <p>
        The network regularly adjusts the puzzle <strong>difficulty</strong> so that blocks keep
        arriving at the target rate. In Bitcoin, the difficulty is recalibrated every 2,016 blocks
        (roughly two weeks), with a target of about 10 minutes per block. If blocks come too
        fast, difficulty rises; if too slow, it falls. This keeps block time roughly stable even
        as hashing power changes.
      </p>

      <PoWDifficultyDemo />

      <h2 id="easy-onboarding">
        <a href="#easy-onboarding" className="anchor-link" aria-label="Link to this section">
          Easy onboarding
        </a>
      </h2>
      <p>
        One of the biggest benefits of PoW is <strong>easy onboarding</strong>. You can start a
        computer, run the mining software, and participate in the race. No lockup of funds, no
        approval process. That said, without a very strong computer (or specialized hardware
        like ASICs), you are unlikely to win a block reward. The competition favors those with
        the most hashing power.
      </p>

      <h2 id="longest-chain">
        <a href="#longest-chain" className="anchor-link" aria-label="Link to this section">
          Forks
        </a>
      </h2>
      <p>
        The canonical chain is typically the one with the <strong>most cumulative work</strong>: the
        sum of the difficulty of all blocks. When multiple miners find blocks at similar times, a
        temporary fork can occur.
        The protocol may resolve this with a predefined rule (e.g. most transactions, highest
        value). Miners build on the branch they receive first; eventually one outpaces the other.
      </p>

      <h2 id="energy">
        <a href="#energy" className="anchor-link" aria-label="Link to this section">
          Energy consumption and escalating competition
        </a>
      </h2>
      <p>
        PoW is energy intensive by design. As block rewards became lucrative, miners invested in
        specialized hardware and optimized code. To stay competitive, others had to do the same,
        pushing mining difficulty higher,
        consuming ever more electricity. The energy used by crypto assets globally is estimated
        at roughly 0.4–0.9% of annual electricity usage. Concerned by this trend, developers
        explored alternatives such as Proof of Stake (PoS) to provide security with far less
        energy use.
      </p>

      <p className="page-next-link">
        <Link to="/consensus">Back to Consensus</Link>
        {' · '}
        <Link to="/blockspace">Blockspace</Link>
      </p>
    </div>
  )
}
