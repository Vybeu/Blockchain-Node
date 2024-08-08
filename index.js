// index.js
const Chain = require('./node/chain');
const Wallet = require('./wallet/wallet');
const mine = require('./miner/miningBlock');
const { addPeer, syncChain } = require('./node/sync');
const Peer = require('./node/peer');

const myChain = new Chain();
const myWallet = new Wallet(myChain);

// Example usage
console.log('Mining block...');
mine(myChain);
console.log('Block mined.');

console.log('Wallet balance:', myWallet.checkBalance());

// Example initialization
console.log('Initializing blockchain node...');

// Optionally, sync with a predefined peer at startup
const initialPeer = 'http://localhost:3001';
addPeer(initialPeer);
syncChain(myChain, initialPeer).then(() => {
  console.log('Blockchain synced with initial peer.');
}).catch(error => {
  console.log('Failed to sync with initial peer:', error.message);
});

console.log('Blockchain:', JSON.stringify(myChain, null, 2));
