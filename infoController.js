const { Blockchain } = require('./genKeyPairs.js');

let blockchain = new Blockchain();

function getNodeInfo(req, res) {
    const info = {
        about: 'info',
        nodeId: generateNodeId(),
        chainId: '',
        nodeUrl: '',
        peers: 0,
        currentDifficulty: 0,
        blocksCount: 0,
        cumulativeDifficulty: 0,
        confirmedTransactions: 0,
        pendingTransactions: 0,
    };

    res.json(info);
}