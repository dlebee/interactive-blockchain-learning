import { useState, useEffect } from 'react'
import './PosStakeSlashDemo.css'

type Phase = 'stake' | 'reward' | 'slash'

export function PosStakeSlashDemo() {
  const [phase, setPhase] = useState<Phase>('stake')

  useEffect(() => {
    const order: Phase[] = ['stake', 'reward', 'slash']
    const id = setInterval(() => {
      setPhase((p) => order[(order.indexOf(p) + 1) % order.length])
    }, 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="pos-stake-slash-demo">
      <div className="pos-outcomes">
        <div className={`pos-card ${phase === 'stake' ? 'active' : ''}`}>
          <div className="pos-card-icon">🔒</div>
          <strong>Stake</strong>
          <p>Validator locks native currency as collateral</p>
        </div>
        <div className={`pos-card ${phase === 'reward' ? 'active' : ''}`}>
          <div className="pos-card-icon reward">✓</div>
          <strong>Good behavior</strong>
          <p>Receives rewards</p>
        </div>
        <div className={`pos-card ${phase === 'slash' ? 'active' : ''}`}>
          <div className="pos-card-icon slash">✕</div>
          <strong>Poor behavior</strong>
          <p>Stake slashed (intentional or not)</p>
        </div>
      </div>
      <p className="pos-demo-caption">
        Staking aligns incentives: validators earn rewards for correct behavior and lose stake for violations.
      </p>
    </div>
  )
}
