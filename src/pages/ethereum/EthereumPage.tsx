import { Link } from 'react-router-dom'

export function EthereumPage() {
  return (
    <div className="page">
      <h1>Ethereum</h1>
      <p className="lead">
        Ethereum is a general purpose blockchain with a native currency (ETH),
        smart contracts, and a large ecosystem of applications and tokens.
      </p>
      <p>
        This section focuses on Ethereum specific concepts and how they build on
        the core ideas you have already seen: blocks, transactions, accounts,
        consensus, and the role of the native currency.
      </p>
      <p className="page-next-link">
        <Link to="/ethereum/introduction">Introduction →</Link>
      </p>
    </div>
  )
}
