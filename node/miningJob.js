// node/miningJob.js
const Block = require('./block');

function getMiningJob(chain) {
  const latestBlock = chain.getLatestBlock();
  const newBlock = new Block(latestBlock.index + 1, Date.now(), [], latestBlock.hash);
  return newBlock;
}

module.exports = getMiningJob;
