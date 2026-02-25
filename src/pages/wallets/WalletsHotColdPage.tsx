import { Link } from 'react-router-dom'
import { HotWalletRiskDemo } from './HotWalletRiskDemo'
import { ColdWalletDemo } from './ColdWalletDemo'
import { BlindSigningDemo } from './BlindSigningDemo'

export function WalletsHotColdPage() {
  return (
    <div className="page">
      <h1>
        <a href="#hot-cold" className="anchor-link" aria-label="Link to this section">
          Hot vs cold wallets
        </a>
      </h1>
      <p className="lead">
        The difference between hot and cold wallets comes down to whether they are connected to the
        internet. Hot wallets prioritize convenience; cold wallets prioritize security.
      </p>

      <h2 id="hot-wallet">
        <a href="#hot-wallet" className="anchor-link" aria-label="Link to this section">
          Hot wallet: always online, more risk
        </a>
      </h2>
      <p>
        A <strong>hot wallet</strong> is connected to the internet most or all of the time. It lives
        in your browser extension, mobile app, or desktop app. Because it stays online, it is
        constantly exposed to hackers, phishing, and viruses. Malware can leak your private key,
        and once the key is revealed, your funds can be drained. Hot wallets are convenient for
        daily use but carry a higher risk of losing your assets if your device or the software
        is compromised.
      </p>

      <HotWalletRiskDemo />

      <h2 id="cold-wallet">
        <a href="#cold-wallet" className="anchor-link" aria-label="Link to this section">
          Cold wallet: offline, connect only to sign
        </a>
      </h2>
      <p>
        A <strong>cold wallet</strong> stays offline. Typically a hardware device, it never
        connects to the internet directly. Your private keys remain on the device at all times.
        The wallet is only used when you need to sign something: you connect it via USB or
        Bluetooth to your computer or phone, review the transaction on the device screen, and
        approve it. The signature is sent back without the key ever leaving the device. Cold
        wallets focus on security; they are less convenient for frequent, small transactions.
      </p>

      <ColdWalletDemo />

      <h2 id="blind-signing">
        <a href="#blind-signing" className="anchor-link" aria-label="Link to this section">
          Blind signing and its risk
        </a>
      </h2>
      <p>
        Even though a cold wallet cannot expose your private key, some transactions are too
        complex for the device to display or verify. When that happens, the cold wallet
        refuses to sign. Many devices offer an option to enable <strong>blind signing</strong>:
        you agree to sign something the wallet cannot understand or show you. You are
        trusting that what you see on your computer or phone is what actually gets signed.
      </p>

      <p>
        The risk: if the software <em>before</em> the cold wallet—the dapp, bridge, or wallet
        app—is hacked or compromised, it can send a different transaction than you expect.
        You might think you are approving a swap, but you could be signing a transfer of all
        your funds to an attacker. In that case, your private key stays safe and is never
        leaked, but your funds can still be stolen. Blind signing shifts trust to the
        integration in front of the cold wallet. Only enable it when you trust that software
        and understand the risk.
      </p>

      <BlindSigningDemo />

      <h2 id="cold-plus-hot">
        <a href="#cold-plus-hot" className="anchor-link" aria-label="Link to this section">
          Cold wallets partner with hot wallets
        </a>
      </h2>
      <p>
        To get both security and usability, cold wallets integrate with hot wallet apps. You use
        the hot wallet’s interface (the one you are used to) but the actual signing happens on
        the hardware device. The hot wallet sends the transaction to sign; the cold wallet signs it
        and returns the signature. Your private key never leaves the cold device.
      </p>

      <h2 id="when-to-use">
        <a href="#when-to-use" className="anchor-link" aria-label="Link to this section">
          When to use which
        </a>
      </h2>
      <p>
        Use a hot wallet for smaller amounts and frequent activity. Use a cold wallet for larger
        holdings or long-term storage. Many users keep day-to-day funds in a hot wallet and move
        the rest to a hardware wallet. The rule of thumb: if losing it would hurt, keep it in a
        cold wallet.
      </p>

      <p className="page-next-link">
        <Link to="/wallets/mnemonic">Mnemonic & derivation path</Link>
        {' · '}
        <Link to="/wallets">Back to Wallets</Link>
      </p>
    </div>
  )
}
