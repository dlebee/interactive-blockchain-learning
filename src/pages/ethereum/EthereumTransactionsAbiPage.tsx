import { Link } from 'react-router-dom'
import { AbiDemo } from './AbiDemo'

export function EthereumTransactionsAbiPage() {
  return (
    <div className="page">
      <h1>ABI</h1>
      <p className="lead">
        The Application Binary Interface (ABI) is essentially a JSON representation
        of your Solidity contract. It describes the contract&apos;s interface so
        you know how to interact with it: function signatures, parameter types,
        return types, events, and more.
      </p>

      <h2 id="what-it-contains">
        <a href="#what-it-contains" className="anchor-link" aria-label="Link to this section">
          What the ABI contains
        </a>
      </h2>
      <p>
        The ABI lists everything you need to call the contract from outside:
        <strong>functions</strong> (with their names, input and output types, and
        state mutability such as view or payable), <strong>events</strong> (with
        indexed and non-indexed parameters), the         <strong>constructor</strong> (for deployment),         and in newer Solidity versions, <strong>errors</strong> and{' '}
        <strong>structs</strong>. With this JSON, an SDK can encode the correct
        calldata for a function call, decode return values, and parse emitted
        events from transaction receipts.
      </p>

      <h2 id="from-sol-to-abi">
        <a href="#from-sol-to-abi" className="anchor-link" aria-label="Link to this section">
          From Solidity to ABI: solc produces the JSON
        </a>
      </h2>
      <p>
        When you compile a Solidity contract with <strong>solc</strong> (the
        Solidity compiler), it outputs the ABI as a JSON file alongside the
        bytecode. The compiler reads your .sol source and generates this
        structured description of the contract interface. The animation below
        shows that flow: a Solidity file goes in, solc compiles it, and the ABI
        JSON comes out.
      </p>
      <AbiDemo />

      <p className="page-next-link">
        <Link to="/ethereum/transactions">← Transactions</Link>
      </p>
    </div>
  )
}
