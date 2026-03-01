import { useState } from 'react'
import './StateChannelDemo.css'

const INITIAL_BALANCE = 5

type ChannelStatus = 'closed' | 'open' | 'settled'

interface ChannelState {
  status: ChannelStatus
  aliceBalance: number
  bobBalance: number
  offChainTxCount: number
}

export function StateChannelDemo() {
  const [channel, setChannel] = useState<ChannelState>({
    status: 'closed',
    aliceBalance: INITIAL_BALANCE,
    bobBalance: INITIAL_BALANCE,
    offChainTxCount: 0,
  })
  const [onChainTxCount, setOnChainTxCount] = useState(0)

  function openChannel() {
    setChannel({
      status: 'open',
      aliceBalance: INITIAL_BALANCE,
      bobBalance: INITIAL_BALANCE,
      offChainTxCount: 0,
    })
    setOnChainTxCount(1)
  }

  function pay(from: 'alice' | 'bob') {
    setChannel((prev) => {
      if (prev.status !== 'open') return prev
      const newAlice = from === 'alice' ? prev.aliceBalance - 1 : prev.aliceBalance + 1
      const newBob = from === 'bob' ? prev.bobBalance - 1 : prev.bobBalance + 1
      if (newAlice < 0 || newBob < 0) return prev
      return {
        ...prev,
        aliceBalance: newAlice,
        bobBalance: newBob,
        offChainTxCount: prev.offChainTxCount + 1,
      }
    })
  }

  function closeChannel() {
    setChannel((prev) => (prev.status === 'open' ? { ...prev, status: 'settled' } : prev))
    setOnChainTxCount(2)
  }

  function reset() {
    setChannel({
      status: 'closed',
      aliceBalance: INITIAL_BALANCE,
      bobBalance: INITIAL_BALANCE,
      offChainTxCount: 0,
    })
    setOnChainTxCount(0)
  }

  const { status, aliceBalance, bobBalance, offChainTxCount } = channel
  const isOpen = status === 'open'
  const isSettled = status === 'settled'
  const isClosed = status === 'closed'

  return (
    <div className="sc-demo">
      <div className="sc-parties">
        <div className="sc-party">
          <span className="sc-party-name">Alice</span>
          <span className="sc-party-balance">
            {aliceBalance} <span className="sc-unit">coins</span>
          </span>
          {isOpen && (
            <button
              className="sc-pay-btn"
              onClick={() => pay('alice')}
              disabled={aliceBalance === 0}
            >
              Pay Bob 1
            </button>
          )}
        </div>

        <div className="sc-channel-middle">
          <div className={`sc-channel-line ${isOpen ? 'sc-channel-active' : ''}`} />
          <div className="sc-channel-label">
            {isClosed && 'No channel'}
            {isOpen &&
              `${offChainTxCount} off-chain tx${offChainTxCount !== 1 ? 's' : ''}`}
            {isSettled && 'Settled'}
          </div>
        </div>

        <div className="sc-party">
          <span className="sc-party-name">Bob</span>
          <span className="sc-party-balance">
            {bobBalance} <span className="sc-unit">coins</span>
          </span>
          {isOpen && (
            <button
              className="sc-pay-btn"
              onClick={() => pay('bob')}
              disabled={bobBalance === 0}
            >
              Pay Alice 1
            </button>
          )}
        </div>
      </div>

      <div className="sc-chain-panel">
        <div className="sc-chain-label">On-chain activity</div>
        <div className="sc-chain-txs">
          {onChainTxCount === 0 && (
            <span className="sc-chain-empty">No transactions yet</span>
          )}
          {onChainTxCount >= 1 && (
            <div className="sc-chain-tx sc-tx-open">
              <span className="sc-tx-tag">Open</span>
              <span>
                Channel funded: {INITIAL_BALANCE} + {INITIAL_BALANCE} locked
              </span>
            </div>
          )}
          {onChainTxCount >= 2 && (
            <div className="sc-chain-tx sc-tx-close">
              <span className="sc-tx-tag">Close</span>
              <span>
                Settled: Alice {aliceBalance} · Bob {bobBalance}
              </span>
            </div>
          )}
        </div>
        <div className="sc-stat">
          {offChainTxCount} off-chain · {onChainTxCount} on-chain
        </div>
      </div>

      <div className="sc-controls">
        {isClosed && (
          <button className="sc-btn sc-btn-primary" onClick={openChannel}>
            Open Channel
          </button>
        )}
        {isOpen && (
          <button className="sc-btn sc-btn-danger" onClick={closeChannel}>
            Close Channel
          </button>
        )}
        {isSettled && (
          <button className="sc-btn" onClick={reset}>
            Reset
          </button>
        )}
      </div>

      <p className="sc-caption">
        {isClosed && 'Open a channel to start exchanging off-chain payments.'}
        {isOpen && 'Payments between Alice and Bob happen instantly, off-chain.'}
        {isSettled &&
          `${offChainTxCount} payment${offChainTxCount !== 1 ? 's' : ''} settled with only 2 on-chain transactions.`}
      </p>
    </div>
  )
}
