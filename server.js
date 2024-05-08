const express = require('express')

const app = express();
const port = 5555;

app.get('/info', (req, res) => {
    res.json({
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
    });
});

app.listen(port, () => {
    console.log(`Blockchain node listening on port ${port}`);
});

function generateNodeId() {
    return Date.now().toString(16) + Math.random().toString(16).substring(2, 8);
}