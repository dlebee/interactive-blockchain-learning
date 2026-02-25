import { Link } from 'react-router-dom'

export function TokensPage() {
  return (
    <div className="page">
      <h1>Tokens</h1>
      <p className="lead">
        A <strong>token</strong> is not the main currency of the chain. It is
        an additional asset defined on top of the protocol. How it is
        implemented depends on the type of chain.
      </p>

      <h2 id="not-the-native-currency">
        <a href="#not-the-native-currency" className="anchor-link" aria-label="Link to this section">
          Not the native currency
        </a>
      </h2>
      <p>
        The native currency (e.g. ETH, SOL, DOT) is built into the protocol for
        fees and block rewards. Tokens are separate assets. They may represent
        stablecoins, governance rights, or other value, but they are not what the
        chain uses to pay operators. That role stays with the native currency.
      </p>

      <h2 id="implementation-by-chain">
        <a href="#implementation-by-chain" className="anchor-link" aria-label="Link to this section">
          Implementation by chain
        </a>
      </h2>
      <p>
        On <strong>Ethereum</strong> and other EVM style chains, tokens are
        usually implemented as <strong>smart contracts</strong> following the{' '}
        <a href="https://eips.ethereum.org/EIPS/eip-20" target="_blank" rel="noopener noreferrer">
          ERC-20 standard
        </a>
        .
      </p>
      <p>
        On <strong>Solana</strong>, tokens are created and managed by a native{' '}
        <strong>program</strong>, the{' '}
        <a href="https://spl.solana.com/token" target="_blank" rel="noopener noreferrer">
          SPL Token Program
        </a>
        .
      </p>
      <p>
        On chains like <strong>Polkadot</strong>, tokens are{' '}
        <strong>Assets</strong> managed by the{' '}
        <a href="https://paritytech.github.io/polkadot-sdk/master/assets_common/" target="_blank" rel="noopener noreferrer">
          AssetAdapter
        </a>
        {' '}
        and related infrastructure in the WASM runtime (see{' '}
        <a href="https://paritytech.github.io/polkadot-sdk/master/pallet_assets/" target="_blank" rel="noopener noreferrer">
          pallet_assets
        </a>
        {' '}
        in polkadot-sdk).
      </p>

      <p className="page-next-link">
        <Link to="/nodes">Nodes: the software behind operators →</Link>
      </p>
    </div>
  )
}
