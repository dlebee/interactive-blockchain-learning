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
      { label: 'Cryptocurrency', path: 'cryptocurrency' },
      {
        label: 'Nodes',
        path: 'nodes',
        children: [{ label: 'Gossip', path: 'nodes/gossip' }],
      },
      { label: 'Consensus', path: 'consensus' },
      { label: 'Blockspace', path: 'blockspace' },
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
    ],
  },
]
