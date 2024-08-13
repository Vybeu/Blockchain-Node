1. GET /: Basic route that returns a welcome message.
2. GET /info: Returns basic info about the blockchain and connected peers.
3. GET /debug: Returns the entire blockchain for debugging.
4. GET /debug/reset-chain: Resets the blockchain to its genesis block.
5. GET /debug/mine/:minerAddress/:difficulty: Mines a new block with specified difficulty and miner address, adds it to the blockchain, and clears pending transactions.
6. GET /blocks: Returns all blocks in the blockchain.
7. GET /blocks/:index: Returns a specific block by its index.
8. GET /transactions/pending: Returns all pending transactions.
9. GET /transactions/confirmed: Returns all confirmed transactions.
10. GET /transactions/:tranHash: Returns a specific transaction by its hash.
11. GET /balances: Returns the balances of all addresses by calculating from the blockchain.
12. GET /address/:address/transactions: Returns all transactions involving a specific address.
13. GET /address/:address/balance: Returns the balance of a specific address.
14. POST /transactions/send: Sends a new transaction (adds to pending transactions).
15. GET /peers: Returns the list of connected peers.
16. POST /peers/connect: Connects a new peer (adds to the peer list).
17. POST /peers/notify-new-block: Notifies the network of a new block and adds it to the blockchain.
18. GET /mining/get-mining-job/:address: Gets a mining job for an address (creates a new block with pending transactions).
19. POST /mining/submit-mined-block: Submits a mined block and adds it to the blockchain.

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const path = require('path');

const Chain = require('./node/chain');
const mine = require('./miner/miningBlock');
const Wallet = require('./wallet/wallet');
const { calculateBalance } = require('./wallet/balance');
const { addPeer, syncChain } = require('./node/sync');
const { generateHash, calculateHash } = require('./utils/hash'); // Assuming you have a hash utility

// Create a single instance of the Chain (shared between console and server)
const blockchain = new Chain();
const peers = new Set();
const pendingTransactions = [];
const confirmedTransactions = [];

app.use(express.json());

// Example Console Operations
console.log('Mining block...');
mine(blockchain);
console.log('Block mined.');

const myWallet = new Wallet(blockchain);
console.log('Wallet balance:', myWallet.checkBalance());

console.log('Blockchain:', JSON.stringify(blockchain, null, 2));

// Server Routes

// Route to get the blockchain data
app.get('/blockchain', (req, res) => {
res.json(blockchain.blocks);
});

// Route to get the list of connected peers
app.get('/peers', (req, res) => {
res.json({ connectedPeers: Array.from(peers) });
});

// Route to connect a new peer
app.post('/peers/connect', (req, res) => {
const { peerUrl } = req.body;

if (!peers.has(peerUrl)) {
peers.add(peerUrl);
console.log(`Connected to new peer: ${peerUrl}`);
}

res.json({ message: 'Peer connected', peerUrl });
});

// Route to notify peers of a new block
app.post('/peers/notify-new-block', (req, res) => {
const newBlock = req.body;

blockchain.addBlock(newBlock);
console.log('New block received and added to the chain:', newBlock);

res.json({ message: 'New block added' });
});

// Sync blockchain with peers
app.post('/peers/sync', async (req, res) => {
for (let peerUrl of peers) {
try {
const response = await fetch(`${peerUrl}/blockchain`);
const peerBlocks = await response.json();

      // If the peer's chain is longer, replace our chain
      if (peerBlocks.length > blockchain.blocks.length) {
        blockchain.blocks = peerBlocks;
        console.log(`Blockchain synchronized with peer: ${peerUrl}`);
      }
    } catch (error) {
      console.error(`Failed to sync with peer ${peerUrl}:`, error.message);
    }

}

res.json({ message: 'Blockchain synchronized with peers' });
});

// GET /
app.get('/', (req, res) => {
res.sendFile(path.join(\_\_dirname, 'index.html'));
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
confirmedTransactions.push(...pendingTransactions);
pendingTransactions.length = 0;
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

// main.js (additional route)

app.post('/wallet/create', (req, res) => {
const newWallet = new Wallet(blockchain);
const initialDeposit = 100;

    console.log('New Wallet Created:', newWallet.publicKey); // Debugging log

    const transaction = {
      fromAddress: "system", // Use a string to represent the "system"
      toAddress: newWallet.publicKey, // Ensure this is correctly set
      amount: initialDeposit,
      hash: generateHash("system" + newWallet.publicKey + initialDeposit.toString()) // Ensure everything is a string
    };

    confirmedTransactions.push(transaction);

    // Create and mine a new block
    const newBlock = blockchain.mineBlock([transaction], 'system');
    console.log('New block mined:', newBlock);

    res.json({
      privateKey: newWallet.privateKey,
      publicKey: newWallet.publicKey,
      balance: initialDeposit
    });

});

// Start the server
app.listen(port, () => {
console.log(`Server listening on port ${port}`);

// Automatically connect to peers and sync on startup
const knownPeers = ['http://localhost:3000']; // Add more known peers here

knownPeers.forEach(async (peerUrl) => {
try {
await fetch(`${peerUrl}/peers/connect`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ peerUrl: `http://localhost:${port}` }),
});

      // Sync blockchain with the peer
      await fetch(`http://localhost:${port}/peers/sync`, { method: 'POST' });
    } catch (error) {
      console.error(`Failed to connect or sync with peer ${peerUrl}:`, error.message);
    }

});
});

// Utility function for generating a hash
// function generateHash(data) {
// const crypto = require('crypto');
// return crypto.createHash('sha256').update(data).digest('hex');
// }
