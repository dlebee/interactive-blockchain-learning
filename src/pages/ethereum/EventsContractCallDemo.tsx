import './EventsContractCallDemo.css'

export function EventsContractCallDemo() {
  return (
    <div className="events-call-demo">
      <h4 className="events-demo-subtitle">Which contract emitted which event? User calls A, A calls B. Each emits its own event.</h4>
      <div className="events-call-diagram">
        <div className="events-row events-calls-row">
          <div className="events-call-node events-user">
            <span className="events-node-label">User</span>
            <span className="events-node-hint">sends tx</span>
          </div>
          <div className="events-arrow-horizontal">
            <span className="events-arrow-line" />
            <span className="events-arrow-head" />
          </div>
          <div className="events-contract-block">
            <div className="events-call-node events-contract">
              <span className="events-node-label">Contract A</span>
              <span className="events-node-hint">Router</span>
            </div>
            <div className="events-arrow-vertical">
              <span className="events-arrow-v-line" />
              <span className="events-arrow-v-head" />
            </div>
            <span className="events-event-badge events-badge-a">emits RouteExecuted</span>
          </div>
          <div className="events-arrow-horizontal">
            <span className="events-arrow-line" />
            <span className="events-arrow-head" />
          </div>
          <div className="events-contract-block">
            <div className="events-call-node events-contract">
              <span className="events-node-label">Contract B</span>
              <span className="events-node-hint">Token</span>
            </div>
            <div className="events-arrow-vertical">
              <span className="events-arrow-v-line" />
              <span className="events-arrow-v-head" />
            </div>
            <span className="events-event-badge events-badge-b">emits Transfer</span>
          </div>
        </div>
      </div>
      <p className="events-demo-caption">
        Each log has an <strong>address</strong> field: A&apos;s log has A&apos;s address, B&apos;s log has B&apos;s address.
      </p>

      <div className="events-separator" />

      <div className="events-receipt-section">
        <span className="events-receipt-label">Transaction receipt</span>
        <div className="events-receipt-block">
          <div className="events-receipt-slots">
            <div className="events-receipt-slot">
              <span className="events-slot-key">status</span>
              <span className="events-slot-val">success</span>
            </div>
            <div className="events-receipt-slot">
              <span className="events-slot-key">blockNumber</span>
              <span className="events-slot-val">18,450,221</span>
            </div>
            <div className="events-receipt-slot">
              <span className="events-slot-key">gasUsed</span>
              <span className="events-slot-val">85,000</span>
            </div>
          </div>
          <div className="events-receipt-logs-wrap">
            <span className="events-logs-header">logs</span>
            <div className="events-logs-array">
              <div className="events-log-block events-log-a">
                <div className="events-log-slot">
                  <span className="events-slot-key">address</span>
                  <span className="events-slot-val">0xContractA...</span>
                </div>
                <div className="events-log-slot">
                  <span className="events-slot-key">topics[0]</span>
                  <span className="events-slot-right">
                    <span className="events-slot-val">0x8f2a3b4c...</span>
                    <span className="events-slot-hint">hash(RouteExecuted(...))</span>
                  </span>
                </div>
                <div className="events-log-slot">
                  <span className="events-slot-key">data</span>
                  <span className="events-slot-val">0x</span>
                </div>
              </div>
              <div className="events-log-block events-log-b">
                <div className="events-log-slot">
                  <span className="events-slot-key">address</span>
                  <span className="events-slot-val">0xContractB...</span>
                </div>
                <div className="events-log-slot">
                  <span className="events-slot-key">topics[0]</span>
                  <span className="events-slot-right">
                    <span className="events-slot-val">0xddf252ad...</span>
                    <span className="events-slot-hint">hash(Transfer(address,address,uint256))</span>
                  </span>
                </div>
                <div className="events-log-slot">
                  <span className="events-slot-key">topics[1]</span>
                  <span className="events-slot-val">0xFrom... (indexed)</span>
                </div>
                <div className="events-log-slot">
                  <span className="events-slot-key">topics[2]</span>
                  <span className="events-slot-val">0xTo... (indexed)</span>
                </div>
                <div className="events-log-slot">
                  <span className="events-slot-key">data</span>
                  <span className="events-slot-val">0x... (amount)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
