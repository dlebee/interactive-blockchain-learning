import { Link } from 'react-router-dom'
import {
  CentralizedOracleDiagram,
  DelegatedOracleDiagram,
  PermissionlessOracleDiagram,
} from './OraclesDemo'

export function OraclesPage() {
  return (
    <div className="page">
      <h1 id="oracles">
        <a href="#oracles" className="anchor-link" aria-label="Link to this section">
          Oracles
        </a>
      </h1>
      <p className="lead">
        Blockchains are deterministic and isolated. They cannot fetch external data.
        Oracles bridge that gap: they bring off-chain data (prices, events, APIs) on-chain
        so smart contracts can use it.
      </p>

      <h2 id="oracle-responsibility">
        <a href="#oracle-responsibility" className="anchor-link" aria-label="Link to this section">
          What oracles do
        </a>
      </h2>
      <p>
        An oracle is responsible for fetching, verifying, and delivering data from the
        outside world to the blockchain. It must be correct and available when contracts
        need it. Oracles power DeFi price feeds, insurance payouts, prediction markets,
        and any contract that depends on real world information.
      </p>

      <h2 id="centralized-oracle">
        <a href="#centralized-oracle" className="anchor-link" aria-label="Link to this section">
          Centralized oracle
        </a>
      </h2>
      <CentralizedOracleDiagram />
      <p>
        A centralized oracle is a single entity (or a small trusted group) that provides
        the data. It is simple to build and fast to update. But it is a single point of
        failure: if the oracle is wrong or malicious, users lose. There is no redundancy
        and no way to hold them accountable on-chain.
      </p>

      <h2 id="delegated-oracle">
        <a href="#delegated-oracle" className="anchor-link" aria-label="Link to this section">
          Delegated oracles
        </a>
      </h2>
      <DelegatedOracleDiagram />
      <p>
        A delegated oracle uses a set of trusted entities chosen by the protocol or users.
        They submit data, and the system aggregates it (e.g. median, voting). No single
        entity controls the outcome. If one misbehaves, the protocol can slash them or
        remove them. You can incentivize good behavior and punish bad behavior because
        you know who the participants are.
      </p>
      <p>
        The trade-off: you must be selected to participate. It is permissioned, not
        open to anyone. The set can still collude, but they are harder to coordinate
        and easier to hold accountable than a single oracle.
      </p>

      <h2 id="permissionless-oracle">
        <a href="#permissionless-oracle" className="anchor-link" aria-label="Link to this section">
          Permissionless oracle
        </a>
      </h2>
      <PermissionlessOracleDiagram />
      <p>
        A permissionless oracle lets anyone join and submit data without approval. It is
        the hardest to design.
      </p>
      <p>
        <strong>Incentives:</strong> You want to reward honest reporters. But you often
        do not know the truth on-chain until after the fact (or never). If you pay
        before knowing the truth, you cannot tell who is honest. If you pay after,
        you need a way to determine truth on-chain, which is often impossible for
        real world events.
      </p>
      <p>
        <strong>Punishment:</strong> To slash bad actors, you must know who was wrong.
        Truth may be subjective or hard to prove. Sybil attacks let one entity create
        many fake identities to game rewards or voting. Collusion lets many participants
        coordinate to lie.
      </p>
      <p>
        Most projects avoid permissionless oracles because of these design challenges.
        Delegated oracles offer a better balance of decentralization and practicality.
      </p>

      <h2 id="oracle-providers">
        <a href="#oracle-providers" className="anchor-link" aria-label="Link to this section">
          Known oracle providers
        </a>
      </h2>
      <p>
        The most common oracles in production are delegated oracles: a permissioned set of
        nodes that fetch data, aggregate it, and publish it on-chain. Anyone can read the
        data, but only selected operators can submit it.
      </p>
      <p>Some well known providers:</p>
      <ul>
        <li>Chainlink</li>
        <li>Pyth Network</li>
        <li>Band Protocol</li>
      </ul>

      <p className="page-next-link">
        <Link to="/advanced-topics/batching">Batching</Link>
        {' · '}
        <Link to="/blockspace">Blockspace</Link>
      </p>
    </div>
  )
}
