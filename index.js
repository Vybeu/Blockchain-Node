// index.js
const blockchain = require('./node/blockchain');
const Wallet = require('./wallet/wallet');
const mine = require('./miner/miningBlock');
const { addPeer, syncChain } = require('./node/sync');

const myWallet = new Wallet(blockchain);

// Example usage
console.log('Mining block...');
mine(blockchain);
console.log('Block mined.');

console.log('Wallet balance:', myWallet.checkBalance());

// Example sync with a predefined peer at startup (optional)
const initialPeer = 'http://localhost:3001';
addPeer(initialPeer);
syncChain(blockchain, initialPeer)
  .then(() => {
    console.log('Blockchain synced with initial peer.');
  })
  .catch((error) => {
    console.log('Failed to sync with initial peer:', error.message);
  });

console.log('Blockchain:', JSON.stringify(blockchain, null, 2));
