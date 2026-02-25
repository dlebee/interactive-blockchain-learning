import './HotWalletRiskDemo.css'

const W = 420
const H = 220

export function HotWalletRiskDemo() {
  return (
    <div className="hot-wallet-risk-demo">
      <svg viewBox={`0 0 ${W} ${H}`} className="hot-risk-svg" aria-label="Hot wallet constantly exposed to internet threats">
        <defs>
          <linearGradient id="hot-internet-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.05)" />
          </linearGradient>
          <linearGradient id="hot-danger-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0.1)" />
          </linearGradient>
        </defs>

        {/* Internet / cloud */}
        <g transform="translate(20, 40)">
          <ellipse cx="35" cy="25" rx="28" ry="18" fill="rgba(51, 65, 85, 0.6)" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" />
          <text x="35" y="30" fill="#94a3b8" fontSize="10" textAnchor="middle">Internet</text>
        </g>

        {/* Connection line - always on */}
        <line x1="75" y1="70" x2="140" y2="110" stroke="url(#hot-internet-grad)" strokeWidth="2" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.5s" repeatCount="indefinite" />
        </line>

        {/* Threat arrows from internet to wallet */}
        <g className="hot-threats">
          <circle r="4" fill="#ef4444" opacity="0.9">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 50 55 L 160 105" />
          </circle>
          <circle r="3" fill="#f87171" opacity="0.8">
            <animateMotion dur="2.3s" repeatCount="indefinite" begin="0.4s" path="M 45 75 L 155 112" />
          </circle>
          <circle r="3" fill="#ef4444" opacity="0.85">
            <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.8s" path="M 55 85 L 165 115" />
          </circle>
          <circle r="3" fill="#f87171" opacity="0.8">
            <animateMotion dur="2.1s" repeatCount="indefinite" begin="1.2s" path="M 48 95 L 158 118" />
          </circle>
        </g>

        {/* Hot wallet (browser/extension) */}
        <g transform="translate(160, 85)">
          <rect x="0" y="0" width="100" height="55" rx="6" fill="rgba(30, 41, 59, 0.9)" stroke="rgba(249, 115, 22, 0.5)" strokeWidth="2" />
          <rect x="4" y="4" width="92" height="16" rx="3" fill="rgba(51, 65, 85, 0.8)" />
          <rect x="70" y="7" width="22" height="10" rx="2" fill="rgba(249, 115, 22, 0.4)" stroke="rgba(249, 115, 22, 0.6)" strokeWidth="1" />
          <text x="81" y="14" fill="#fdba74" fontSize="8" textAnchor="middle">Wallet</text>
          <text x="50" y="40" fill="#94a3b8" fontSize="9" textAnchor="middle">Connected</text>
          <text x="50" y="50" fill="#67e8f9" fontSize="8" textAnchor="middle">24/7 online</text>
        </g>

        {/* Leak / key stolen indicator */}
        <g transform="translate(270, 75)">
          <path d="M0 20 L12 8 L24 20 L12 32 Z" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1.5" />
          <text x="12" y="22" fill="#ef4444" fontSize="10" textAnchor="middle">?</text>
          <text x="40" y="22" fill="#f87171" fontSize="10">Key leak</text>
        </g>

        {/* Funds loss */}
        <g transform="translate(270, 145)">
          <ellipse cx="15" cy="10" rx="12" ry="8" fill="rgba(34, 197, 94, 0.15)" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="1" />
          <text x="15" y="12" fill="#22c55e" fontSize="8" textAnchor="middle">$</text>
          <line x1="30" y1="10" x2="90" y2="10" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 2">
            <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.2s" repeatCount="indefinite" />
          </line>
          <text x="100" y="14" fill="#f87171" fontSize="9">Funds lost</text>
        </g>
      </svg>
      <p className="hot-risk-caption">
        Hot wallet: always online, constantly targeted. Malware or hacks can steal your private key and drain funds.
      </p>
    </div>
  )
}
