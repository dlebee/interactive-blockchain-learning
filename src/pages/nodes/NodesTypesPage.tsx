import { Link } from 'react-router-dom'
import { NodesEcosystemDemo } from './NodesEcosystemDemo'

export function NodesTypesPage() {
  return (
    <div className="page">
      <h1 id="types-of-nodes">
        <a href="#types-of-nodes" className="anchor-link" aria-label="Link to this section">
          Types of Nodes
        </a>
      </h1>
      <p className="lead">
        Blockchain nodes are the unsung heroes of decentralized networks. They validate
        transactions, maintain the blockchain's history, and ensure its security and
        resilience. But why are there different types of nodes? Who runs them? And why
        might you need to run your own RPC node or rely on providers?
      </p>
      <p>
        In this article, we break down the types of nodes, explore their roles in
        blockchain ecosystems, and dive into the economy that has emerged around running
        and outsourcing nodes. By the end, you will have a clear understanding of how
        nodes work, why they are crucial, and how businesses have built entire models
        around them.
      </p>

      <NodesEcosystemDemo />
      <p>
        The diagram above shows how the ecosystem fits together: block authors in the
        P2P center, RPC nodes bridging to users on the outer layer, and explorers
        using dedicated RPC to power web pages that serve users.
      </p>

      <h2 id="miners-validators">
        <a href="#miners-validators" className="anchor-link" aria-label="Link to this section">
          Miners and Validators: The Backbone of Blockchain Consensus
        </a>
      </h2>
      <p>
        The most prominent type of blockchain node is the miner or validator. Their
        primary role is to maintain the blockchain's consensus, whether by mining
        blocks in Proof of Work systems or authoring and finalizing blocks in Proof of
        Stake systems. In return, they earn rewards for their work.
      </p>
      <p>
        These nodes typically operate as full nodes, meaning they store a portion of the
        blockchain's state. While implementations can vary, a full node might keep the
        complete headers from the genesis block onward but limit full content storage to,
        say, the last 256 blocks.
      </p>
      <p>The main responsibilities of miners and validators include:</p>
      <ul>
        <li>
          <strong>Processing transactions</strong>: Validating and including transactions
          in blocks.
        </li>
        <li>
          <strong>Authoring blocks</strong>: Creating new blocks to extend the blockchain.
        </li>
        <li>
          <strong>Participating in consensus</strong>: Ensuring agreement on the
          blockchain's state.
        </li>
      </ul>
      <p>
        Miners and validators are the backbone of the blockchain network, ensuring its
        functionality, security, and trustless nature.
      </p>

      <h2 id="rpc-nodes">
        <a href="#rpc-nodes" className="anchor-link" aria-label="Link to this section">
          RPC Nodes: The Gateway to Blockchain Interaction
        </a>
      </h2>
      <p>
        The second most recognized type of node is the RPC (Remote Procedure Call)
        node. Unlike miners or validators, RPC nodes do not author blocks or participate
        in consensus finalization. Instead, they remain in sync with the blockchain and
        provide services to external applications by:
      </p>
      <ul>
        <li>
          <strong>Submitting transactions</strong>: Allowing users to broadcast their
          transactions to the network.
        </li>
        <li>
          <strong>Querying blockchain state</strong>: Fetching account balances,
          transaction details, and contract data.
        </li>
      </ul>
      <p>
        RPC nodes act as the bridge between wallets and the blockchain. They handle
        communication, ensuring wallets can seamlessly interact with the network.
      </p>
      <p>
        Why not rely on miners or validators for this? Simple: miners and validators are
        already heavily tasked with ensuring the security and validity of blocks.
        Offloading these query and transaction responsibilities to RPC nodes allows the
        network to remain efficient and scalable.
      </p>
      <p>
        RPC nodes are essential to blockchain usability, supporting wallets, dApps, and
        other tools that depend on reliable blockchain access.
      </p>

      <h2 id="archive-nodes">
        <a href="#archive-nodes" className="anchor-link" aria-label="Link to this section">
          Archive Nodes: Preserving Blockchain's Complete History
        </a>
      </h2>
      <p>
        Archive nodes serve a critical role in blockchain ecosystems by storing the full
        state and history of the blockchain. This includes:
      </p>
      <ul>
        <li>Every transaction ever made.</li>
        <li>State transitions and account changes.</li>
        <li>Receipts and complete historical data.</li>
      </ul>
      <p>
        While archive nodes can also function as RPC nodes, they are primarily utilized
        by indexers. Indexers power tools like blockchain explorers, which display the
        full history of on-chain activity, and analytics platforms, enabling users to
        generate statistics and analyze blockchain data.
      </p>
      <p>
        Archive nodes are more demanding in terms of storage and operational costs, as
        they require significant space and computational resources to maintain the full
        blockchain history. However, their presence is essential for maintaining
        transparency, providing data access for analytical needs, and ensuring the
        long-term integrity of the blockchain.
      </p>

      <h2 id="bootnodes">
        <a href="#bootnodes" className="anchor-link" aria-label="Link to this section">
          Bootnodes: The Gatekeepers of Blockchain Networks
        </a>
      </h2>
      <p>
        Bootnodes play a crucial yet understated role in blockchain networks. They are
        specialized nodes that participate in the peer-to-peer (P2P) network and
        primarily serve to help other nodes join the network.
      </p>
      <p>
        When a new node starts up, it connects to a bootnode to discover other
        participants in the network. After this initial discovery, the new node can
        persist the list of peers it found and use them for future connections, reducing
        its reliance on the bootnode.
      </p>
      <p>
        Given their importance, bootnodes can become a single point of failure if not
        managed properly. In large networks with many participants, bootnodes need to be
        rotated periodically to ensure reliability and decentralization.
      </p>
      <p>
        In essence, bootnodes exist solely to introduce new participants to the P2P
        network. Once discovery is complete, the network relies on a decentralized
        process called network discovery to maintain connectivity and communication
        between nodes.
      </p>

      <h2 id="light-nodes">
        <a href="#light-nodes" className="anchor-link" aria-label="Link to this section">
          Light Nodes: A Step Toward Decentralized Blockchain Interaction
        </a>
      </h2>
      <p>
        Light nodes (or light clients) are an ambitious effort to reduce reliance on
        centralized RPC nodes. By connecting directly to the peer-to-peer (P2P) network
        through bootnodes and using gossip messages from full nodes, they aim to fetch
        blockchain data without needing the full chain state.
      </p>
      <p>
        But here is the catch: bootnodes and full nodes often refuse to peer with light
        nodes. Why? They are already swamped maintaining consensus and processing
        transactions, leaving little incentive to cater to light node requests.
      </p>
      <p>
        Light nodes have not exactly taken the blockchain world by storm. While they
        have found utility in cross-chain protocols and trustless bridges, wallets
        continue to rely heavily on centralized RPCs for simplicity and reliability.
      </p>
      <p>
        The potential of light nodes remains promising, but for now, they feel more
        like a work in progress than a revolution in blockchain interaction.
      </p>

      <h2 id="rpc-economy">
        <a href="#rpc-economy" className="anchor-link" aria-label="Link to this section">
          Connecting to Blockchain: The Business of RPC Nodes
        </a>
      </h2>
      <p>
        RPCs and archive nodes lack an official reward system from blockchains, yet
        they are essential for users and developers. This gap has created an economy of
        its own, with companies stepping in to provide these critical services.
      </p>
      <p>
        Platforms like{" "}
        <a href="https://infura.io" target="_blank" rel="noopener noreferrer">
          Infura
        </a>{" "}
        (for Ethereum networks) and{" "}
        <a href="https://chainstack.com" target="_blank" rel="noopener noreferrer">
          Chainstack
        </a>{" "}
        (supporting multiple blockchains) have emerged as key players, offering RPC
        access to meet the growing demand. These services enable seamless interaction
        with blockchains, powering wallets, dApps, and other tools.
      </p>
      <p>The pricing models reflect the varied needs of users:</p>
      <ul>
        <li>
          <strong>Elastic usage</strong>: Pay per request or credit-based systems for
          those with fluctuating demands.
        </li>
        <li>
          <strong>Dedicated pricing</strong>: Exclusive, non-shared instances for
          high-performance and reliability needs.
        </li>
      </ul>
      <p>
        Running and maintaining an RPC node, especially an archive node, is demanding.
        It requires significant resources and expertise, from storage and compute power
        to ensuring uptime and sync with the blockchain. It is no surprise that this
        has become an essential, thriving service industry in the blockchain ecosystem.
      </p>
      <p>
        I hope this helped clarify the different types of blockchain nodes and their
        roles. Light nodes are an exciting concept to follow and may play a bigger role
        in the future. For now, though, we still largely depend on RPC providers to
        ensure reliable access and guarantees for interacting with blockchains. Let us
        see how this space evolves.
      </p>

      <p className="page-next-link">
        <Link to="/nodes">Back to Nodes</Link>
        {' · '}
        <Link to="/nodes/gossip">Gossip</Link>
        {' · '}
        <Link to="/consensus">Consensus</Link>
      </p>
    </div>
  )
}
