import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import {
  HomePage,
  NotFoundPage,
  WhatIsBlockchainPage,
  BlocksHashingPage,
  MerkleTreesPage,
  IncrementalMerkleTreePage,
  TransactionsPage,
  AccountPage,
  WalletsPage,
  WalletsMnemonicPage,
  WalletsHotColdPage,
  OperatorsUsersPage,
  CryptocurrencyPage,
  TokensPage,
  NativeCurrencyTokensPage,
  NodesPage,
  NodesGossipPage,
  NodesTypesPage,
  ConsensusPage,
  ConsensusProofOfWorkPage,
  ConsensusProofOfStakePage,
  BlockspacePage,
  TransactionInclusionPage,
  TransactionInclusionNoncePage,
  TransactionInclusionReplacingPage,
  EthereumIntroductionPage,
  EthereumTransactionsPage,
  EthereumTransactionsAbiPage,
  EthereumTransactionsCalldataPage,
  EthereumTransactionsLogsPage,
  EthereumTransactionsGasPage,
  EthereumTransactionsGasPricePage,
} from './pages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="what-is-blockchain" element={<WhatIsBlockchainPage />} />
          <Route path="blocks-hashing" element={<BlocksHashingPage />} />
          <Route path="advanced-topics" element={<Navigate to="/advanced-topics/merkle-trees" replace />} />
          <Route path="advanced-topics/merkle-trees" element={<MerkleTreesPage />} />
          <Route path="advanced-topics/merkle-trees/incremental" element={<IncrementalMerkleTreePage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="wallets" element={<WalletsPage />} />
          <Route path="wallets/mnemonic" element={<WalletsMnemonicPage />} />
          <Route path="wallets/hot-cold" element={<WalletsHotColdPage />} />
          <Route path="operators-users" element={<OperatorsUsersPage />} />
          <Route path="cryptocurrency" element={<CryptocurrencyPage />} />
          <Route path="cryptocurrency/tokens" element={<TokensPage />} />
          <Route path="cryptocurrency/native-currency-tokens" element={<NativeCurrencyTokensPage />} />
          <Route path="nodes" element={<NodesPage />} />
          <Route path="nodes/types" element={<NodesTypesPage />} />
          <Route path="nodes/gossip" element={<NodesGossipPage />} />
          <Route path="consensus" element={<ConsensusPage />} />
          <Route path="consensus/proof-of-work" element={<ConsensusProofOfWorkPage />} />
          <Route path="consensus/proof-of-stake" element={<ConsensusProofOfStakePage />} />
          <Route path="blockspace" element={<BlockspacePage />} />
          <Route path="transaction-inclusion" element={<TransactionInclusionPage />} />
          <Route path="transaction-inclusion/nonce" element={<TransactionInclusionNoncePage />} />
          <Route path="transaction-inclusion/replacing" element={<TransactionInclusionReplacingPage />} />
          <Route path="ethereum" element={<Navigate to="/ethereum/introduction" replace />} />
          <Route path="ethereum/introduction" element={<EthereumIntroductionPage />} />
          <Route path="ethereum/transactions" element={<EthereumTransactionsPage />} />
          <Route path="ethereum/transactions/abi" element={<EthereumTransactionsAbiPage />} />
          <Route path="ethereum/transactions/calldata" element={<EthereumTransactionsCalldataPage />} />
          <Route path="ethereum/transactions/logs" element={<EthereumTransactionsLogsPage />} />
          <Route path="ethereum/transactions/gas" element={<EthereumTransactionsGasPage />} />
          <Route path="ethereum/transactions/gas-price" element={<EthereumTransactionsGasPricePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
