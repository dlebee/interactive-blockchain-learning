import { Link } from 'react-router-dom'

export function NativeCurrencyTokensPage() {
  return (
    <div className="page">
      <h1>Native Currency</h1>
      <p className="lead">
        On most chains there is a <strong>native currency</strong>, or only the
        native currency. It is the asset used for block rewards and fees, and it
        is what keeps the blockchain incentivized and running.
      </p>

      <h2 id="what-is-native-currency">
        <a href="#what-is-native-currency" className="anchor-link" aria-label="Link to this section">
          What is the native currency?
        </a>
      </h2>
      <p>
        The native currency is the asset built into the protocol. It is used
        for <strong>block rewards</strong> and <strong>fees</strong>. When users
        send transactions, they pay fees in this currency. When operators
        produce or validate blocks, they receive rewards in it. That flow is
        what incentivizes the blockchain to operate well. Without it, there would
        be little reason for anyone to run nodes, mine, or validate.
      </p>

      <h2 id="rewards-and-fees">
        <a href="#rewards-and-fees" className="anchor-link" aria-label="Link to this section">
          Block rewards and fees
        </a>
      </h2>
      <p>
        The exact form of the reward depends on the consensus mechanism. In{' '}
        <Link to="/consensus/proof-of-work">Proof of Work</Link>, miners compete
        to produce blocks and earn the <strong>block reward</strong> (newly
        minted coins) plus any <strong>fees</strong> attached to the
        transactions they include. For example, Bitcoin miners are paid in BTC.
        In <Link to="/consensus/proof-of-stake">Proof of Stake</Link>, validators
        propose and attest to blocks and are rewarded in the native currency.
        For example, Ethereum validators earn ETH as staking rewards and from
        fees. In both cases, the native currency is what pays the people who
        secure and maintain the chain.
      </p>

      <h2 id="no-decimals">
        <a href="#no-decimals" className="anchor-link" aria-label="Link to this section">
          No decimal points: integer amounts and units
        </a>
      </h2>
      <p>
        On chain, amounts are stored as <strong>whole numbers</strong>. There
        are no decimal points. To represent smaller fractions, the protocol
        defines a base unit and a <strong>number of decimals</strong>: one
        "display" unit equals 10 to the power of that number of base units.
        So instead of storing "0.5" of a coin, the chain stores an integer
        (e.g. 50,000,000) and everyone agrees that the human readable amount
        is that integer divided by 10<sup>8</sup> (or whatever the protocol
        chose). The value of the currency is effectively "power of 10" based
        on that decimal count.
      </p>
      <p>
        The same amount can be written in different units. Below, one value is
        scaled: <strong>1.254 BTC</strong> and <strong>1.254 ETH</strong>{' '}
        expressed in each unit. On chain, only the base unit (satoshi, wei) is
        stored as an integer.
      </p>

      <p>
        <strong>Bitcoin</strong> (8 decimals). Base unit: <strong>satoshi</strong>.
      </p>
      <table className="native-currency-table">
        <thead>
          <tr>
            <th scope="col">Unit</th>
            <th scope="col">Amount (1.254)</th>
            <th scope="col">Scale (per 1 BTC)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>BTC</td>
            <td>1.254</td>
            <td>10<sup>0</sup></td>
          </tr>
          <tr>
            <td>mBTC (millibitcoin)</td>
            <td>1,254</td>
            <td>10<sup>3</sup></td>
          </tr>
          <tr>
            <td>µBTC (microbitcoin)</td>
            <td>1,254,000</td>
            <td>10<sup>6</sup></td>
          </tr>
          <tr>
            <td>satoshi (base unit, on chain)</td>
            <td>125,400,000</td>
            <td>10<sup>8</sup></td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Ethereum</strong> (18 decimals). Base unit: <strong>wei</strong>.
      </p>
      <table className="native-currency-table">
        <thead>
          <tr>
            <th scope="col">Unit</th>
            <th scope="col">Amount (1.254)</th>
            <th scope="col">Scale (per 1 ETH)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ETH</td>
            <td>1.254</td>
            <td>10<sup>0</sup></td>
          </tr>
          <tr>
            <td>gwei (gas prices often in this)</td>
            <td>1,254,000,000</td>
            <td>10<sup>9</sup></td>
          </tr>
          <tr>
            <td>wei (base unit, on chain)</td>
            <td>1,254,000,000,000,000,000</td>
            <td>10<sup>18</sup></td>
          </tr>
        </tbody>
      </table>

      <p className="page-next-link">
        <Link to="/cryptocurrency/tokens">Tokens →</Link>
      </p>
    </div>
  )
}
