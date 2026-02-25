import { Link } from 'react-router-dom'
import { SolidityToChainDemo } from './SolidityToChainDemo'

export function EthereumIntroductionPage() {
  return (
    <div className="page">
      <h1>Introduction</h1>
      <p className="lead">
        A short overview of Ethereum: how it started, the idea behind the
        Ethereum Virtual Machine, and why it introduced the term smart
        contracts to the blockchain world.
      </p>

      <h2 id="history">
        <a href="#history" className="anchor-link" aria-label="Link to this section">
          How Ethereum started
        </a>
      </h2>
      <p>
        Ethereum was first presented at a Bitcoin conference. In 2014,{' '}
        <strong>Vitalik Buterin</strong> revealed Ethereum at Bitcoin Miami
        (North American Bitcoin Conference). Buterin had written the Ethereum
        whitepaper in late 2013; the project went public in January 2014. The
        founding team grew to include co founders such as{' '}
        <strong>Gavin Wood</strong> (who later wrote the Ethereum Yellow Paper
        and created the Solidity language), <strong>Joseph Lubin</strong>,{' '}
        <strong>Charles Hoskinson</strong>, <strong>Anthony Di Iorio</strong>,{' '}
        <strong>Mihai Alisie</strong>, and <strong>Jeffrey Wilcke</strong>, among
        others.
      </p>
      <p>
        <strong>ConsenSys</strong>, founded by Joseph Lubin in 2014, became one
        of the largest companies in the Ethereum ecosystem, building developer
        tools, wallets, and enterprise solutions. The{' '}
        <strong>Ethereum Foundation</strong> is a non profit that supports
        Ethereum protocol development, research, and education. Together,
        ConsenSys and the Ethereum Foundation have played a major role in
        growing the ecosystem.
      </p>

      <h2 id="evm">
        <a href="#evm" className="anchor-link" aria-label="Link to this section">
          The Ethereum Virtual Machine
        </a>
      </h2>
      <p>
        Ethereum introduced a <strong>virtual machine</strong> that runs on
        every node: the <strong>Ethereum Virtual Machine</strong>, or EVM.
        Contract code is executed inside this VM. The EVM is similar in spirit
        to other safe, synchronous virtual machines used for embedded or
        sandboxed scripting, such as <strong>Lua</strong> and{' '}
        <strong>Pawn</strong>. Like those, it is highly verifiable and
        restricted: execution can only use scope variables and access storage
        that the protocol defines. There is no unbounded memory or arbitrary
        system calls, so the VM is predictable and auditable.
      </p>

      <h2 id="determinism">
        <a href="#determinism" className="anchor-link" aria-label="Link to this section">
          Why determinism matters
        </a>
      </h2>
      <p>
        A key benefit of this design is <strong>determinism</strong>. Every node
        runs the same EVM and the same contract code. Given the same inputs
        (transaction, prior state), every node re executes the transaction and
        gets the same result: the same hash for that transaction and the same
        state transitions. That way, the network can agree on the outcome of
        contract execution without trusting a single party. Determinism is what
        makes decentralized execution possible.
      </p>

      <h2 id="smart-contracts">
        <a href="#smart-contracts" className="anchor-link" aria-label="Link to this section">
          More than value transfer: smart contracts
        </a>
      </h2>
      <p>
        Bitcoin was designed to transfer value: moving the native currency from
        one address to another. The idea behind Ethereum was to go further: a
        blockchain that did not only transfer value but also allowed{' '}
        <strong>software to run in a decentralized way</strong>. Users could
        deploy and invoke programs (contracts) that persist on chain and update
        shared state according to rules everyone can verify. That combination of
        a virtual machine and on chain programmability is what Ethereum
        popularized under the name <strong>smart contracts</strong>. Ethereum
        brought the term smart contracts into the blockchain world and made it
        central to how we talk about programmable chains today.
      </p>

      <p>
        In practice, a Solidity source file is compiled by a Solidity compiler
        into bytecode, which is deployed on the blockchain; the contract can
        then be executed. The animation below walks through that flow. We will
        expand on how contracts are deployed and executed in the smart
        contract section later.
      </p>

      <SolidityToChainDemo />

      <p>
        Today, Ethereum uses Proof of Stake for consensus; its native currency
        is ETH, used for fees and validator rewards. The EVM, contract accounts,
        and standards like ERC-20 for tokens all build on this foundation.
      </p>

      <p className="page-next-link">
        <Link to="/ethereum">← Ethereum</Link>
      </p>
    </div>
  )
}
