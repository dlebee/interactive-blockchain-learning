import { OperatorsUsersDemo } from './OperatorsUsersDemo'

export function OperatorsUsersPage() {
  return (
    <div className="page">
      <h1>The Roles of Participants in Blockchain</h1>
      <p className="lead">
        In a blockchain network, participants fall into two main roles:
        operators who run the infrastructure and users who use it.
      </p>

      <h2>Operators</h2>
      <p>
        Operators run the blockchain software and form a P2P network.
        They relay transactions, propagate blocks, and maintain consensus. In
        return, they earn fees and sometimes new tokens. Without operators, the
        chain would not exist.
      </p>

      <h2>Users</h2>
      <p>
        Users send transactions to the blockchain: transfers, smart contract
        calls, and other actions. They connect to operators and pay fees for
        inclusion. Users are the reason the blockchain has value.
      </p>

      <h2>How they work together</h2>
      <p>
        The diagram below shows the flow. Users submit transactions to operators,
        who gossip them across the P2P mesh. One operator at a time produces a
        block, packs transactions into it, and extends the chain.
      </p>
      <OperatorsUsersDemo />
    </div>
  )
}
