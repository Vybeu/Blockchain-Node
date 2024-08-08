// node/chain.js
const Block = require('./block');

class Chain {
  constructor() {
    this.blocks = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), [], "0");
  }

  getLatestBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(4); // Example difficulty level
    this.blocks.push(newBlock);
  }
}

module.exports = Chain;
