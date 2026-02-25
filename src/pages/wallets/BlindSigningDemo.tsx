import './BlindSigningDemo.css'

type Phase = 'refuse' | 'offer' | 'blind-sign' | 'hacked' | 'result'

const PANELS: { id: Phase; title: string; caption: string }[] = [
  {
    id: 'refuse',
    title: '1. Cold wallet refuses',
    caption: 'Transaction too complex to display. Device cannot verify it, so it refuses to sign.',
  },
  {
    id: 'offer',
    title: '2. Blind signing offered',
    caption: 'The wallet offers to enable blind signing: sign without seeing what you are signing.',
  },
  {
    id: 'blind-sign',
    title: '3. You approve blindly',
    caption: 'Dapp sends a transaction → cold wallet signs it → you have no way to verify what it was.',
  },
  {
    id: 'hacked',
    title: '4. Dapp is compromised',
    caption: 'Malicious software swaps your “swap tokens” request for “transfer all funds to attacker.”',
  },
  {
    id: 'result',
    title: '5. Outcome',
    caption: 'Private key never left the device. But funds are gone if you signed the wrong transaction.',
  },
]

export function BlindSigningDemo() {
  return (
    <div className="blind-signing-demo">
      <h4 className="blind-storyboard-title">Storyboard: what happens with blind signing</h4>

      <div className="blind-storyboard">
        {PANELS.map((panel, i) => (
          <div key={panel.id} className="blind-panel">
              <div className="blind-panel-frame">
                <span className="blind-panel-num">{i + 1}</span>
                <div className="blind-panel-scene">
                  {panel.id === 'refuse' && (
                    <svg viewBox="0 0 60 50" className="blind-scene-svg">
                      <rect x="15" y="10" width="30" height="25" rx="3" fill="rgba(51,65,85,0.8)" stroke="#64748b" />
                      <path d="M20 22 L40 33 M40 22 L20 33" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="30" cy="38" r="4" fill="rgba(249,115,22,0.4)" stroke="#f97316" />
                    </svg>
                  )}
                  {panel.id === 'offer' && (
                    <svg viewBox="0 0 60 50" className="blind-scene-svg">
                      <rect x="10" y="15" width="40" height="8" rx="2" fill="rgba(51,65,85,0.8)" stroke="#64748b" />
                      <circle cx="48" cy="19" r="5" fill="rgba(249,115,22,0.3)" stroke="#f97316" strokeWidth="1.5" />
                      <text x="30" y="38" fill="#94a3b8" fontSize="6" textAnchor="middle">Enable?</text>
                    </svg>
                  )}
                  {panel.id === 'blind-sign' && (
                    <svg viewBox="0 0 60 50" className="blind-scene-svg">
                      <rect x="5" y="15" width="18" height="12" rx="2" fill="rgba(51,65,85,0.8)" stroke="#64748b" />
                      <path d="M25 21 L35 21" stroke="#06b6d4" strokeWidth="1.5" />
                      <rect x="38" y="15" width="18" height="12" rx="2" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" />
                      <path d="M58 21 L65 21" stroke="#22c55e" strokeWidth="1" strokeDasharray="2 1" />
                    </svg>
                  )}
                  {panel.id === 'hacked' && (
                    <svg viewBox="0 0 60 50" className="blind-scene-svg" aria-label="Hacker icon">
                      {/* Hacker: hooded figure, mask, sinister look */}
                      <path d="M15 42 Q15 28 30 25 Q45 28 45 42" fill="rgba(51,65,85,0.8)" stroke="#64748b" />
                      <ellipse cx="30" cy="20" rx="12" ry="10" fill="rgba(30,41,59,0.95)" stroke="#ef4444" strokeWidth="1.5" />
                      <rect x="22" y="18" width="16" height="8" rx="1" fill="rgba(239,68,68,0.4)" stroke="#ef4444" strokeWidth="1" />
                      <circle cx="26" cy="22" r="1.5" fill="#ef4444" />
                      <circle cx="34" cy="22" r="1.5" fill="#ef4444" />
                    </svg>
                  )}
                  {panel.id === 'result' && (
                    <svg viewBox="0 0 60 50" className="blind-scene-svg">
                      <rect x="8" y="8" width="20" height="18" rx="2" fill="rgba(34,197,94,0.15)" stroke="#22c55e" />
                      <path d="M14 14 L22 14 M14 18 L20 18" stroke="#22c55e" strokeWidth="1" />
                      <rect x="32" y="8" width="20" height="18" rx="2" fill="rgba(239,68,68,0.15)" stroke="#ef4444" />
                      <path d="M38 14 L46 14 M38 18 L44 18" stroke="#ef4444" strokeWidth="1" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="blind-panel-title">{panel.title}</p>
              <p className="blind-panel-caption">{panel.caption}</p>
            </div>
        ))}
      </div>
    </div>
  )
}
