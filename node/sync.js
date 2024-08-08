// node/sync.js
const fetch = require('node-fetch'); // Ensure you install node-fetch

const peers = new Set();

function addPeer(peerUrl) {
  peers.add(peerUrl);
}

async function syncChain(chain, peerUrl) {
  try {
    const response = await fetch(`${peerUrl}/blockchain`);
    const peerChain = await response.json();
    if (peerChain.length > chain.blocks.length) {
      console.log('Updating local blockchain to the latest from peer');
      chain.blocks = peerChain.blocks; // Simplistic replacement logic
    }
  } catch (error) {
    console.error(`Failed to sync with peer: ${peerUrl}`, error);
    throw new Error(`Failed to sync with peer: ${peerUrl}`);
  }
}

module.exports = { addPeer, syncChain };