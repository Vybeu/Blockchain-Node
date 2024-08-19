// node/transaction.js
const crypto = require('crypto');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
    this.hash = this.calculateHash();
    this.signature = null;
  }

  calculateHash() {
    return crypto.createHash('sha256').update(
      this.fromAddress + this.toAddress + this.amount + this.timestamp
    ).digest('hex');
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');

    this.signature = sig.toDER('hex');
  }

  isValid() {
    if (this.fromAddress === null) return true; // Mining rewards don't need to be signed

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = crypto.createECDH('secp256k1');
    publicKey.setPublicKey(this.fromAddress, 'hex');

    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

module.exports = Transaction;