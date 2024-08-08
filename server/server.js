const express = require('express');
const app = express();
const port = 3000;

const Chain = require('../node/chain');
const { addPeer, syncChain } = require('../node/sync');
const { calculateBalance } = require('../utils/balance');
const mine = require('../miner/miningBlock');
const { generateHash } = require('../utils/hash'); // Assuming you have a hash utility

const blockchain = new Chain();
const peers = new Set();
const pendingTransactions = [];
const confirmedTransactions = [];

app.use(express.json());

// GET /
app.get('/', (req, res) => {
  res.send('Welcome to the Blockchain Node!');
});

// GET /info
app.get('/info', (req, res) => {
  res.json({ blocks: blockchain.blocks.length, peers: Array.from(peers) });
});

// GET /debug
app.get('/debug', (req, res) => {
  res.json(blockchain.blocks);
});

// GET /debug/reset-chain
app.get('/debug/reset-chain', (req, res) => {
  blockchain.blocks = [blockchain.createGenesisBlock()];
  res.send('Blockchain reset to genesis block.');
});

// GET /debug/mine/:minerAddress/:difficulty
app.get('/debug/mine/:minerAddress/:difficulty', (req, res) => {
  const { minerAddress, difficulty } = req.params;
  const newBlock = mine(blockchain, minerAddress, parseInt(difficulty, 10));
  blockchain.addBlock(newBlock); // Ensure the block is added to the blockchain
  confirmedTransactions.push(...pendingTransactions); // Move pending to confirmed
  pendingTransactions.length = 0; // Clear pending transactions
  res.json(newBlock);
});

// GET /blocks
app.get('/blocks', (req, res) => {
  res.json(blockchain.blocks);
});

// GET /blocks/:index
app.get('/blocks/:index', (req, res) => {
  const { index } = req.params;
  res.json(blockchain.blocks[index]);
});

// GET /transactions/pending
app.get('/transactions/pending', (req, res) => {
  res.json(pendingTransactions);
});

// GET /transactions/confirmed
app.get('/transactions/confirmed', (req, res) => {
  res.json(confirmedTransactions);
});

// GET /transactions/:tranHash
app.get('/transactions/:tranHash', (req, res) => {
  const { tranHash } = req.params;
  const transaction = confirmedTransactions.find(tx => tx.hash === tranHash) || 
                      pendingTransactions.find(tx => tx.hash === tranHash);
  res.json(transaction);
});

// GET /balances
app.get('/balances', (req, res) => {
  const balances = {};
  blockchain.blocks.forEach(block => {
    block.transactions.forEach(transaction => {
      if (!balances[transaction.fromAddress]) balances[transaction.fromAddress] = 0;
      if (!balances[transaction.toAddress]) balances[transaction.toAddress] = 0;
      balances[transaction.fromAddress] -= transaction.amount;
      balances[transaction.toAddress] += transaction.amount;
    });
  });
  res.json(balances);
});

// GET /address/:address/transactions
app.get('/address/:address/transactions', (req, res) => {
  const { address } = req.params;
  const transactions = confirmedTransactions.filter(tx => tx.fromAddress === address || tx.toAddress === address);
  res.json(transactions);
});

// GET /address/:address/balance
app.get('/address/:address/balance', (req, res) => {
  const { address } = req.params;
  const balance = calculateBalance(address, blockchain);
  res.json({ balance });
});

// POST /transactions/send
app.post('/transactions/send', (req, res) => {
  const { fromAddress, toAddress, amount } = req.body;
  const transaction = { fromAddress, toAddress, amount, hash: generateHash(fromAddress + toAddress + amount) };
  pendingTransactions.push(transaction);
  res.json(transaction);
});

// GET /peers
app.get('/peers', (req, res) => {
  res.json(Array.from(peers));
});

// POST /peers/connect
app.post('/peers/connect', (req, res) => {
  const { peerUrl } = req.body;
  addPeer(peerUrl);
  res.json({ message: 'Peer connected', peerUrl });
});

// POST /peers/notify-new-block
app.post('/peers/notify-new-block', (req, res) => {
  const newBlock = req.body;
  blockchain.addBlock(newBlock);
  res.json({ message: 'New block added' });
});

// GET /mining/get-mining-job/:address
app.get('/mining/get-mining-job/:address', (req, res) => {
  const { address } = req.params;
  const newBlock = blockchain.createNewBlock(pendingTransactions, address);
  res.json(newBlock);
});

// POST /mining/submit-mined-block
app.post('/mining/submit-mined-block', (req, res) => {
  const newBlock = req.body;
  blockchain.addBlock(newBlock);
  confirmedTransactions.push(...pendingTransactions);
  pendingTransactions.length = 0; // Clear pending transactions
  res.json({ message: 'Mined block accepted' });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Utility functions
// function generateHash(data) {
//   const crypto = require('crypto');
//   return crypto.createHash('sha256').update(data).digest('hex');
// }