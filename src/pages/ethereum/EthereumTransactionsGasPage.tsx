import { Link } from 'react-router-dom'

export function EthereumTransactionsGasPage() {
  return (
    <div className="page">
      <h1>Gas</h1>
      <p className="lead">
        Gas is the unit of computational work on the EVM. Every operation
        costs gas; the gas limit caps how much work a transaction can do.
      </p>
      <p>Content coming soon.</p>
      <p className="page-next-link">
        <Link to="/ethereum/transactions">← Transactions</Link>
      </p>
    </div>
  )
}
