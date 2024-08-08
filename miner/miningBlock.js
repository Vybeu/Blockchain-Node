// miner/miningBlock.js
const getMiningJob = require('../node/miningJob');

function mine(chain) {
  const block = getMiningJob(chain);
  block.mineBlock(4); // Example difficulty level
  chain.addBlock(block);
  return block;
}

module.exports = mine;
