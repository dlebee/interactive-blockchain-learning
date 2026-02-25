import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import {
  HomePage,
  WhatIsBlockchainPage,
  BlocksHashingPage,
  TransactionsPage,
  AccountPage,
  WalletsPage,
  WalletsMnemonicPage,
  WalletsHotColdPage,
  OperatorsUsersPage,
  CryptocurrencyPage,
  NodesPage,
  NodesGossipPage,
  ConsensusPage,
  ConsensusProofOfWorkPage,
  ConsensusProofOfStakePage,
  BlockspacePage,
  TransactionInclusionPage,
  TransactionInclusionNoncePage,
  TransactionInclusionReplacingPage,
} from './pages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="what-is-blockchain" element={<WhatIsBlockchainPage />} />
          <Route path="blocks-hashing" element={<BlocksHashingPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="wallets" element={<WalletsPage />} />
          <Route path="wallets/mnemonic" element={<WalletsMnemonicPage />} />
          <Route path="wallets/hot-cold" element={<WalletsHotColdPage />} />
          <Route path="operators-users" element={<OperatorsUsersPage />} />
          <Route path="cryptocurrency" element={<CryptocurrencyPage />} />
          <Route path="nodes" element={<NodesPage />} />
          <Route path="nodes/gossip" element={<NodesGossipPage />} />
          <Route path="consensus" element={<ConsensusPage />} />
          <Route path="consensus/proof-of-work" element={<ConsensusProofOfWorkPage />} />
          <Route path="consensus/proof-of-stake" element={<ConsensusProofOfStakePage />} />
          <Route path="blockspace" element={<BlockspacePage />} />
          <Route path="transaction-inclusion" element={<TransactionInclusionPage />} />
          <Route path="transaction-inclusion/nonce" element={<TransactionInclusionNoncePage />} />
          <Route path="transaction-inclusion/replacing" element={<TransactionInclusionReplacingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
