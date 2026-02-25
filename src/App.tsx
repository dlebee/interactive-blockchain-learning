import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import {
  HomePage,
  WhatIsBlockchainPage,
  BlocksHashingPage,
  TransactionsPage,
  WalletPage,
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
