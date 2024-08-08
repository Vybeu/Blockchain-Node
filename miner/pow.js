// miner/pow.js
function proofOfWork(block, difficulty) {
    while (block.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      block.nonce++;
      block.hash = block.calculateHash();
    }
    return block.hash;
  }
  
  module.exports = proofOfWork;
  