// node/chain.js
const Block = require('./block');

class Chain {
  constructor() {
    this.blocks = [this.createGenesisBlock()];
    this.difficulty = 4; // Set a reasonable difficulty level
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), [], "0");
  }

  getLatestBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty); // Ensure difficulty is passed here
    this.blocks.push(newBlock);
  }

  mineBlock(transactions, minerAddress) {
    const newBlock = new Block(this.blocks.length, Date.now(), transactions, this.getLatestBlock().hash);
    newBlock.mineBlock(this.difficulty); // Pass a reasonable difficulty
    this.addBlock(newBlock);
    return newBlock;
  }
}

module.exports = Chain;