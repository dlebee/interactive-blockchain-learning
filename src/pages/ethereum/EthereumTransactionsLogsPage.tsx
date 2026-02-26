import { Link } from 'react-router-dom'
import { EventsContractCallDemo } from './EventsContractCallDemo'
import { EventsWhoUsesDemo } from './EventsWhoUsesDemo'
import './EthereumTransactionsLogsPage.css'

export function EthereumTransactionsLogsPage() {
  return (
    <div className="page">
      <h1>Logs</h1>
      <p className="lead">
        Smart contract developers emit events when something factual has occurred.
        The best known are ERC-20 and ERC-721 <code>Transfer</code> events.
        They can emit any event they define. Each event becomes a log attached
        to the transaction receipt. Only successful transactions have logs:
        Ethereum does not support logs for reverted transactions. If a transaction
        reverts, it will not have any events.
      </p>

      <h2 id="log-structure">
        <a href="#log-structure" className="anchor-link" aria-label="Link to this section">
          Log structure: topics and data
        </a>
      </h2>
      <p>
        Each log typically has an address field, a list of topics, and a data
        field:
      </p>

      <div className="log-table-uml-row">
        <table className="log-structure-table">
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>address</strong></td>
            <td>The contract that emitted the event.</td>
          </tr>
          <tr>
            <td><strong>topics[0]</strong></td>
            <td>
              The event signature, the Keccak-256 hash of the event name and
              parameter types (e.g. <code>Transfer(address,address,uint256)</code>).
            </td>
          </tr>
          <tr>
            <td><strong>topics[1..N]</strong></td>
            <td>
              One topic per indexed field of the event, in order. Indexed fields
              allow efficient filtering when querying logs.
            </td>
          </tr>
          <tr>
            <td><strong>data</strong></td>
            <td>
              All non-indexed fields, ABI-encoded (same encoding as calldata
              arguments).
            </td>
          </tr>
        </tbody>
        </table>
        <div className="log-uml-wrap" aria-label="UML class diagram: Receipt 1 to many Logs">
          <div className="log-uml-diagram">
            <div className="log-uml-box log-uml-receipt">
              <div className="log-uml-header">Receipt</div>
              <div className="log-uml-sep" />
              <div className="log-uml-attrs">
                <div className="log-uml-attr">status</div>
                <div className="log-uml-attr">blockNumber</div>
                <div className="log-uml-attr">gasUsed</div>
                <div className="log-uml-attr">logs : Log[]</div>
              </div>
            </div>
            <div className="log-uml-connector">
              <span className="log-uml-card">1</span>
              <span className="log-uml-line" />
              <span className="log-uml-card">*</span>
            </div>
            <div className="log-uml-box log-uml-log">
              <div className="log-uml-header">Log</div>
              <div className="log-uml-sep" />
              <div className="log-uml-attrs">
                <div className="log-uml-attr">address</div>
                <div className="log-uml-attr">topics : bytes32[]</div>
                <div className="log-uml-attr">data : bytes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 id="which-contract">
        <a href="#which-contract" className="anchor-link" aria-label="Link to this section">
          Which contract emitted the event
        </a>
      </h2>
      <p>
        Because contracts can call other contracts, one important field in each
        log is the <strong>address</strong> of the contract that emitted the
        event. A user may call Contract A, which then calls Contract B. If B
        emits an event, the log&apos;s address will be B, not A.
      </p>
      <EventsContractCallDemo />

      <h2 id="who-uses-events">
        <a href="#who-uses-events" className="anchor-link" aria-label="Link to this section">
          Who uses events
        </a>
      </h2>
      <EventsWhoUsesDemo />

      <h2 id="event-signature">
        <a href="#event-signature" className="anchor-link" aria-label="Link to this section">
          Same signature for different Transfer events
        </a>
      </h2>
      <p>
        ERC-20 and ERC-721 both define a <code>Transfer</code> event with a
        slight difference: ERC-721 has three indexed fields, ERC-20 has two.
      </p>
      <pre className="logs-code-block">
        <code>{`// ERC-20
event Transfer(address indexed from, address indexed to, uint256 value);

// ERC-721
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);`}</code>
      </pre>
      <p>
        The event signature (Topic 0) is derived only from the event name and
        parameter types. The <code>indexed</code> keyword is <strong>not</strong>{' '}
        part of the hash, so both share the same signature:
      </p>
      <pre className="logs-code-block">
        <code>keccak256(&quot;Transfer(address,address,uint256)&quot;) = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef</code>
      </pre>

      <p className="page-next-link">
        <Link to="/ethereum/transactions">← Transactions</Link>
      </p>
    </div>
  )
}
