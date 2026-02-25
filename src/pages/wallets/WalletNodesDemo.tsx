import './WalletNodesDemo.css'

const W = 520
const H = 360

const extX = 100
const extY = 45
const phoneX = W - 100
const phoneY = 55

const NODES_PER_CHAIN = 6
const CHAIN_RADIUS = 48

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

const chainAX = W * 0.28
const chainAY = H * 0.7
const chainBX = W * 0.72
const chainBY = H * 0.7

const chainANodes = Array.from({ length: NODES_PER_CHAIN }, (_, i) =>
  polar(chainAX, chainAY, CHAIN_RADIUS, (360 / NODES_PER_CHAIN) * i - 90)
)
const chainBNodes = Array.from({ length: NODES_PER_CHAIN }, (_, i) =>
  polar(chainBX, chainBY, CHAIN_RADIUS, (360 / NODES_PER_CHAIN) * i - 90)
)

function getMeshPairs(n: number): [number, number][] {
  const pairs: [number, number][] = []
  for (let i = 0; i < n; i++) {
    pairs.push([i, (i + 1) % n])
    pairs.push([i, (i + 2) % n])
  }
  const seen = new Set<string>()
  return pairs.filter(([a, b]) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const chainAPairs = getMeshPairs(NODES_PER_CHAIN)
const chainBPairs = getMeshPairs(NODES_PER_CHAIN)

const topA = chainAY - CHAIN_RADIUS - 6
const topB = chainBY - CHAIN_RADIUS - 6

const CHAIN_A = '#06b6d4'
const CHAIN_B = '#f97316'

export function WalletNodesDemo() {
  return (
    <div className="wallet-nodes-demo">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="wallet-nodes-svg"
        aria-label="Wallets (browser extension and mobile app) talking to multiple blockchains"
      >
        {/* Connection lines and messages */}
        <line x1={extX} y1={extY + 38} x2={chainAX} y2={topA} className="wallet-node-line chain-a" />
        <circle r="3" fill={CHAIN_A} opacity="0.9">
          <animateMotion dur="2.2s" repeatCount="indefinite" path={`M ${extX} ${extY + 35} L ${chainAX} ${topA}`} />
        </circle>
        <circle r="3" fill={CHAIN_A} opacity="0.9">
          <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.7s" path={`M ${extX} ${extY + 35} L ${chainAX} ${topA}`} />
        </circle>
        <line x1={extX} y1={extY + 38} x2={chainBX} y2={topB} className="wallet-node-line chain-b" />
        <circle r="3" fill={CHAIN_B} opacity="0.9">
          <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.3s" path={`M ${extX} ${extY + 35} L ${chainBX} ${topB}`} />
        </circle>
        <line x1={phoneX} y1={phoneY + 50} x2={chainAX} y2={topA} className="wallet-node-line chain-a" />
        <circle r="3" fill={CHAIN_A} opacity="0.9">
          <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.5s" path={`M ${phoneX} ${phoneY + 48} L ${chainAX} ${topA}`} />
        </circle>
        <line x1={phoneX} y1={phoneY + 50} x2={chainBX} y2={topB} className="wallet-node-line chain-b" />
        <circle r="3" fill={CHAIN_B} opacity="0.9">
          <animateMotion dur="2.4s" repeatCount="indefinite" begin="1s" path={`M ${phoneX} ${phoneY + 48} L ${chainBX} ${topB}`} />
        </circle>

        {/* Chain A: node mesh + gossip */}
        {chainAPairs.map(([a, b], i) => (
          <line key={`ca-${i}`} x1={chainANodes[a].x} y1={chainANodes[a].y} x2={chainANodes[b].x} y2={chainANodes[b].y} className="node-mesh-line chain-a" />
        ))}
        {chainAPairs.flatMap(([a, b], i) => [
          <circle key={`ca-msg-${i}-1`} r="2.5" fill={CHAIN_A} opacity="0.85">
            <animateMotion dur={`${1.6 + i * 0.15}s`} repeatCount="indefinite" path={`M ${chainANodes[a].x} ${chainANodes[a].y} L ${chainANodes[b].x} ${chainANodes[b].y}`} />
          </circle>,
          <circle key={`ca-msg-${i}-2`} r="2.5" fill={CHAIN_A} opacity="0.85">
            <animateMotion dur={`${1.6 + i * 0.15}s`} repeatCount="indefinite" begin={`${0.5 + i * 0.1}s`} path={`M ${chainANodes[a].x} ${chainANodes[a].y} L ${chainANodes[b].x} ${chainANodes[b].y}`} />
          </circle>,
        ])}
        {chainANodes.map((p, i) => (
          <g key={`ca-node-${i}`}>
            <circle cx={p.x} cy={p.y} r="12" className="node-outer chain-a" />
            <circle cx={p.x} cy={p.y} r="7" className="node-inner chain-a" />
          </g>
        ))}

        {/* Chain B: node mesh + gossip */}
        {chainBPairs.map(([a, b], i) => (
          <line key={`cb-${i}`} x1={chainBNodes[a].x} y1={chainBNodes[a].y} x2={chainBNodes[b].x} y2={chainBNodes[b].y} className="node-mesh-line chain-b" />
        ))}
        {chainBPairs.flatMap(([a, b], i) => [
          <circle key={`cb-msg-${i}-1`} r="2.5" fill={CHAIN_B} opacity="0.85">
            <animateMotion dur={`${1.7 + i * 0.15}s`} repeatCount="indefinite" path={`M ${chainBNodes[a].x} ${chainBNodes[a].y} L ${chainBNodes[b].x} ${chainBNodes[b].y}`} />
          </circle>,
          <circle key={`cb-msg-${i}-2`} r="2.5" fill={CHAIN_B} opacity="0.85">
            <animateMotion dur={`${1.7 + i * 0.15}s`} repeatCount="indefinite" begin={`${0.6 + i * 0.1}s`} path={`M ${chainBNodes[a].x} ${chainBNodes[a].y} L ${chainBNodes[b].x} ${chainBNodes[b].y}`} />
          </circle>,
        ])}
        {chainBNodes.map((p, i) => (
          <g key={`cb-node-${i}`}>
            <circle cx={p.x} cy={p.y} r="12" className="node-outer chain-b" />
            <circle cx={p.x} cy={p.y} r="7" className="node-inner chain-b" />
          </g>
        ))}

        {/* Browser + Extension with "Wallet" label */}
        <g transform={`translate(${extX - 70}, 0)`}>
          <rect x="0" y="0" width="140" height="70" rx="6" className="browser-svg" />
          <rect x="4" y="4" width="132" height="24" rx="4" className="browser-bar-svg" />
          <rect x="100" y="8" width="32" height="16" rx="3" className="ext-svg" />
          <text x="116" y="19" className="ext-label">Wallet</text>
          <text x="70" y="48" className="browser-text">dapp.example.com</text>
        </g>

        {/* Phone */}
        <g transform={`translate(${phoneX - 42}, 5)`}>
          <rect x="0" y="0" width="84" height="120" rx="10" className="phone-svg" />
          <rect x="5" y="5" width="74" height="110" rx="8" className="phone-screen-svg" />
          <rect x="28" y="38" width="28" height="35" rx="6" className="app-svg" />
          <text x="42" y="88" className="app-text">Wallet</text>
        </g>

        {/* Labels */}
        <text x={extX} y={85} className="wallet-label">Extension</text>
        <text x={phoneX} y={130} className="wallet-label">App</text>
        <text x={chainAX} y={chainAY + 28} className="chain-label chain-a">Chain A</text>
        <text x={chainBX} y={chainBY + 28} className="chain-label chain-b">Chain B</text>
      </svg>
    </div>
  )
}
