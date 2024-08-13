// utils/hash.js
const crypto = require('crypto');

function calculateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateHash(data) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
}


module.exports = { calculateHash, generateHash };
