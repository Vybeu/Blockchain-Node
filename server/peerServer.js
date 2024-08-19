const express = require('express');
const app = express();
const fetch = require('node-fetch');
const path = require('path');
const port = process.env.PORT || 3001;

const Chain = require('../node/chain');
const mine = require('../miner/miningBlock');
const Wallet = require('../wallet/wallet');
const { calculateBalance } = require('../wallet/balance');
const { generateHash } = require('../utils/hash');

const blockchain = new Chain();
const peers = new Set();
const pendingTransactions = [];
const confirmedTransactions = [];

app.use(express.json());

// Route to get the blockchain data
app.get('/blockchain', (req, res) => {
  res.json(blockchain.blocks);
});

// Route to get the list of connected peers
app.get('/peers', (req, res) => {
  res.json({ connectedPeers: Array.from(peers) });
});

// Route to connect a new peer
app.post('/peers/connect', async (req, res) => {
  const { peerUrl } = req.body;

  if (!peers.has(peerUrl)) {
    peers.add(peerUrl);
    console.log(`Connected to new peer: ${peerUrl}`);

    // Notify the peer to add this server as a peer
    try {
      await fetch(`${peerUrl}/peers/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerUrl: `http://localhost:${port}` }),
      });
      console.log(`Peer ${peerUrl} connected back to this server.`);
    } catch (error) {
      console.error(`Failed to notify peer ${peerUrl} to connect back:`, error.message);
    }

    // Sync blockchain and transactions with the new peer
    await fetch(`http://localhost:${port}/peers/sync`, { method: 'POST' });
  }

  res.json({ message: 'Peer connected', peerUrl });
});

// Route to notify peers of a new block
app.post('/peers/notify-new-block', async (req, res) => {
  const newBlock = req.body;

  console.log('Received new block:', newBlock);

  const latestBlock = blockchain.getLatestBlock();

  // Check if the new block extends the chain
  if (newBlock.previousHash === latestBlock.hash && newBlock.index === latestBlock.index + 1) {
    blockchain.addBlock(newBlock);
    console.log('New block added to the chain:', newBlock);

    // Remove confirmed transactions from the pending pool
    newBlock.transactions.forEach(tx => {
      const index = pendingTransactions.findIndex(pendingTx => pendingTx.hash === tx.hash);
      if (index !== -1) {
        pendingTransactions.splice(index, 1);
      }
    });

    confirmedTransactions.push(...newBlock.transactions);

    // Notify other peers of the new block
    peers.forEach(async (peerUrl) => {
      if (peerUrl !== `http://localhost:${port}`) { // Prevent self-notification
        try {
          await fetch(`${peerUrl}/peers/notify-new-block`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBlock),
          });
        } catch (error) {
          console.error(`Failed to notify peer ${peerUrl} of new block:`, error.message);
        }
      }
    });

    res.json({ message: 'New block accepted and chain updated' });
  } else {
    // The block does not fit the current chain, trigger a full sync
    console.log('Received block that does not extend the chain. Triggering sync...');
    await fetch(`http://localhost:${port}/peers/sync`, { method: 'POST' });

    res.status(400).json({ message: 'Block rejected, triggered sync instead' });
  }
});

// Sync blockchain with peers
app.post('/peers/sync', async (req, res) => {
  let didSync = false;

  for (let peerUrl of peers) {
    try {
      // Sync Blockchain
      const response = await fetch(`${peerUrl}/blockchain`);
      if (response.ok) {
        const peerBlocks = await response.json();

        // If the peer's chain is longer, replace our chain
        if (peerBlocks.length > blockchain.blocks.length) {
          blockchain.blocks = peerBlocks;
          didSync = true;
          console.log(`Blockchain synchronized with peer: ${peerUrl}`);
        }
      } else {
        console.error(`Failed to fetch blockchain from peer: ${peerUrl}`);
      }

      // Sync Pending Transactions
      const pendingResponse = await fetch(`${peerUrl}/transactions/pending`);
      if (pendingResponse.ok) {
        const peerPendingTransactions = await pendingResponse.json();

        // Merge pending transactions
        peerPendingTransactions.forEach(tx => {
          if (!pendingTransactions.some(pendingTx => pendingTx.hash === tx.hash)) {
            pendingTransactions.push(tx);
            console.log(`Pending transaction ${tx.hash} synced from peer: ${peerUrl}`);
          }
        });
      } else {
        console.error(`Failed to fetch pending transactions from peer: ${peerUrl}`);
      }

    } catch (error) {
      console.error(`Failed to sync with peer ${peerUrl}:`, error.message);
    }
  }

  res.json({
    message: didSync ? 'Blockchain and pending transactions synchronized with peers' : 'No synchronization was needed',
  });
});

// Route to handle adding text transactions from the frontend
app.post('/transactions/add-text', (req, res) => {
  const { text } = req.body;

  // Generate a transaction with a hash based on the text input
  const transaction = {
    fromAddress: "system",
    toAddress: "user",
    amount: 0,
    hash: generateHash(text),
    text: text
  };

  pendingTransactions.push(transaction);

  // Automatically mine a block with this transaction
  const newBlock = blockchain.mineBlock([transaction], 'system');
  console.log('New block mined with text transaction:', newBlock);

  // Broadcast the block to peers
  peers.forEach(async (peerUrl) => {
    try {
      await fetch(`${peerUrl}/peers/notify-new-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlock),
      });
    } catch (error) {
      console.error(`Failed to notify peer ${peerUrl} of new block:`, error.message);
    }
  });

  // Respond with the transaction hash and block details
  res.json({
    message: 'Transaction added and block mined',
    transactionHash: transaction.hash,
    block: newBlock
  });
});

// GET /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html')); // Updated the path
});

// Start the peer server
app.listen(port, () => {
  console.log(`Peer server listening on port ${port}`);

  // Automatically connect to peers and sync on startup
  const knownPeers = ['http://localhost:3000']; // Add more known peers here

  knownPeers.forEach(async (peerUrl) => {
    try {
      const connectResponse = await fetch(`${peerUrl}/peers/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerUrl: `http://localhost:${port}` }),
      });

      if (connectResponse.ok) {
        console.log(`Connected to peer: ${peerUrl}`);
        await fetch(`http://localhost:${port}/peers/sync`, { method: 'POST' });
      } else {
        console.error(`Failed to connect to peer: ${peerUrl}`);
      }
    } catch (error) {
      console.error(`Failed to connect or sync with peer ${peerUrl}:`, error.message);
    }
  });
});