import { TransactionsDemo } from './TransactionsDemo'

export function TransactionsPage() {
  return (
    <div className="page">
      <h1>How Blocks Translate to Transactions</h1>
      <p className="lead">
        Why blocks? How do blocks relate to transactions? Click Next to walk
        through an interactive example.
      </p>
      <TransactionsDemo />
    </div>
  )
}
