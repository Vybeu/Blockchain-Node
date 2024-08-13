// node/block.js
const { generateHash } = require('../utils/hash');

class Block {
  constructor(index, timestamp, transactions, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return generateHash(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce);
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0'); // Creates a string of 'difficulty' zeroes

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

module.exports = Block;