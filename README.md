# Blockchain Node Project

This project is a simple implementation of a blockchain network with multiple peers, mining, and transaction functionality. The network is built using Node.js and can handle basic blockchain operations like adding transactions, mining blocks, and syncing across peers.

## Features

- Create and manage a blockchain network with multiple peers.
- Add text-based transactions and mine blocks.
- Automatically sync the blockchain across connected peers.
- View the blockchain, connected peers, and balances.
- Connect new peers and propagate blocks across the network.

## Project Structure

Blockchain-Node/
│
├── index.html # Frontend HTML page for testing and interacting with the blockchain
├── main.js # Main server node
├── package.json # Project dependencies and scripts
├── peerServer.js # Peer server implementation
├── node/
│ ├── block.js # Block class implementation
│ ├── chain.js # Blockchain class implementation
│ ├── miningJob.js # Mining job handling
├── wallet/
│ ├── wallet.js # Wallet class implementation
│ ├── balance.js # Balance calculation logic
├── utils/
│ ├── hash.js # Utility for generating SHA-256 hashes
└── README.md # Project documentation (this file)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (included with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/blockchain-node.git
   cd blockchain-node
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

### Running the Project

1. **Start the main server node** (default port: `3000`):

   ```bash
   node main.js
   ```

2. **Start a peer server** (default port: `3001`):

   ```bash
   PORT=3001 node peerServer.js
   ```

You can add additional peer nodes by running the `peerServer.js` on different ports (e.g., `3002`, `3003`, etc.).

### Frontend Interaction

The `index.html` file provides a simple frontend interface to interact with the blockchain.

- Access the main node’s frontend:

  ```
  http://localhost:3000/
  ```

- Access the peer node’s frontend:
  ```
  http://localhost:3001/
  ```

From the frontend, you can:

- Submit text to be added as a transaction to the blockchain.
- View the transaction hash after the block is mined.

### API Endpoints

#### General

- `GET /blockchain`: Returns the full blockchain.
- `GET /peers`: Returns the list of connected peers.
- `POST /peers/connect`: Connects a new peer (requires `peerUrl` in the request body).
- `POST /peers/notify-new-block`: Notifies peers of a newly mined block.
- `POST /peers/sync`: Syncs the blockchain and pending transactions with connected peers.

#### Transactions

- `POST /transactions/add-text`: Adds a new text transaction and mines a block (requires `text` in the request body).
- `GET /transactions/pending`: Returns the list of pending transactions.

#### Mining and Debugging

- `GET /debug`: Returns the current blockchain state for debugging purposes.
- `GET /debug/reset-chain`: Resets the blockchain to the genesis block.

### How It Works

- When a transaction is added (e.g., through the frontend form), it is added to the list of pending transactions.
- The transaction is then automatically mined into a new block. The block is propagated to all connected peers.
- Peers validate the block and add it to their local blockchain if it extends their current chain.

### Troubleshooting

- If peers are not syncing correctly, make sure they are properly connected and that they have the correct sync logic in place.
- Ensure that ports are not conflicting when running multiple peer nodes.

### Potential Improvements

- Add support for Proof-of-Stake (PoS) or other consensus algorithms.
- Implement a more sophisticated transaction model (e.g., cryptocurrency transactions).
- Add persistent storage for the blockchain data.

### License

This project is licensed under the MIT License.

---

Happy coding!
