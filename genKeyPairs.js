const crypto = require('crypto');

function generateKeyPair() {
    const privateKey = crypto.randomBytes(32).toString('hex');

    const ecdh = crypto.createECDH('secp256k1');
    ecdh.setPrivateKey(privateKey, 'hex');
    const publicKey = ecdh.getPublicKey('hex', 'compressed');
    const address = crypto.createHash('ripemd160').update(Buffer.from(publicKey).toString('hex')).digest('hex');

    return {
        privateKey,
        publicKey,
        address
    };
}

const { privateKey, publicKey, address } = generateKeyPair();
console.log('Private Key: ', privateKey);
console.log('Public Key: ', publicKey);
console.log('Address: ', address);

class Transaction {
    constructor(sender, recipient, amount, fee) {
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount;
        this.fee = fee;
    }
}

class Block {
    constructor(transactions, nonce, previousBlockHash) {
        this.transactions = transactions;
        this.nonce = nonce;
        this.previousBlockHash = previousBlockHash;
    }
}

class Blockchain { 
    constructor() {
        this.blocks = [];
        this.pendingTransactions = [];
        this.currentDifficulty = 0;
    }
}