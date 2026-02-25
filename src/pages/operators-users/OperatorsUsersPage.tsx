import { OperatorsUsersDemo } from './OperatorsUsersDemo'

export function OperatorsUsersPage() {
  return (
    <div className="page">
      <h1>The Roles of Participants in Blockchain</h1>
      <p className="lead">
        In a blockchain network, there are many types of participants. Different
        blockchains may have varying sets of participants, but they are usually
        grouped into two main categories.
      </p>
      <p>
        <strong>Operators</strong> run the blockchain software to earn fees.
        They are the decentralized contributors who make the blockchain
        functional and maintain its existence.
      </p>
      <p>
        <strong>Users</strong> are the consumers who find value in interacting
        with the blockchain for various purposes.
      </p>
      <p>
        Operators maintain the blockchain and are rewarded financially for their
        contributions. Users interact with the blockchain and pay fees for the
        services it provides. Together, these two groups sustain the blockchain
        ecosystem.
      </p>
      <OperatorsUsersDemo />
    </div>
  )
}
