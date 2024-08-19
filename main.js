const express = require('express');
const app = express();
const path = require('path');
const fetch = require('node-fetch'); // Ensure node-fetch is installed: npm install node-fetch@2
const port = process.env.PORT || 3000;

const Chain = require('./node/chain');
const mine = require('./miner/miningBlock');
const Wallet = require('./wallet/wallet');
const { calculateBalance } = require('./wallet/balance');
const { generateHash } = require('./utils/hash');

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

    // Sync with the newly connected peer
    try {
      const syncResponse = await fetch(`http://localhost:${port}/peers/sync`, { method: 'POST' });
      if (syncResponse.ok) {
        console.log(`Blockchain synchronized with peer: ${peerUrl}`);
      } else {
        console.error(`Failed to sync blockchain with peer: ${peerUrl}`);
      }
    } catch (error) {
      console.error(`Failed to sync blockchain with peer ${peerUrl}:`, error.message);
    }
  }

  res.json({ message: 'Peer connected', peerUrl });
});

// Route to notify peers of a new block
// Route to notify peers of a new block
app.post('/peers/notify-new-block', async (req, res) => {
  const newBlock = req.body;

  console.log('Received new block:', newBlock);

  const latestBlock = blockchain.getLatestBlock();

  // Check if the new block extends the chain
  if (newBlock.previousHash === latestBlock.hash && newBlock.index === latestBlock.index + 1) {
    blockchain.addBlock(newBlock);
    console.log('New block added to the chain:', newBlock);

    // Remove confirmed transactions from pending pool
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

// GET /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
  const Transaction = require('./node/transaction');

  app.post('/transactions/send', (req, res) => {
    const { fromAddress, toAddress, amount } = req.body;
  
    try {
      // Create the wallet object for the sender
      const senderWallet = new Wallet(blockchain);
  
      // Create and sign the transaction
      const transaction = senderWallet.createTransaction(toAddress, amount);
  
      // Add the transaction to the pending transactions
      pendingTransactions.push(transaction);
  
      // Broadcast the transaction to peers
      peers.forEach(async (peerUrl) => {
        try {
          await fetch(`${peerUrl}/transactions/receive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction),
          });
        } catch (error) {
          console.error(`Failed to broadcast transaction to peer ${peerUrl}:`, error.message);
        }
      });
  
      res.json({ message: 'Transaction created and broadcasted', transaction });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Route to receive the transaction
  app.post('/transactions/receive', (req, res) => {
    const transactionData = req.body;
    const transaction = new Transaction(
      transactionData.fromAddress,
      transactionData.toAddress,
      transactionData.amount
    );
  
    transaction.signature = transactionData.signature;
    transaction.hash = transactionData.hash;
  
    try {
      if (!transaction.isValid()) {
        throw new Error('Invalid transaction!');
      }
  
      // Only add if it's not already in the pool
      if (!pendingTransactions.some(tx => tx.hash === transaction.hash)) {
        pendingTransactions.push(transaction);
        console.log('Received and added a new transaction:', transaction);
      }
  
      res.json({ message: 'Transaction received and added' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

// Route to create a wallet
app.post('/wallet/create', (req, res) => {
  const newWallet = new Wallet(blockchain);
  const initialDeposit = 100;
  
  console.log('New Wallet Created:', newWallet.publicKey); // Debugging log

  const transaction = {
    fromAddress: "system", // Use a string to represent the "system"
    toAddress: newWallet.publicKey,
    amount: initialDeposit,
    hash: generateHash("system" + newWallet.publicKey + initialDeposit.toString()) // Ensure everything is a string
  };

  pendingTransactions.push(transaction);

  // Create and mine a new block
  const newBlock = blockchain.mineBlock([transaction], 'system');
  console.log('New block mined:', newBlock);

  // Synchronize with peers
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

  res.json({
    privateKey: newWallet.privateKey,
    publicKey: newWallet.publicKey,
    balance: initialDeposit
  });
});

app.post('/mining/submit-mined-block', (req, res) => {
  const newBlock = req.body;
  blockchain.addBlock(newBlock);

  // Remove confirmed transactions from the pending pool
  newBlock.transactions.forEach(tx => {
    const index = pendingTransactions.findIndex(pendingTx => pendingTx.hash === tx.hash);
    if (index !== -1) {
      pendingTransactions.splice(index, 1);
    }
  });

  confirmedTransactions.push(...newBlock.transactions); // Add to confirmed transactions

  // Notify peers about the new block
  peers.forEach(async (peerUrl) => {
    try {
      await fetch(`${peerUrl}/peers/notify-new-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlock),
      });
      console.log(`Notified peer ${peerUrl} of new block.`);
    } catch (error) {
      console.error(`Failed to notify peer ${peerUrl} of new block:`, error.message);
    }
  });

  res.json({ message: 'Mined block accepted' });
});

app.post('/transactions/add-text', (req, res) => {
  const { text } = req.body;

  // Generate a transaction with a hash based on the text input
  const transaction = {
    fromAddress: "system", // A default address to represent the system
    toAddress: "user", // You can set this to something meaningful
    amount: 0, // Since it's text, there’s no actual coin transfer
    hash: generateHash(text),
    text: text // Storing the text as part of the transaction
  };

  // Add the transaction to pending transactions
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

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);

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