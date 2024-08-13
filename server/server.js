const express = require('express');
const app = express();
const port = 3000;

const blockchain = require('../node/blockchain');
const { addPeer, syncChain } = require('../node/sync');
const { calculateBalance } = require('../wallet/balance');
const mine = require('../miner/miningBlock');

const peers = new Set();
const pendingTransactions = [];
const confirmedTransactions = [];

app.use(express.json());

// The rest of your routes...
// For example:

app.get('/blocks', (req, res) => {
  res.json(blockchain.blocks);
});

app.get('/info', (req, res) => {
  res.json({ blocks: blockchain.blocks.length, peers: Array.from(peers) });
});

// ... other routes

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
