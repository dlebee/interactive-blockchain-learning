/**
 * Navigation structure - categories and items
 */
export interface NavItem {
  label: string
  path: string
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
      { label: 'Accounts', path: 'wallet' },
    ],
  },
]
