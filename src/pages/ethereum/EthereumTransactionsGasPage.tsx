import { Link } from 'react-router-dom'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { GasStackTraceDemo } from './GasStackTraceDemo'
import './EthereumTransactionsGasPage.css'

const ETHERS_ESTIMATE_SAMPLE = `const contract = new ethers.Contract(address, abi, signer);

/* Estimate gas for the call */
const estimatedGas = await contract.transfer.estimateGas(to, amount);

/* Add 35% buffer */
const gasLimit = (estimatedGas * 135n) / 100n;

/* Send with buffered gas limit */
const tx = await contract.transfer(to, amount, { gasLimit });
await tx.wait();`

export function EthereumTransactionsGasPage() {
  return (
    <div className="page">
      <h1>Gas</h1>
      <p className="lead">
        Gas is the unit of computational work on the EVM. Every operation costs
        gas; the gas limit caps how much work a transaction can do.
      </p>

      <h2 id="opcodes">
        <a href="#opcodes" className="anchor-link" aria-label="Link to this section">
          Opcodes and pricing
        </a>
      </h2>
      <p>
        The Ethereum Virtual Machine executes bytecode as a sequence of{' '}
        <strong>opcodes</strong>, one per operation. Each opcode has a fixed gas
        cost. The prices are calibrated so that no single operation can delay
        block production past its slot. If a block is due at time T, expensive
        ops must still fit within the block time.
      </p>
      <p>
        This design has two consequences. First, smart contract transaction costs
        depend heavily on the code being executed: a simple transfer uses little
        gas, while a complex calculation or many storage writes uses much more.
        Second, the exact gas cost of a transaction is hard to know in advance.
        You can estimate it, but you cannot be certain until the transaction
        runs.
      </p>
      <GasStackTraceDemo />

      <h2 id="base-cost">
        <a href="#base-cost" className="anchor-link" aria-label="Link to this section">
          Base cost
        </a>
      </h2>
      <p>
        The base cost of a transaction is typically <strong>21,000</strong> gas.
        This covers the overhead of processing any transaction: signature
        verification, nonce check, balance update for the value transfer, and so
        on.
      </p>

      <h2 id="calldata-cost">
        <a href="#calldata-cost" className="anchor-link" aria-label="Link to this section">
          Calldata pricing
        </a>
      </h2>
      <p>
        Calldata (the <code>data</code> field) is priced per byte. The cost
        depends on whether the byte is zero or non zero:
      </p>
      <ul>
        <li>
          <strong>Zero bytes</strong>: 4 gas per byte
        </li>
        <li>
          <strong>Non zero bytes</strong>: 16 gas per byte
        </li>
      </ul>
      <p>
        A native transfer has no calldata, so it costs exactly 21,000 gas.
        Contract calls and deployments add calldata cost on top of the base.
      </p>
      <p>
        A <strong>contract deployment</strong> is just the cost of the calldata.
        The bytecode you deploy is stored in the transaction data; it is priced
        the same way as any other calldata.
      </p>

      <figure className="page-figure">
        <blockquote>
          <p>
            Zero bytes cost less than non zero bytes (4 vs 16 gas). ABI encoding
            pads each value to 32 bytes, so calldata tends to have many zeros.
            Someone might think padding is wasteful, but it has a purpose: it
            helps avoid hash collisions and keeps identifiers unique. Packed
            encoding without padding can produce identical bytes for different
            inputs. See{' '}
            <a
              href="https://docs.soliditylang.org/en/latest/abi-spec.html#abi-encode-packed"
              target="_blank"
              rel="noopener noreferrer"
            >
              Solidity&apos;s abi.encodePacked and the hash collision problem
            </a>
            .
          </p>
        </blockquote>
      </figure>

      <h2 id="estimate-gas">
        <a href="#estimate-gas" className="anchor-link" aria-label="Link to this section">
          Estimating gas
        </a>
      </h2>
      <p>
        Nodes expose an <code>eth_estimateGas</code> RPC method so users can
        approximate how much gas a transaction will use. You submit the same
        transaction parameters (to, value, data, etc.) without sending it; the
        node simulates execution and returns an estimate. That estimate feeds
        into the <strong>gas limit</strong> field when you build the real
        transaction. The gas limit is the maximum gas you are willing to spend;
        any unused gas is refunded.
      </p>

      <h3 id="estimate-gas-uncertainty">
        <a href="#estimate-gas-uncertainty" className="anchor-link" aria-label="Link to this section">
          Why wallets add a buffer
        </a>
      </h3>
      <p>
        In a permissionless chain where contracts have constant activity, your
        estimation may differ by the time the transaction actually executes.
        Contract state can change between estimate and execution. Different nodes
        and clients may also report slightly different estimates. To avoid
        losing native currency, most wallets add a buffer of around 35% on top of
        the gas limit returned by the RPC.
      </p>

      <div className="gas-code-collapse">
        <details>
          <summary>ethers.js: estimateGas with 35% buffer</summary>
          <div className="gas-code-block">
            <SyntaxHighlighter
              language="javascript"
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: '1rem 1.25rem',
                borderRadius: '0 0 8px 8px',
                fontSize: '0.85rem',
              }}
              codeTagProps={{ style: { fontFamily: 'ui-monospace, monospace' } }}
            >
              {ETHERS_ESTIMATE_SAMPLE}
            </SyntaxHighlighter>
          </div>
        </details>
      </div>

      <figure className="page-figure">
        <blockquote>
          <p>
            If a transaction runs out of gas before completing, it fails. You
            still pay the fee for the gas that was consumed. You get no refund,
            and the transaction does not go through. Setting the gas limit too
            low risks losing your fee for nothing. That is why wallets use a
            buffer.
          </p>
          <p>
            See{' '}
            <a
              href="https://github.com/MetaMask/core/blob/b0fd6ae86eb26d4c0629aa7739a5c1c92ff49cf5/packages/transaction-controller/src/utils/gas.ts#L196"
              target="_blank"
              rel="noopener noreferrer"
            >
              MetaMask&apos;s gas buffer implementation
            </a>
            .
          </p>
        </blockquote>
      </figure>

      <h2 id="block-gas-limit">
        <a href="#block-gas-limit" className="anchor-link" aria-label="Link to this section">
          Block gas limit
        </a>
      </h2>
      <p>
        Every block has a <strong>block gas limit</strong>. This caps how much
        total processing can occur in a single block. The sum of all transaction
        gas limits in that block cannot exceed it. That keeps block production
        predictable and prevents blocks from growing unbounded. See{' '}
        <Link to="/blockspace">blockspace</Link> for why protocols cap size and
        time.
      </p>
      <p>
        Some blockchains add a <strong>transaction max gas limit</strong> on top
        of the block limit. That ensures a single transaction cannot take the
        whole block. Without it, one large tx could fill a block and crowd out
        others. It also prepares for parallel execution: a capped gas limit per
        tx forces bounded work per transaction, which lets you partition the
        block and run transactions in parallel. See{' '}
        <a
          href="https://eips.ethereum.org/EIPS/eip-7825"
          target="_blank"
          rel="noopener noreferrer"
        >
          EIP-7825
        </a>
        ,{' '}
        <a
          href="https://blog.ethereum.org/2025/10/21/fusaka-gascap-update"
          target="_blank"
          rel="noopener noreferrer"
        >
          Fusaka update
        </a>
        , the{' '}
        <a
          href="https://archive.devcon.org/archive/watch/6/challenges-of-parallelizability-under-ethereums-execution-model/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Devcon talk on parallelizability
        </a>
        , and{' '}
        <a
          href="https://docs.zksync.io/zksync-protocol/evm-interpreter/evm-gas-interpretation"
          target="_blank"
          rel="noopener noreferrer"
        >
          zkSync EVM gas interpretation
        </a>
        .
      </p>
      <p>
        Different chains choose different block gas limits. Higher limits allow
        more transactions per block but increase validation load and propagation
        time. Lower limits keep blocks smaller and faster to validate.
      </p>
      <p>
        <strong>Ethereum mainnet</strong> (Fusaka) and <strong>Base</strong> both
        enforce a per-transaction gas limit. Others rely only on the block limit
        for now.
      </p>
      <table className="gas-table">
        <thead>
          <tr>
            <th>Chain</th>
            <th>Block gas limit (approx.)</th>
            <th>Per-tx gas limit (approx.)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ethereum Mainnet</td>
            <td>60M</td>
            <td>~16.78M</td>
          </tr>
          <tr>
            <td>Creditcoin</td>
            <td>75M</td>
            <td>N/A</td>
          </tr>
          <tr>
            <td>BNB Smart Chain (BSC)</td>
            <td>~140M</td>
            <td>N/A</td>
          </tr>
          <tr>
            <td>Base</td>
            <td>300M</td>
            <td>25M</td>
          </tr>
        </tbody>
      </table>
      <p>
        These values can change over time; validators and governance may adjust
        limits based on network conditions and upgrades.
      </p>

      <p className="page-next-link">
        <Link to="/ethereum/transactions">← Transactions</Link>
        {' · '}
        <Link to="/ethereum/transactions/gas-price">Gas Price →</Link>
      </p>
    </div>
  )
}
