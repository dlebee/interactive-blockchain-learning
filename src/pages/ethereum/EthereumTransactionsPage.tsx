import { Link } from 'react-router-dom'
import { EthereumTransactionTypeVisual } from './EthereumTransactionTypesDemo'
import { FromFieldSignatureFlow } from './FromFieldSignatureFlow'
import { BroadcastingStoryboard } from './BroadcastingStoryboard'

export function EthereumTransactionsPage() {
  return (
    <div className="page">
      <h1>Transactions</h1>
      <p className="lead">
        Without going into details of which type of transaction, we first
        explain the common part of all Ethereum transactions. Then we look at
        the three most common kinds: sending ETH, calling a contract, and
        deploying a contract.
      </p>

      <h2 id="components">
        <a href="#components" className="anchor-link" aria-label="Link to this section">
          Understanding the components of EVM transactions
        </a>
      </h2>
      <p>
        Every EVM transaction includes a set of key fields that define its
        purpose and behavior. Here&apos;s a quick overview:
      </p>
      <ul>
        <li>
          <strong>Type</strong>: The transaction type. We&apos;ll keep that a
          mystery for now and address it later.
        </li>
        <li>
          <strong>From</strong>: The account submitting the transaction. It
          isn&apos;t stored in the transaction data; it&apos;s derived from the
          signature (see <a href="#from-field">The mystery of the from field</a>
          below).
        </li>
        <li>
          <strong>To</strong>: The account or smart contract receiving the
          transaction.
        </li>
        <li>
          <strong>Value</strong>: The amount of native currency (ETH) being
          transferred.
        </li>
        <li>
          <strong>Gas limit</strong>: The maximum computational resources the
          transaction is allowed to consume, measured in gas units.
        </li>
        <li>
          <strong>Gas price</strong>, or the newer <strong>max fee per gas</strong>{' '}
          and <strong>max priority fee per gas</strong>: These determine the
          transaction&apos;s cost based on current network activity.
        </li>
        <li>
          <strong>Data</strong>: A versatile field used for more complex
          transactions. It plays a crucial role when interacting with smart
          contracts; we&apos;ll see that in the sections below.
        </li>
        <li>
          <strong>Nonce</strong>: An ordered number per account so transactions
          are ordered and replay is prevented. See the{' '}
          <Link to="/transaction-inclusion/nonce">nonce section referenced earlier</Link>.
        </li>
      </ul>

      <h3 id="from-field">
        <a href="#from-field" className="anchor-link" aria-label="Link to this section">
          The mystery of the from field: deduction through signatures
        </a>
      </h3>
      <p>
        The <strong>from</strong> field is central to any transaction, but it is
        not explicitly part of the transaction data. Instead, it is deduced
        during verification by decoding the signature included in the
        transaction.
      </p>
      <h4>How it works: the signature and RSV values</h4>
      <p>
        Each transaction includes a cryptographic signature with three
        components:
      </p>
      <ul>
        <li>
          <strong>R</strong>: A 32-byte value representing part of the elliptic
          curve point.
        </li>
        <li>
          <strong>S</strong>: Another 32-byte value, also derived from the
          elliptic curve signature.
        </li>
        <li>
          <strong>V</strong>: A single byte (the recovery identifier) which helps
          determine which of the two possible public keys is correct.
        </li>
      </ul>
      <p>
        Using these RSV values, the EVM can recover the signer&apos;s address:
      </p>
      <ol>
        <li>
          <strong>Recover the public key</strong>: Using the elliptic curve
          recovery algorithm (ECDSA), the EVM derives the public key from the
          signature.
        </li>
        <li>
          <strong>Derive the address</strong>: An Ethereum address is the last
          20 bytes of the Keccak-256 hash of that public key.
        </li>
      </ol>
      <p>
        So while <strong>from</strong> is conceptually part of the transaction,
        it is technically derived, not stored. That design avoids redundancy and
        ties the sender to the signature, so the transaction is
        cryptographically bound to the account that authorized it. For how
        signing and key recovery work, see the{' '}
        <Link to="/account">asymmetric encryption section explained earlier</Link>.
      </p>
      <FromFieldSignatureFlow />

      <h2 id="typical-activities">
        <a href="#typical-activities" className="anchor-link" aria-label="Link to this section">
          Three typical activities
        </a>
      </h2>
      <p>
        Users commonly do three things with transactions: send native currency
        (ETH), interact with a smart contract, or deploy a contract. Here is how
        each uses the <strong>to</strong>, <strong>value</strong>, and{' '}
        <strong>data</strong> fields.
      </p>

      <h3 id="send-native">
        <a href="#send-native" className="anchor-link" aria-label="Link to this section">
          Send native currency
        </a>
      </h3>
      <p>
        The most basic transaction is to send native currency (ETH) between two
        EVM addresses. You set the recipient in the <strong>to</strong> field
        (another user&apos;s EOA), the amount in the <strong>value</strong>{' '}
        field, and leave <strong>data</strong> empty. You choose the right
        nonce; see the <Link to="/transaction-inclusion/nonce">nonce section referenced earlier</Link>.
      </p>
      <EthereumTransactionTypeVisual type="send" />

      <h3 id="interact-contract">
        <a href="#interact-contract" className="anchor-link" aria-label="Link to this section">
          Interact with a smart contract
        </a>
      </h3>
      <p>
        The second most common interaction is to interact with a smart contract.
        Put the <strong>contract address</strong> in the <strong>to</strong>{' '}
        field instead of another user&apos;s address (EOA). Include a{' '}
        <strong>data</strong> field that defines which function to call inside
        the contract and the arguments for it. The <strong>value</strong>{' '}
        field can be zero or used to send ETH to a payable function.
      </p>
      <EthereumTransactionTypeVisual type="contract" />

      <h3 id="deploy-contract">
        <a href="#deploy-contract" className="anchor-link" aria-label="Link to this section">
          Deploy a contract
        </a>
      </h3>
      <p>
        The third common type is to deploy a contract. Do not supply a{' '}
        <strong>to</strong> field. Put the <strong>bytecode</strong> of the
        compiled Solidity contract into the <strong>data</strong> field. The
        network creates the contract and assigns it an address (derived from
        your address and nonce). Nonce management applies as in the{' '}
        <Link to="/transaction-inclusion/nonce">nonce section referenced earlier</Link>.
      </p>
      <EthereumTransactionTypeVisual type="deploy" />

      <h2 id="broadcasting">
        <a href="#broadcasting" className="anchor-link" aria-label="Link to this section">
          Broadcasting a transaction
        </a>
      </h2>
      <p>
        Once you have built a transaction (to, value, data, nonce, gas) and
        signed it, you send it to the network. When you do, the blockchain
        returns a <strong>transaction hash</strong> based on the content of
        your transaction; that hash is unique to this transaction.
      </p>
      <p>
        You can then continuously check whether the transaction has been
        included using that transaction hash. The chain will eventually return
        a <strong>receipt</strong>, which tells you if the transaction
        succeeded or failed and other relevant information about the inclusion
        of your transaction. To go deeper into how transactions get into
        blocks, read the{' '}
        <Link to="/transaction-inclusion">Transaction Inclusion section in core concepts</Link>.
      </p>
      <BroadcastingStoryboard />

      <p className="page-next-link">
        <Link to="/ethereum/introduction">← Introduction</Link>
      </p>
    </div>
  )
}
