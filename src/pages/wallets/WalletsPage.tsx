import { Link } from 'react-router-dom'
import { WalletNodesDemo } from './WalletNodesDemo'

export function WalletsPage() {
  return (
    <div className="page">
      <h1>Wallets</h1>
      <p className="lead">
        Wallets are software that make it easy to use blockchains. They bridge the gap between you
        and the network, so you do not need to talk to nodes directly.
      </p>

      <p>
        You may have learned that blockchains run on nodes and that users submit transactions to
        them. But how are you supposed to know how to communicate with a node? That is where
        wallets step in. Wallet builders create user-friendly software, often as browser extensions
        or mobile apps, so you can interact with blockchains without dealing with the technical
        details.
      </p>

      <h2 id="wallet-node">
        <a href="#wallet-node" className="anchor-link" aria-label="Link to this section">
          Wallets communicate with nodes
        </a>
      </h2>
      <p>
        When you sign and send a transaction, your wallet handles the connection to the right nodes
        for the blockchain you are using. It finds those nodes, formats your transaction correctly,
        and broadcasts it on your behalf. You see a simple interface; the wallet does the rest.
      </p>

      <WalletNodesDemo />

      <h2 id="responsibilities">
        <a href="#responsibilities" className="anchor-link" aria-label="Link to this section">
          What wallets do
        </a>
      </h2>
      <p>
        Wallets have a few core responsibilities. They are designed to make your interactions safe
        and understandable:
      </p>
      <ul>
        <li>
          <strong>Secure your private key</strong>: The wallet stores and protects the key that
          proves you own your accounts and can sign transactions.
        </li>
        <li>
          <strong>Show what you are signing</strong>: Before a transaction is sent, the wallet
          displays what you are about to submit so you can verify it.
        </li>
        <li>
          <strong>Connect to the right nodes</strong>: It identifies and talks to the nodes of the
          blockchain you want to use.
        </li>
        <li>
          <strong>Help you back up your recovery phrase</strong>: Many wallets generate a{' '}
          <Link to="/wallets/mnemonic">mnemonic</Link> (recovery phrase) and guide you through
          backing it up safely.
        </li>
      </ul>

      <p>
        Because wallets handle your private keys and recovery phrases, choosing a trusted wallet
        and understanding how to keep your keys safe matters. We cover those topics in the sections
        below.
      </p>

      <p className="page-next-link">
        <Link to="/wallets/mnemonic">Mnemonic & derivation path</Link>
        {' · '}
        <Link to="/wallets/hot-cold">Hot vs cold wallets</Link>
      </p>
      <p className="page-next-link">
        <Link to="/account">Accounts</Link>
        {' · '}
        <Link to="/nodes">Nodes</Link>
      </p>
    </div>
  )
}
