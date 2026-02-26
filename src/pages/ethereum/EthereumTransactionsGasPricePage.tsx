import { Link } from 'react-router-dom'

export function EthereumTransactionsGasPricePage() {
  return (
    <div className="page">
      <h1>Gas Price</h1>
      <p className="lead">
        The gas price (or max fee per gas and max priority fee per gas)
        determines how much you pay per unit of gas. It influences how quickly
        your transaction is picked up by block producers.
      </p>
      <p>Content coming soon.</p>
      <p className="page-next-link">
        <Link to="/ethereum/transactions">← Transactions</Link>
      </p>
    </div>
  )
}
