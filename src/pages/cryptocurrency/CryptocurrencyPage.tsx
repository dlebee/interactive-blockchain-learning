import { Link } from 'react-router-dom'
import { CryptocurrencyDemo } from './CryptocurrencyDemo'

export function CryptocurrencyPage() {
  return (
    <div className="page">
      <h1>What is Cryptocurrency?</h1>
      <p className="lead">
        Now that you understand operators and users, it is time to see how
        blockchains use incentives and cryptography to create their native
        currency.
      </p>

      <CryptocurrencyDemo />

      <h2>Incentives, not altruism</h2>
      <p>
        Blockchains do not assume that people act purely out of altruism. Instead,
        they are designed around incentives. Operators who run the network must be
        rewarded for their work. That reward takes the form of a native currency
        built into the protocol.
      </p>

      <h2>Why "crypto" currency?</h2>
      <p>
        The name comes from two ideas. First, blockchains use cryptography to
        secure themselves, including the asymmetric encryption you saw in{' '}
        <Link to="/wallet">Accounts</Link>. Second, they need a currency to pay
        operators for maintaining and securing the chain. Put them together:
        cryptography plus currency gives you cryptocurrency.
      </p>

      <p>
        In our world, incentives drive behavior and are often rewarded with
        currency. The same applies to blockchain. Because a blockchain runs
        in a decentralized way, with many participants instead of a single
        organization, it needs its own currency to reward those participants.
      </p>

      <h2>Digital by design</h2>
      <p>
        Some people call it digital currency because it exists only as data, with
        no physical form. The operators you met in{' '}
        <Link to="/operators-users">Operators & Users</Link> are the ones who
        receive this cryptocurrency in exchange for relaying transactions,
        producing blocks, and keeping the chain alive.
      </p>

      <p>
        That is why blockchains are often called cryptocurrencies: the native
        currency is how the system rewards the people who make it work.
      </p>

      <p className="page-next-link">
        <Link to="/nodes">Nodes: the software behind operators →</Link>
      </p>

      <aside className="page-note">
        <strong>Note:</strong> Showing all fees going to the operator is an
        oversimplification. Blockchains use many different fee structures:
        block producers, validators, burn mechanisms, priority queues, and more.
      </aside>
    </div>
  )
}
