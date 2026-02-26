import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page">
      <h1>Page not found</h1>
      <p className="lead">
        The page you are looking for does not exist or has been moved.
      </p>
      <p>
        You may have followed an old link. For example, Merkle Trees has moved to{' '}
        <Link to="/advanced-topics/merkle-trees">Advanced Topics → Merkle Trees</Link>.
      </p>
      <p className="page-next-link">
        <Link to="/">Go to home</Link>
        {' · '}
        <Link to="/what-is-blockchain">What is a Blockchain?</Link>
      </p>
    </div>
  )
}
