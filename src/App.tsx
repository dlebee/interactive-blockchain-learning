import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import {
  HomePage,
  WhatIsBlockchainPage,
  BlocksHashingPage,
  TransactionsPage,
  WalletPage,
  OperatorsUsersPage,
  CryptocurrencyPage,
  NodesPage,
  NodesGossipPage,
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
          <Route path="wallet" element={<WalletPage />} />
          <Route path="operators-users" element={<OperatorsUsersPage />} />
          <Route path="cryptocurrency" element={<CryptocurrencyPage />} />
          <Route path="nodes" element={<NodesPage />} />
          <Route path="nodes/gossip" element={<NodesGossipPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
