import { Link } from 'react-router-dom'

export function WhatIsBlockchainPage() {
  return (
    <div className="page">
      <h1>What is a Blockchain?</h1>
      <p className="lead">
        Think of it like a shared digital notebook that lots of people can read
        and add to, but no one can erase or sneakily change what’s already
        written.
      </p>
      <p>
        That “notebook” is really a chain of <strong>blocks</strong>. Each block
        holds some data (like transactions) and is cryptographically linked to
        the one before it. Because of that link, tampering with an old block
        breaks the chain, so everyone can tell something’s wrong.
      </p>
      <p>
        Ready to peek inside those blocks and see how hashing holds it all together?{' '}
        <Link to="/blocks-hashing">Jump to Blocks & Hashing →</Link>
      </p>
    </div>
  )
}
