import { useState, useEffect } from 'react'
import './ColdWalletDemo.css'

type Phase = 'idle' | 'connecting' | 'signing' | 'done'

export function ColdWalletDemo() {
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    if (phase === 'idle') {
      const t = setTimeout(() => setPhase('connecting'), 1500)
      return () => clearTimeout(t)
    }
    if (phase === 'connecting') {
      const t = setTimeout(() => setPhase('signing'), 1800)
      return () => clearTimeout(t)
    }
    if (phase === 'signing') {
      const t = setTimeout(() => setPhase('done'), 2000)
      return () => clearTimeout(t)
    }
  }, [phase])

  const handleReplay = () => setPhase('idle')

  return (
    <div className="cold-wallet-demo">
      <div className="cold-demo-layout">
        {/* Computer / app */}
        <div className="cold-demo-side cold-demo-app">
          <div className="cold-app-icon">📱</div>
          <span className="cold-app-label">dapp / wallet app</span>
          {phase !== 'idle' && (
            <span className={`cold-app-status ${phase === 'signing' ? 'active' : ''}`}>
              {phase === 'connecting' && 'Requesting signature…'}
              {phase === 'signing' && 'Awaiting approval on device'}
              {phase === 'done' && 'Signed ✓'}
            </span>
          )}
        </div>

        {/* Connection: USB or Bluetooth */}
        <div className="cold-demo-connector">
          <div className={`cold-connector-line ${phase !== 'idle' ? 'active' : ''}`} />
          <span className="cold-connector-label">
            {phase === 'idle' && 'Offline'}
            {phase === 'connecting' && 'USB / Bluetooth'}
            {phase === 'signing' && 'Connected'}
            {phase === 'done' && 'Disconnect'}
          </span>
        </div>

        {/* Cold wallet device */}
        <div className={`cold-demo-side cold-demo-device ${phase !== 'idle' ? 'connected' : ''}`}>
          <div className="cold-device-icon">
            {phase === 'idle' && '🔒'}
            {phase !== 'idle' && '📟'}
          </div>
          <span className="cold-device-label">Cold wallet</span>
          {phase === 'idle' && <span className="cold-device-status">Offline, keys never leave</span>}
          {phase === 'connecting' && <span className="cold-device-status">Connect to sign</span>}
          {phase === 'signing' && (
            <span className="cold-device-status active">Verify & approve on device</span>
          )}
          {phase === 'done' && <span className="cold-device-status">Keys still on device</span>}
        </div>
      </div>
      <p className="cold-demo-caption">
        Cold wallet stays offline. Only connects via USB or Bluetooth when you need to sign.
      </p>
      {phase === 'done' && (
        <button type="button" className="cold-demo-replay" onClick={handleReplay}>
          Replay
        </button>
      )}
    </div>
  )
}
