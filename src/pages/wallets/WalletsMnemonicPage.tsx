import { Link } from 'react-router-dom'
import { MnemonicCreationDemo } from './MnemonicCreationDemo'

export function WalletsMnemonicPage() {
  return (
    <div className="page">
      <h1>
        <a href="#mnemonic" className="anchor-link" aria-label="Link to this section">
          Mnemonic and derivation path
        </a>
      </h1>
      <p className="lead">
        A mnemonic is a set of words that can generate one or more private keys. It is the
        foundation of your wallet, and one of the most important things to safeguard.
      </p>

      <h2 id="what-is-mnemonic">
        <a href="#what-is-mnemonic" className="anchor-link" aria-label="Link to this section">
          What is a mnemonic?
        </a>
      </h2>
      <p>
        A <strong>mnemonic</strong> is a sequence of everyday words (usually 12 or 24) that can be
        used to derive private keys. Think of it as a recovery phrase that you can write down, store
        in a safe, or keep somewhere only you know. Those words can be transformed into blockchain
        accounts (private and public keys). In other words, the mnemonic is the root from which one
        or more accounts grow.
      </p>

      <p>
        Wallets help by generating mnemonic phrases and guiding you through backing them up. Because
        the mnemonic can recreate your keys, backing it up correctly is essential. If you lose
        your device, you can restore your wallet using the same phrase.
      </p>

      <MnemonicCreationDemo />

      <h2 id="derivation-path">
        <a href="#derivation-path" className="anchor-link" aria-label="Link to this section">
          Derivation path
        </a>
      </h2>
      <p>
        One mnemonic can produce many accounts. The <strong>derivation path</strong> is a set of
        rules that determines which private key (and thus which address) is generated. Different
        paths yield different keys. For example, Ethereum often uses paths like{' '}
        <code>m/44&apos;/60&apos;/0&apos;/0/0</code> for the first address. Changing the last number
        produces another address: <code>m/44&apos;/60&apos;/0&apos;/0/1</code>,{' '}
        <code>m/44&apos;/60&apos;/0&apos;/0/2</code>, and so on.
      </p>

      <p>
        Different blockchains use different standards (e.g. BIP-44 for Bitcoin and Ethereum, SS58
        for Polkadot). Your wallet applies the right derivation for the chain you are using, so you
        can manage multiple accounts, and even multiple chains, from a single mnemonic.
      </p>

      <h2 id="why-safeguard">
        <a href="#why-safeguard" className="anchor-link" aria-label="Link to this section">
          Why safeguarding matters
        </a>
      </h2>
      <p>
        Because a mnemonic can derive many wallets and accounts, losing it or exposing it is
        especially dangerous. Anyone with your mnemonic can recreate all the keys derived from it.
        If you use one mnemonic for several wallets across different chains or apps, a single
        leak compromises all of them.
      </p>

      <p>
        Treat your mnemonic like the master key to your on-chain assets. Write it down, keep it
        offline, and never share it or store it in plain text online. Some users go further and
        stamp it on metal or store it in a safe. The goal is simple: only you should have access.
      </p>

      <p className="page-next-link">
        <Link to="/wallets/hot-cold">Hot vs cold wallets</Link>
        {' · '}
        <Link to="/wallets">Back to Wallets</Link>
      </p>
    </div>
  )
}
