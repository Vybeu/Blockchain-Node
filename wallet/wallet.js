const crypto = require('crypto');
const { calculateBalance } = require('../node/balance');
const Transaction = require('../node/transaction');

class Wallet {
  constructor(chain) {
    this.privateKey = this.generatePrivateKey();
    this.publicKey = this.generatePublicKey(this.privateKey);
    this.chain = chain;
  }

  generatePrivateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  generatePublicKey(privateKey) {
    const keyPair = crypto.createECDH('secp256k1');
    keyPair.setPrivateKey(privateKey, 'hex');
    return keyPair.getPublicKey('hex');
  }

  checkBalance() {
    return calculateBalance(this.publicKey, this.chain);
  }

  createTransaction(toAddress, amount) {
    if (this.checkBalance() < amount) {
      throw new Error('Insufficient balance!');
    }

    const transaction = new Transaction(this.publicKey, toAddress, amount);

    // Sign the transaction with this wallet's private key
    const keyPair = crypto.createECDH('secp256k1');
    keyPair.setPrivateKey(this.privateKey, 'hex');

    transaction.signTransaction(keyPair);
    return transaction;
  }
}

module.exports = Wallet;