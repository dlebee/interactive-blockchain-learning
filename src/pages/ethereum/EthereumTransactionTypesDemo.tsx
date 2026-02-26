import './EthereumTransactionTypesDemo.css'

type TxType = 'send' | 'contract' | 'deploy'

const FIELDS: Record<TxType, { to: string; value: string; data: string }> = {
  send: {
    to: '0xBob...',
    value: '0.5 ETH',
    data: '(empty)',
  },
  contract: {
    to: '0xContract...',
    value: '0 ETH',
    data: '0x371303c0... (function + args)',
  },
  deploy: {
    to: '(empty)',
    value: '0 ETH',
    data: '0x60806040... (bytecode)',
  },
}

interface EthereumTransactionTypeVisualProps {
  type: TxType
}

export function EthereumTransactionTypeVisual({ type }: EthereumTransactionTypeVisualProps) {
  const { to, value, data } = FIELDS[type]

  return (
    <pre className="tx-snippet" aria-label={`Transaction type: ${type}`}>
      <code>
        <span className="tx-key">to</span><span className="tx-val">{to}</span>
        {'\n'}
        <span className="tx-key">value</span><span className="tx-val">{value}</span>
        {'\n'}
        <span className="tx-key">data</span><span className="tx-val">{data}</span>
      </code>
    </pre>
  )
}
