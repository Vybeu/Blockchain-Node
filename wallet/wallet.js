const crypto = require('crypto');
const { calculateBalance } = require('../node/balance'); // Ensure this import is correct

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
}

module.exports = Wallet;