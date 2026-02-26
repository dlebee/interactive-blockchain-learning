import { Link } from 'react-router-dom'

export function EthereumTransactionsLogsPage() {
  return (
    <div className="page">
      <h1>Logs</h1>
      <p className="lead">
        Smart contracts emit logs during execution. Logs appear in the
        transaction receipt and are used for indexing, events, and off-chain
        tracking.
      </p>
      <p>Content coming soon.</p>
      <p className="page-next-link">
        <Link to="/ethereum/transactions">← Transactions</Link>
      </p>
    </div>
  )
}
