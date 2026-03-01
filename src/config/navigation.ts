/**
 * Navigation structure - categories and items
 */
export interface NavItem {
  label: string
  path: string
  children?: NavItem[]
}

export interface NavCategory {
  label: string
  items: NavItem[]
}

export const navConfig: NavCategory[] = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Introduction', path: '' },
      { label: 'What is a Blockchain?', path: 'what-is-blockchain' },
    ],
  },
  {
    label: 'Core Concepts',
    items: [
      { label: 'Blocks & Hashing', path: 'blocks-hashing' },
      { label: 'Transactions', path: 'transactions' },
      { label: 'Accounts', path: 'account' },
      { label: 'Operators & Users', path: 'operators-users' },
      {
        label: 'Cryptocurrency',
        path: 'cryptocurrency',
        children: [
          { label: 'Native Currency', path: 'cryptocurrency/native-currency-tokens' },
          { label: 'Tokens', path: 'cryptocurrency/tokens' },
        ],
      },
      {
        label: 'Nodes',
        path: 'nodes',
        children: [
          { label: 'Types of Nodes', path: 'nodes/types' },
          { label: 'Gossip', path: 'nodes/gossip' },
        ],
      },
      {
        label: 'Consensus',
        path: 'consensus',
        children: [
          { label: 'Proof of Work', path: 'consensus/proof-of-work' },
          { label: 'Proof of Stake', path: 'consensus/proof-of-stake' },
        ],
      },
      { label: 'Blockspace', path: 'blockspace' },
      {
        label: 'Layer 2 Scaling',
        path: 'layer-2',
        children: [
          { label: 'State Channels', path: 'layer-2/state-channels' },
          { label: 'Rollups', path: 'layer-2/rollups' },
        ],
      },
      {
        label: 'Transaction Inclusion',
        path: 'transaction-inclusion',
        children: [
          { label: 'Nonce', path: 'transaction-inclusion/nonce' },
          { label: 'Replacing / cancelling', path: 'transaction-inclusion/replacing' },
        ],
      },
      {
        label: 'Wallets',
        path: 'wallets',
        children: [
          { label: 'Mnemonic & derivation', path: 'wallets/mnemonic' },
          { label: 'Hot vs cold', path: 'wallets/hot-cold' },
        ],
      },
      {
        label: 'Advanced Topics',
        path: 'advanced-topics',
        children: [
          { label: 'Merkle Trees', path: 'advanced-topics/merkle-trees' },
          { label: 'Incremental Merkle Tree', path: 'advanced-topics/incremental-merkle-tree' },
          {
            label: 'Batching',
            path: 'advanced-topics/batching',
            children: [
              { label: 'Basic Batching', path: 'advanced-topics/batching/basic' },
            ],
          },
        ],
      },
    ],
  },
  {
    label: 'Ethereum',
    items: [
      { label: 'Introduction', path: 'ethereum/introduction' },
      {
        label: 'Transactions',
        path: 'ethereum/transactions',
        children: [
          { label: 'ABI', path: 'ethereum/transactions/abi' },
          { label: 'Calldata', path: 'ethereum/transactions/calldata' },
          { label: 'Logs', path: 'ethereum/transactions/logs' },
          { label: 'Gas', path: 'ethereum/transactions/gas' },
          { label: 'Gas Price', path: 'ethereum/transactions/gas-price' },
        ],
      },
    ],
  },
]
