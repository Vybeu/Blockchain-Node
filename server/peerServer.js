// server/peerServer.js
const express = require('express');
const app = express();
const port = 3001; // Different port for peer server

const Chain = require('../node/chain');
const { addPeer, syncChain } = require('../node/sync');

app.use(express.json());

const blockchain = new Chain();

// Endpoint to fetch blockchain data from this peer
app.get('/blockchain', (req, res) => {
  res.json(blockchain);
});

// Endpoint to handle peer addition
app.post('/addPeer', (req, res) => {
  const { peerUrl } = req.body;
  addPeer(peerUrl);
  res.json({ message: 'Peer added successfully', peerUrl });
});

// Sync local chain with another peer's chain
app.post('/syncWithPeer', (req, res) => {
  const { peerUrl } = req.body;
  syncChain(blockchain, peerUrl)
    .then(() => res.json({ message: 'Blockchain synced successfully with peer', peerUrl }))
    .catch(error => res.status(500).json({ error: error.message }));
});

app.listen(port, () => {
  console.log(`Peer server listening at http://localhost:${port}`);
});