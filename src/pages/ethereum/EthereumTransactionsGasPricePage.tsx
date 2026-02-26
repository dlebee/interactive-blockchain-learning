import { Link } from 'react-router-dom'
import { BlockMath, InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { EIP1559Demo } from './EIP1559Demo'
import './EthereumTransactionsGasPricePage.css'

const LEGACY_TX_JSON = `{
  "gasPrice": "0x4a817c800",
  "gasLimit": "0x5208",
  "to": "0x...",
  "value": "0x0",
  "data": "0x"
}`

const TYPE2_TX_JSON = `{
  "maxFeePerGas": "0x59682f00",
  "maxPriorityFeePerGas": "0x59682f00",
  "gasLimit": "0x5208",
  "to": "0x...",
  "value": "0x0",
  "data": "0x"
}`

export function EthereumTransactionsGasPricePage() {
  return (
    <div className="page">
      <h1>Gas Price</h1>
      <p className="lead">
        The gas price determines how much you pay per unit of gas. It
        influences how quickly your transaction is picked up by block
        producers. Type 2 transactions (EIP-1559) replaced the legacy model
        with a dynamic base fee and a priority fee.
      </p>

      <h2 id="legacy-vs-type2">
        <a href="#legacy-vs-type2" className="anchor-link" aria-label="Link to this section">
          Legacy vs Type 2 transactions
        </a>
      </h2>
      <p>
        Before EIP-1559, transactions used a single <code>gasPrice</code> field.
        Users depended on external gas oracles (Etherscan Gas Tracker, Blocknative
        Gas Oracle) to estimate fees. That model relied on an inefficient
        auction: everyone bid a gas price, and the highest bids got included
        first.
      </p>
      <p>
        EIP-1559 introduced <strong>Type 2 transactions</strong> and a
        protocol level <strong>base fee</strong>. The base fee is set by the
        protocol each block (it adjusts with block fullness). Legacy
        transactions have no base fee; they use a single <code>gasPrice</code>{' '}
        that is entirely paid to the producer. Type 2 transactions specify{' '}
        <code>maxFeePerGas</code> and <code>maxPriorityFeePerGas</code>. The base
        fee is burned; the priority fee goes to the producer. The goal was to
        simplify fee estimation through a dynamic base fee that adjusts
        automatically with network demand. That was intended to reduce or remove
        the need for external oracles.
      </p>

      <div className="gas-price-code-row">
        <div className="gas-price-code-block">
          <span className="gas-price-code-label">Legacy (Type 0)</span>
          <SyntaxHighlighter
            language="json"
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: 8,
              fontSize: '0.8rem',
            }}
            codeTagProps={{ style: { fontFamily: 'ui-monospace, monospace' } }}
          >
            {LEGACY_TX_JSON}
          </SyntaxHighlighter>
        </div>
        <div className="gas-price-code-block">
          <span className="gas-price-code-label">Type 2 (EIP-1559)</span>
          <SyntaxHighlighter
            language="json"
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: 8,
              fontSize: '0.8rem',
            }}
            codeTagProps={{ style: { fontFamily: 'ui-monospace, monospace' } }}
          >
            {TYPE2_TX_JSON}
          </SyntaxHighlighter>
        </div>
      </div>

      <h2 id="oracles-reality">
        <a href="#oracles-reality" className="anchor-link" aria-label="Link to this section">
          Oracles in practice
        </a>
      </h2>
      <p>
        In practice, computing gas estimates with EIP-1559 is resource
        intensive. Wallets that rely on public RPC endpoints are often subject
        to fair usage limits and are not optimized for those operations. As a
        result, wallets like MetaMask and services like Etherscan and Infura
        adapted their oracles to work with the new model. Instead of removing
        oracles, EIP-1559 reinforced their role: they now provide precomputed
        fee estimates based on the base fee and priority fee mechanism.
      </p>
      <p>
        EIP-1559 improved transaction prioritization and fairer fee
        distribution. But the original goal of eliminating oracle dependency
        remains largely unfulfilled. Oracles still dominate gas fee estimation.
      </p>

      <h2 id="base-fee-dynamics">
        <a href="#base-fee-dynamics" className="anchor-link" aria-label="Link to this section">
          Base fee dynamics
        </a>
      </h2>
      <p>
        The base fee adjusts each block according to a formula that compares the
        previous block's gas used to a gas target. The target is half the block
        gas limit (50% fullness). When the parent block used more gas than the
        target, the base fee for the next block goes up. When it used less, the
        base fee goes down. When it matches the target exactly, the base fee
        stays the same.
      </p>
      <p>
        The change is proportional: the further above or below the target the
        block was, the larger the adjustment. The formula uses a denominator of 8,
        so the maximum change per block is ±12.5%. For example, if the target is
        30M gas and a block uses 30M, the base fee is unchanged. If it uses 60M
        (full block, 2× target), the base fee increases by 12.5%. If it uses 15M
        (half the target), the base fee decreases by 6.25%.
      </p>
      <p>
        In math: let
      </p>
      <div className="gas-price-math">
        <BlockMath math="\text{gas\_target} = \frac{\text{block\_limit}}{2}" />
      </div>
      <p>
        If <InlineMath math="\text{gas\_used} > \text{gas\_target}" />, the base
        fee increases by
      </p>
      <div className="gas-price-math">
        <BlockMath math="\Delta = \max\left( \text{base\_fee} \times \frac{\text{gas\_used} - \text{gas\_target}}{\text{gas\_target} \times 8},\, 1 \right)" />
      </div>
      <p>
        If <InlineMath math="\text{gas\_used} < \text{gas\_target}" />, it
        decreases by
      </p>
      <div className="gas-price-math">
        <BlockMath math="\Delta = \text{base\_fee} \times \frac{\text{gas\_target} - \text{gas\_used}}{\text{gas\_target} \times 8}" />
      </div>
      <p>
        The denominator 8 caps the change at 12.5% per block. This keeps fee
        changes predictable and bounded. See{' '}
        <a
          href="https://eips.ethereum.org/EIPS/eip-1559"
          target="_blank"
          rel="noopener noreferrer"
        >
          EIP-1559
        </a>
        {' '}for the specification.
      </p>
      <EIP1559Demo />

      <h2 id="fee-structure">
        <a href="#fee-structure" className="anchor-link" aria-label="Link to this section">
          Base fee and priority fee
        </a>
      </h2>
      <p>
        The new model splits fees into two parts. The <strong>base fee</strong>{' '}
        is burned (removed from circulation) for every transaction. The{' '}
        <strong>priority fee</strong> goes to the block producer (miner or
        validator) as an incentive to include the transaction. The burn adds a
        deflationary element to Ethereum, reducing ETH supply over time.
      </p>
      <p>
        To track fee burning and its impact:{' '}
        <a
          href="https://ultrasound.money"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ultrasound Money
        </a>
        ,{' '}
        <a
          href="https://etherscan.io/gastracker"
          target="_blank"
          rel="noopener noreferrer"
        >
          Etherscan Gas Tracker
        </a>
        , and{' '}
        <a
          href="https://etherscan.io/chart/ethburned"
          target="_blank"
          rel="noopener noreferrer"
        >
          ETH Burned
        </a>
        .
      </p>

      <p className="page-next-link">
        <Link to="/ethereum/transactions/gas">← Gas</Link>
        {' · '}
        <Link to="/ethereum/transactions">Transactions →</Link>
      </p>
    </div>
  )
}
