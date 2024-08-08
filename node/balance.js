// node/balance.js
const Chain = require('./chain');

// utils/balance.js
function calculateBalance(publicKey, chain) {
  let balance = 0;
  for (const block of chain.blocks) {
    for (const transaction of block.transactions) {
      if (transaction.toAddress === publicKey) {
        balance += transaction.amount;
      }
      if (transaction.fromAddress === publicKey) {
        balance -= transaction.amount;
      }
    }
  }
  return balance;
}

module.exports = {calculateBalance};
