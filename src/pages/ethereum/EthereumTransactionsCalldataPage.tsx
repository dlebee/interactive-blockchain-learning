import { Link } from 'react-router-dom'
import { CalldataDemo } from './CalldataDemo'

export function EthereumTransactionsCalldataPage() {
  return (
    <div className="page">
      <h1>Calldata</h1>
      <p className="lead">
        The <strong>data</strong> field of a transaction that calls a contract
        is called calldata. It encodes which function to invoke and the arguments
        you pass.
      </p>

      <h2 id="interacting">
        <a href="#interacting" className="anchor-link" aria-label="Link to this section">
          Interacting with deployed contracts: how it works
        </a>
      </h2>
      <p>
        Once a contract is deployed, interacting with it requires two essential
        pieces of information: the <strong>ABI</strong> (Application Binary
        Interface) and the <strong>contract address</strong>. The contract
        address is the account address generated when the smart contract was
        deployed.
      </p>
      <p>
        In a typical transaction, the <strong>to</strong> field represents the
        recipient of Ether. When interacting with a smart contract, the{' '}
        <strong>to</strong> field points to the contract address. The magic
        happens in the <strong>data</strong> field, which contains all the
        information needed to call a specific function within the contract.
      </p>
      <p>
        The data field is RLP-encoded and includes the following:
      </p>
      <ul>
        <li>
          <strong>Function selector</strong>: The first 4 bytes represent the
          signature of the function being called, including its name and argument
          types.
        </li>
        <li>
          <strong>Encoded arguments</strong>: The subsequent bytes encode the
          input arguments in the order expected by the function, based on the
          contract&apos;s ABI.
        </li>
      </ul>
      <p>
        This makes the ABI critical for contract interactions. It not only
        defines the functions and their parameters but also provides the
        blueprint for encoding the data correctly. Without it, crafting or
        decoding interactions with the contract becomes nearly impossible.
      </p>

      <h2 id="weth9-example">
        <a href="#weth9-example" className="anchor-link" aria-label="Link to this section">
          Breaking down an EVM contract interaction: the WETH9 deposit call
        </a>
      </h2>
      <p>
        Use the interactive demo below to see how we build the calldata for a
        call to <code>deposit()</code> on WETH9 (Wrapped Ether): from the
        Solidity function, to the function selector, to the final transaction.
      </p>
      <CalldataDemo />

      <p className="page-next-link">
        <Link to="/ethereum/transactions">← Transactions</Link>
      </p>
    </div>
  )
}
