

D E S I G N I N G T H E B LO C KC H A I N N O D E


###### N o d e , C h a i n , B l o c k s , Tra n s a c t i o n s , G e n e s i s

###### B l o c k , M i n i n g , Pe e rs a n d Sy n c h ro n i za t i o n

```
Blockchain System Architecture
Keys, Addresses, Coins, Balances, Genesis Block
Designing the REST API
```

```
Building the Blockchain Node
Implementing the Blocks
Implementing the Transactions ,
Addresses, and Balances
Implementing the Mining Process
Peers , Synchronization and Consensus
```


## BLOCKCHAIN SYSTEM ARCHITECTURE

N o d e s , M i n e r s , F a u c e t , W a l l e t s , E x p l o r e r

**Node Wallet**

**Block Explorer**

**Miner**

**Faucet**


#### B l o c kc h a i n Sy ste m A rc h i te c t u re

**Node**

```
▪ Chain
▪ Blocks
▪ Transactions
▪ Balances
▪ Mining jobs
▪ Peers and sync
```

**Wallet**

```
▪ Keep private keys
▪ Check balances
▪ Send transactions
```

**Miner**

```
▪ Get mining block
▪ Mine (PoW)
▪ Submit result
```

**Block Explorer**

```
▪ View blocks
▪ View confirmed
transactions
▪ View pending
transactions
▪ View accounts
and balances
▪ View peers map
```

**Faucet**

▪ Request coins


#### Key s a n d A d d re s s e s

**Elliptic curve cryptography** (ECC), using the **secp256k1** curve

```
private key
privKey
```

```
public key
= privKey* G
```

```
address
= ripemd(pubKey)
```

```
256 - bit number
64 hex digits
```

```
{x, y} - 256 - bit numbers
compressed: { x , 0 / 1 }
65 hex digits
```

```
RIPEMD- 160 of the
compressed public key
40 hex digits
7e4670ae70c98d24f3662c172dc510a085578b9ccc717e6c2f4e547edd960a
c74a8458cd7a7e48f4b7ae6f4ae9f56c5c88c0f03e7c59cb4132b9d9d1600bba
```

```
c3293572dbe6ebc60de4a20ed0e21446cae66b
```


#### C o i n s a n d Re wa rd s

```
Coins are 64-bit integers (no real numbers!)
1 coin = 1 000 milli-coins = 1 000 000 micro-coins
```

All transfers, fees, block awards are defined in **micro-coins**

```
The block reward (per mined block) is static
5 000 000 micro-coins
```

```
The minimum transaction fee (to avoid spam) is
10 micro-coins
```


#### T h e R EST A P I

For simplicity, implement a simple **RESTful API**

```
Default listening HTTP port → 5555
The host is the external hostname / IP address of the node
```

```
GET / POST http://{host}:5555/some-endpoint
```

```
{
" JSON-encoded response "
}
```

```
200 OK / 404 Not Found
```


#### B l o c kc h a i n N e t wo r k : R EST A P I

```
https://stormy-everglades-34766.herokuapp.com
```

```
```

## BUILDING THE BLOCKCHAIN NODE

C h a i n , B l o c k s , T r a n s a c t i o n s , A d d r e s s e s ,
B a l a n c e s , P e e r s & S y n c , D e s i g n i n g t h e R E S T A P I


#### Building the Blockchain Node

```
Holds peers + network communication ( REST API for simplicity)
Each node is uniquely identified by its NodeId and has public URL
for its REST API
```

**Node**

```
▪ NodeId: unique_string
▪ SelfUrl: URL
▪ Peers: map(nodeId → URL)
▪ Chain: Blockchain
▪ REST Endpoints
```


#### Building the Blockchain

```
Holds the blocks + transactions
Also serves as a mining pool
Consensus algorithm: proof of work (SHA256 hashing)
The chain with most work (~ the longest) is the main chain
```

**Blockchain**

```
▪ Blocks: Block[]
▪ PendingTransactions: Transaction[]
▪ CurrentDifficulty: integer
▪ MiningJobs: map(blockDataHash → Block)
```


#### R EST E n d p o i nt s : I n fo

```
nodeId == unique node ID (based on datetime + random )
chainId == the hash of the genesis block (identifies the chain)
Nodes can provide additional info by choice
```

```
GET http://{host}:5555/info
```

```
{ "about": "KingslandUniChain/0.9-csharp",
"nodeId": " 1a22d3...9b2f ", chainId: " c6da93eb...c47f ",
"nodeUrl": "http://chain-node-03.herokuapp.com",
"peers": 2 , "currentDifficulty": 5 ,
"blocksCount": 25 , "cumulativeDifficulty": 127
"confirmedTransactions": 208 , "pendingTransactions": 7
}
```

```
200 OK
```


**R E S T E n d p o i n t s : D e b u g I n fo ( A l l N o d e D a t a )**

Provide as much info as possible (to simplify debugging)

```
GET http://{host}:5555/debug
```

```
{ "selfUrl": "http://localhost:5555", "peers": { ... },
"chain": {
"blocks": [{"index": 0,"transactions ":[...], "difficulty": 0,
"prevBlockHash": "d9...9c", "minedBy":"af...b2","nonce": 0,
"blockDataHash ": "af25...d9", " dateCreated": "2018- 01 - ..."},
"blockHash ": "c962...a8"}, {...}, {...}],
"pendingTransactions ": [{...}, ...], " currentDifficulty": 5,
"miningJobs ": {"e3d8...5f": {...}, "25c1...a8": {...}, }
}, "confirmedBalances ": {"2a7e...cf": 500020, ... }
}
```

```
200 OK
```


R E S T E n d p o i n t s : D e b u g → Re s e t C h a i n

```
Use this endpoint for debugging / testing purposes only
It should reset the entire chain to its initial state
Blocks, transactions, balances → reset to the genesis block
All transactions and balances will be lost (except the genesis
transactions)
Peers → keep all connections
```

```
GET http://{host}:5555/debug/reset-chain
```

```
{
"message": "The chain was reset to its genesis block"
}
```

```
200 OK
```

```
```

## IMPLEMENTING BLOCKS

C h a i n e d B l o c k s H o l d i n g T r a n s a c t i o n s


**Block**

#### Building the Blockchain Node: Blocks

```
▪ Index: integer (unsigned)
▪ Transactions: Transaction[]
▪ Difficulty: integer (unsigned)
▪ PrevBlockHash: hex_number[64]
▪ MinedBy: address (40 hex digits)
```

```
▪ BlockDataHash: hex_number[64]
▪ Nonce: integer (unsigned)
▪ DateCreated: ISO8601_string
▪ BlockHash: hex_number[64]
```

```
SHA
Assigned by
the miners
```


#### C a l c u l at i n g t h e B l o c k D ata H a s h

```
The block data hash is calculated by SHA256 hashing the JSON
representation of following block fields (in exactly this order):
' index '
' transactions ', each holding these fields:
' from ', ' to ', ' value ', ' fee ', ' dateCreated ', ' data ', ' senderPubKey ',
' transactionDataHash ', ' senderSignature ', ' minedInBlockIndex ',
' transferSuccessful '
' difficulty ', ' prevBlockHash ', ' minedBy '
```


#### R EST E n d p o i nt s : A l l B l o c ks

```
GET http://{host}:5555/blocks
```

```
[ {
"index": 0 ,
"transactions": [ ... ],
"difficulty": 5 ,
"prevBlockHash": " d279fa6a31ae4fb07cfd9cf7f35cc01f...3cf20a ",
"minedBy": "91c43337992580bca7d5f758d09e88f9b7032a65",
"blockDataHash": " 5d845cddcd4404ecfd5476fd6b1cf0e5...a80cd3 ",
"nonce": 2455432 ,
"dateCreated": " 2018 - 02 - 01T23:23:56.337Z ",
"blockHash": " 00000abf2f3d86d5c000c0aa7a425a6a4a65...cf4c "
}, {"index": 1 , ...}, {" index": 2 , ...}, ...]
```

```
200 OK
```


#### R EST E n d p o i nt s : B l o c k b y N u m b e r

```
GET http://{host}:5555/blocks/
```

```
{
"index": 11 ,
"transactions": [ ... ],
"difficulty": 4 ,
"prevBlockHash": " e69cb1368aa174c9e5548f4e5adb0d3b4c6c...ef25 ",
"minedBy": "91c43337992580bca7d5f758d09e88f9b7032a65",
"blockDataHash": " 5d845cddcd4404ecfd5476fd6b1cf0e5...a80cd3 ",
"nonce": 2455432 ,
"dateCreated": " 2018 - 02 - 01T22:58:23.129Z ",
"blockHash": " d2c6ee29ff14b49e31c409af985824ea12afccc8...e4cd "
}
```

```
200 OK / 404 Not Found
```


###### T h e G e n e s i s B l o c k – T h e S t a r t o f t h e C h a i n

```
The genesis block has index = 0
It has no miner: mined by = " 0000...00 ", difficulty = 0, nonce = 0
The genesis date is a fixed constant (the chain birthday)
Holds the initial faucet transaction (fill the faucet with initial coins)
```

```
{
"index": 0 , "transactions ": [ ... ], " difficulty": 0 ,
"minedBy": " 0000000000000000000000000000000000000000 ",
"blockDataHash": " 15cc5052fb3c307dd2bfc6bcaa05763225...cefc ",
"nonce": 0 , "dateCreated": " 2018 - 01 - 01T00:00:00.000Z",
"blockHash": " c6da93eb4249cb5ff4f9da36e2a7f8d0d6199...cc47f "
},
http://{host}:5555/blocks/
```


## IMPLEMENTING TRANSACTIONS

T r a n s a c t i o n s T r a n s f e r S o m e V a l u e / D a t a


**Transaction**

###### B u i l d i n g t h e B l o c kc h a i n N o d e : Tra n s a c t i o n s

```
▪ From: address (40 hex digits)
▪ To: address (40 hex digits)
▪ Value: integer (non-negative)
▪ Fee: integer (non-negative)
▪ DateCreated: ISO8601_string
▪ Data: string (optional)
▪ SenderPubKey: hex_number[65]
▪ TransactionDataHash: hex_number
▪ SenderSignature: hex_number[2][64]
▪ MinedInBlockIndex: integer / null
▪ TransferSuccessful: bool
```

```
SHA256
Sign with private
Assigned key
when a new
block is mined
```


**T h e Fa u c e t Tra n s a c t i o n i n t h e G e n e s i s B l o c k**

```
Send initially some coins to the faucet address in the genesis block, so
it to be able to fund the other addresses
```

```
{
"from": " 0000000000000000000000000000000000000000 ",
"to": "f3a1e69b6176052fcc4a3248f1c5a91dea308ca9",
"value": 1000000000000 , "fee": 0 ,
"dateCreated": " 2018 - 01 - 01T00:00:00.000Z",
"data": "genesis tx",
"senderPubKey": " 000000000000000000000000000000000000...00 ",
"transactionDataHash": " 8a684cb8491ee419e7d46a0fd24...ecc2 ",
"senderSignature": [" 0000...00 "," 0000...00 "],
"minedInBlockIndex": 0 , "transferSuccessful": true
}
```


###### R E S T E n d p o i n t s : G e t Pe n d i n g Tra n s a c t i o n s

```
GET http://{host}:5555/transactions/pending
```

```
[{
"from": "44fe0696beb6e24541cc0e8728276c9ec3af2675",
"to": "9a9f082f37270ff54c5ca4204a0e4da6951fe917",
"value": 25000 , "fee": 10 ,
"dateCreated": " 2018 - 02 - 10T17:53:48.972Z", "data": " ... ",
"senderPubKey": " 2a1d79fb8743d0a4a8501e0028079bcf82a4f...eae1 ",
"transactionDataHash": " 4dfc3e0ef89ed603ed54e47435a18...176a ",
"senderSignature": [" e20c...a3c29df79f ", " cf92...0acd0c2ffe56 "]
},
{ ... }, { ... }]
```

```
200 OK
```


**R E S T E n d p o i n t s : G e t C o n f i r m e d Tra n s a c t i o n s**

```
GET http://{host}:5555/transactions/confirmed
```

```
[{
"from": "44fe0696beb6e24541cc0e8728276c9ec3af2675",
"to": "9a9f082f37270ff54c5ca4204a0e4da6951fe917",
"value": 25000 , "fee": 10,
"dateCreated": " 2018 - 02 - 10T17:53:48.972Z", "data": " ... ",
"senderPubKey": " 2a1d79fb8743d0a4a8501e0028079bcf82a4f...eae1 ",
"transactionDataHash": " 4dfc3e0ef89ed603ed54e47435a18...176a ",
"senderSignature": [" e20c...a3c29df79f ", " cf92...0acd0c2ffe56 "]
"minedInBlockIndex": 7 , "transferSuccessful": true
}, { ... }, { ... }]
```

```
200 OK
```


#### C a l c u l at i n g t h e Tra n s a c t i o n D ata H a s h

```
The transaction data hash uniquely identifies a transaction
Like in Etherscan:
https://etherscan.io/tx/0xb03b6c7ef5c555001b41c32e5ac2c600c5e2
c72b6918b3d68c0f3dd4b5cb54a8
Calculated by the transaction data fields only:
' from ', ' to ', ' value ', ' fee ', ' dateCreated ', ' data ', ' senderPubKey '
Does not include the signature and execution info (the mined block
index + success of the execution)
Pending and unsigned transactions also have data hash
( unique ID )
```


#### R EST E n d p o i nt s : G e t Tra n s a c t i o n b y H a s h

```
GET http://{host}:5555 /transactions/44fc3ee0f89ed6003...176a
```

```
{
"from": "44fe0696beb6e24541cc0e8728276c9ec3af2675",
"to": "9a9f082f37270ff54c5ca4204a0e4da6951fe917",
"value": 25000 , "fee": 10 ,
"dateCreated": " 2018 - 02 - 10T17:53:48.972Z", "data": " ... ",
"senderPubKey": " 2a1d79fb8743d0a4a8501e0028079bcf82a4...eae1 ",
"transactionDataHash": " 44fc3ee0ef89ed6003ed54e47435a18...176a ",
"senderSignature": [" e20c...a3c29df79f ", " cf92...0acd0c2ffe56 "],
"minedInBlockIndex": 7 ,
"transferSuccessful": true
}
```

```
200 OK / 404 Not Found
```

```
The last two fields appear only
after the transaction is mined
```


#### R EST E n d p o i nt s : L i st A l l A c co u nt B a l a n c e s

```
Lists all accounts that have non-zero confirmed balance
The all-zeros-address (the genesis address) will have negative balance
```

```
GET http://{host}:5555/balances
```

```
{
" 0000000000000000000000000000000000000000 ": - 1000340000110 ,
"f3a1e69b6176052fcc4a3248f1c5a91dea308ca9": 999998382585 ,
"84ede81c58f5c490fc6e1a3035789eef897b5b35": 340000110 ,
"a1de0763f26176c6d68cc77e0a1c2c42045f2314": 894961 ,
"b3d72ad831b3e9cdbdaeda5ff4ae8e9cf182e548": 709999 ,
"a2de0763f26176c6d68cc77e0a1c2c42045f2314": 12345
}
```

```
200 OK
```


##### R E S T E n d p o i nt s : L i st Tra n s a c t i o n s fo r A d d re s s

```
All transactions , associated with the given address are returned
Confirmed transactions (successful or not) + pending transactions
Order the transactions by date and time (ascending)
Pending transactions will not have minedInBlockIndex
```

```
GET http://{host}:5555 /address/44fe...2a75 /transactions
```

```
{
"address": "44fe0696beb6e24541cc0e8728276c9ec3af2a75",
"transactions ": [{ ... }, { ... }, { ... }]
}
```

```
200 OK / 404 Not Found
```


#### R EST E n d p o i nt s : G e t B a l a n c e s fo r A d d re s s

```
The address balance is calculated by iterating over all transactions
For each block and for each successful transaction for the specified
address, matching the confirmations count, sum the values received +
spent + fees
```

```
GET http://{host}:5555 /address/44fe...2a75 /balance
```

```
{
"safeBalance": 120 ,
"confirmedBalance": 115 ,
"pendingBalance": 170
}
```

```
200 OK / 404 Not Found
```

```
The safe confirm
count = 6
```


#### B a l a n c e s fo r A d d re s s

```
Each address has 3 types of balances
safeBalance – 6 confirmations or more confirmations
confirmedBalance – 1 or more confirmations
pendingBalance – expected balance (0 confirmations)
It is assumed that all pending transactions will be successful
```

Each successful **received** transaction **adds value**

All **spent** transactions subtract the transaction **fee**

Successful **spent** transactions **subtract value**


##### R E S T E n d p o i nt s : B a l a n c e s I nva l i d fo r A d d re s s

```
Return zero balances for non-active addresses (no transactions)
For invalid addresses:
Return " 404 Not Found " with errorMsg = " Invalid address "
```

```
GET http://{host}:5555/address/invalidAddress/balance
```

```
{
"safeBalance": 0 ,
"confirmedBalance": 0 ,
"pendingBalance": 0
}
```

```
200 OK / 404 Not Found
```


#### C re at i n g a Tra n s a c t i o n

```
To create a transaction you need:
Sender public key – 65 hex digits; Recipient address (to) – 40 hex digits
Transfer value – positive integer; Fee for the miners – positive integer
Date & time (to avoid replay attacks) – ISO8601 UTC datetime string
Transaction data (payload / comments) – optional string
The sender's address (from) is derived from the sender public key
```

```
{ "from": "c3293572dbe6ebc60de4a20ed0e21446cae66b17",
"to": "f51362b7351ef62253a227a77751ad9b2302f911",
"value": 25000 , "fee": 10 , "dateCreated": " 2018 - 02 - 10T17:53:48.972Z",
"senderPubKey": " c74a8458cd7a7e48f4b7ae6f4ae9f56c5c88c0f03e7...bba1 "
}
```


#### S i g n i n g a Tra n s a c t i o n

```
To sign a transaction, a private + public key are required
First, put the transaction data in a JSON object (without signature)
Fields order: ' from ', ' to ', ' value ', ' fee ', ' dateCreated ', ' datа ', ' senderPubKey '
```

```
The from address should always derive from the sender public key
Remove any whitespace, calculate SHA256 and sign it
When the ' data ' field is empty, remove it from the JSON
```

```
{
"from": "c3293572dbe6ebc60de4a20ed0e21446cae66b17",
"to": "f51362b7351ef62253a227a77751ad9b2302f911", "value": 25000 ,
"fee": 10 , "dateCreated":" 2018 - 02 - 10T17:53:48.972Z ", "data": "funds",
"senderPubKey": " c74a8458cd7a7e48f4b7ae6f4ae9f56c5c88c0f03e...bba1 "
}
```


#### S i g n i n g a Tra n s a c t i o n – E xa m p l e

Sender's private key:

Corresponding public key (compressed):

```
Sender address:
Sample transaction data (still not signed):
```

```
{ "from": "c3293572dbe6ebc60de4a20ed0e21446cae66b17",
"to": "f51362b7351ef62253a227a77751ad9b2302f911", "value": 25000 ,
"fee": 10 , "dateCreated":" 2018 - 02 - 10T17:53:48.972Z", "data": "funds",
"senderPubKey": " c74a8458cd7a7e48f4b7ae6f4ae9f56c5c88c0f03e7...bba1 " }
```

```
7e4670ae70c98d24f3662c172dc510a085578b9ccc717e6c2f4e547edd960a34
```

```
c74a8458cd7a7e48f4b7ae6f4ae9f56c5c88c0f03e7c59cb4132b9d9d1600bba1
```

```
c3293572dbe6ebc60de4a20ed0e21446cae66b17
```


#### S i g n i n g a Tra n s a c t i o n – E xa m p l e ( 2 )

JSON-serialized transaction data for signing (whitespace removed):

**Transaction data hash** for signing (SHA-256):

ECDSA **signature** of the above hash (signed signature bytes):

The ECDSA signature consists of **2 \* 64 hex digits** (2 \* 256 bits)

```
{"from":"c3293572dbe6ebc60de4a20ed0e21446cae66b17","to":"f51362b7351
ef62253a227a77751ad9b2302f911","value":25000,"fee":10,"dateCreated":
"2018- 02 - 10T17:53:48.972Z","data":"funds","senderPubKey":
"c74a8458cd7a7e48f4b7ae6f4ae9f56c5c88c0f03e7c59cb4132b9d9d1600bba1"}
```

```
6a3a7859c389bad17d79c5856e17a74daecfa6d67aab237132b5dc8849b5467e
```

```
r=33be705476889fbb647633a9272cf546401f22e87f0c2b2a6c58ff56b7aa368a
s=66722e9b58a05952a986ee2c90faa1cc828575503cfc393278006629f20bd78c
```


#### S i g n i n g a Tra n s a c t i o n – E xa m p l e ( 3 )

Signed transaction (the data hash + signature added in the JSON):

```
Use deterministic ECDSA signature , based on the curve secp256k1
and RFC- 6979 with HMAC-SHA256
```

```
{ "from": "c3293572dbe6ebc60de4a20ed0e21446cae66b17",
"to": "f51362b7351ef62253a227a77751ad9b2302f911", "value": 25000 ,
"fee": 10 , "dateCreated": " 2018 - 02 - 10T17:53:48.972Z", "data": "funds",
"senderPubKey":
"c74a8458cd7a7e48f4b7ae6f4ae9f56c5c88c0f03e7c59cb4132b9d9d1600bba1",
"transactionDataHash": " 6a3a7859c389bad17d79c5856e17a74daecfa6d...467e ",
"senderSignature": [
"33be705476889fbb647633a9272cf546401f22e87f0c2b2a6c58ff56b7aa368a",
"66722e9b58a05952a986ee2c90faa1cc828575503cfc393278006629f20bd78c"
]
}
```


```
{ "transactionDataHash": " cd8d9a345bb208c6f9b8acd6b8eef...20c8a " }
```

#### R EST E n d p o i nt s : S e n d Tra n s a c t i o n

The transaction as accepted by the Node only after successful validation

```
POST http://{host}:5555/transactions/send
{
"from": "c3293572dbe6ebc60de4a20ed0e21446cae66b17",
"to": "f51362b7351ef62253a227a77751ad9b2302f911",
"value": 25000 , "fee": 10 , "dateCreated": " 2018 - 02 - 10T17:53:48.972Z",
"data": "first payment (50%)", "senderPubKey":
" c74a8458cd7a7e48f4b7ae6f4ae9f56c5c88c0f03e7c59cb4132b9d9d1600bba1 ",
"senderSignature": [" 1aaf55dcb1...68b0 "," 87250a2841...7960 "]
}
```

```
201 Created / 400 Bad Request
```


#### S e n d Tra n s a c t i o n s

```
For each received transaction the Node does the following:
Checks for missing / invalid fields / invalid field values
Calculates the transaction data hash (unique transaction ID)
Checks for collisions → duplicated transactions are skipped
Validates the transaction public key , validates the signature
Checks the sender account balance to be >= value + fee
Checks whether value >= 0 and fee > 10 (min fee)
Puts the transaction in the " pending transactions " pool
Sends the transaction to all peer nodes through the REST API
It goes from peer to peer until it reaches the entire network
```


```
{
"errorMsg": "Invalid transaction: field 'from' is missing"
}
```

**R E S T E n d p o i n t s : S e n d Tra n s a c t i o n** → **E r r o r**

```
In case of error , the response holds a JSON object with human-
readable error message (like shown above)
```

```
POST http://{host}:5555/transactions/send
{
"some invalid data": "some invalid value"
}
```

```
400 Bad Request
```

```
```

## IMPLEMENTING MINING

P r o o f -of-w o r k M i n i n g


##### I m p l e m e nt i n g t h e M i n i n g : G e t M i n i n g J o b

```
Nodes act like mining pools
Prepare the next block candidate for mining and give it to the miners
Miners submit back the mined hash + nonce + timestamp to the Node
```

```
GET http://{host}:5555/mining/get-mining-job/{miner-address}
```

```
{
"index": 50 ,
"transactionsIncluded": 17 , difficulty: 5 ,
"expectedReward": 5000350 , "rewardAddress": " 9a9f08...fe917 ",
"blockDataHash": " d2c6ee29ff14b499af985824ea12afccc8...e4cd ",
}
```

```
200 OK / 400 Bad Request
```


#### T h e C o i n b a s e Tra n s a c t i o n ( Re wa rd )

```
A special coinbase transaction is inserted before all transactions
in the candidate block, to transfer the block reward + fees
The sender address, sender public key and signature are zeroes
```

```
{ "from": " 0000000000000000000000000000000000000000 ",
"to": "9a9f082f37270ff54c5ca4204a0e4da6951fe917",
"value": 5000350 , "fee": 0 , "dateCreated":
" 2018 - 02 - 10T17:53:48.972Z", "data": "coinbase tx",
"senderPubKey": " 000000000000000000000000000000000000...0000 ",
"transactionDataHash": " 4dfc3e0ef89ed603ed54e47435a18b...176a ",
"senderSignature": [" 0000000000 ...0000 ", " 0000000000 ...0000 "],
"minedInBlockIndex": 35 , "transferSuccessful": true,
}
```


#### H o w to C a l c u l ate t h e B l o c k D ata H a s h?

```
Nodes prepare block candidates and calculate their data hash
Use JSON representation of the block data (no whitespace)
Fields order: " index ", " transactions ", " difficulty ", " prevBlockHash " (when
exists), " minedBy "
Dates should come as text, in ISO-8601 format
Hex numbers are always written in lowercase, e.g. c6af , not C6AF
The JSON data is hashed using SHA256
```

```
string json = toJSON(block_data)
string block_data_hash = SHA256(json)
```


#### B l o c k C a n d i d ate J S O N – E xa m p l e

```
{
"index": 11 ,
"transactions": [ { "from": " ... ", "to": " ... ", "value": ... ,
"fee": ... , "dateCreated": " ... ", "data": " ... ", "senderPubKey": " ... ",
"transactionDataHash": " ... ", "senderSignature": [" ... ", " ... "],
"minedInBlockIndex": ... , "transferSuccessful": ... },
{ ... }, { ... }, { ... }, ...
],
"difficulty": 4 , "prevBlockHash": " c53ff38acf9dde78a2...a78 ",
"minedBy": "91c43337992580bca7d5f758d09e88f9b7032a65",
"blockDataHash": " e69cb1368aa174c9e58f4e5adb0d3b4c6c...ef25 "
}
```


#### Tra n s a c t i o n s i n t h e B l o c k C a n d i d ate s

```
Each transaction in the block candidate (after processing) is
represented as a JSON object like this:
```

```
{
"from": "44fe0696beb6e24541cc0e8728276c9ec3af2675",
"to": "9a9f082f37270ff54c5ca4204a0e4da6951fe917",
"value": 25000 , "fee": 10 , "dateCreated":
" 2018 - 02 - 10T17:53:48.972Z", "data": "party: 50% prepayment",
"senderPubKey": " 2a1d79fb8743d0a4a8501e0028079bcf82a4f...eae1 ",
"transactionDataHash": " 4dfc3e0ef89ed603ed54e47435a18b...176a ",
"senderSignature": [" e20c...a3c29df79f ", " cf92...0acd0c2ffe56 "],
"minedInBlockIndex": 73 , "transferSuccessful": true
}
```


#### T h e M i n i n g P ro c e s s : P re p a rat i o n

```
When a Miner requests a block for mining , the node prepares it:
Creates the next block candidate : executes all pending transactions
and adds them in the block candidate + inserts a coinbase tx
Calculates the block data hash and provides it to the miner
The Node keeps a separate block candidate for each mining request
It holds map<blockDataHash → block>
If a miner requests a block candidate again , the Node sends an
updated block (eventually holding more transactions)
The Node will always return the latest block for mining , holding the
latest pending transactions (to collect maximum fees)
```


**Block Candidate**

#### T h e M i n i n g P ro c e s s : Tr y i n g M a ny H a s h e s

```
The miner changes the nonce + timestamp in a loop until it
finds a SHA256 hash starting with d zeroes ( d == block
difficulty )
The Miner submits the mined block hash to the Node
1 - 2 times per second the miner
may take an updated block
candidate from the Node
Miners may start several
parallel threads to
speed-up the mining
```

```
▪ BlockDataHash: hex_number
▪ Nonce: number
▪ DateCreated: timestamp
```

▪ BlockHash: hex_number

**SHA256**


#### B u i l d i n g t h e M i n e rs H a s h

Calculating the block hash:

Example of block data for hashing (by the miners):

The hash is a **proof-of-work** of difficulty 5 (starts with 5 zeroes)

```
minedBlockHash = SHA256(blockDataHash|dateCreated|nonce)
```

```
df8f114897188bcc68b97ebe2b673d3c92de986024abe565df0a4f8702c1742b|
2018 - 02 - 11T20:31:32.397Z|1453826
```

```
00000 1c2093443767ea191ee058fa034593b41f45ce8001f0da4f888e1eab69b
```

**SHA256**


#### P ro c e s s i n g a M i n e d B l o c k

```
Miners submit their mined block hash (+ date + nonce )
Node builds the mined block and propagates it through the network
```

```
When a miner submits a proof-of-work hash
The node finds the block candidate by its blockDataHash
The node verifies the hash + its difficulty and builds the next block
The block candidate is merged with the nonce + timestamp + hash
Then if the block is still not mined , the chain is extended
Sometimes other miners can be faster → the mined block is expired
Then all peers are notified about the new mined block
```


#### I m p l e m e nt i n g t h e M i n i n g : S u b m i t B l o c k

```
POST http://{host}:5555/mining/submit-mined-block
```

```
{
"message": "Block accepted, reward paid: 5000350 microcoins"
}
```

```
{
"blockDataHash": " df8f114897188bcc68b97ebe2b673d3c92d...742b ",
"dateCreated": " 2018 - 02 - 11T20:38:56.692Z", "nonce": 1177127 ,
"blockHash": " 00000641e21ffceea0fce17c6b2f21668cc52886...745b "
}
```

```
200 OK / 404 Not Found / 400 Bad Request
```


**I m p l e m e n t i n g t h e M i n i n g : S u b m i t I nv a l i d B l o c k**

```
POST http://{host}:5555/mining/submit-mined-block
```

```
{
"errorMsg": " Block not found or already mined "
}
```

```
{
"blockDataHash": " df8f114897188bcc68b97ebe2b673d3c92d...742b ",
"dateCreated": " 2018 - 02 - 11T20:38:56.692Z", "nonce": 1177127 ,
"blockHash": " 00000641e21ffceea0fce17c6b2f21668cc52886...745b "
}
```

```
404 Not Found
```


#### T h e M i n i n g Po o l i n t h e N o d e s

```
Internally nodes implement a simple mining pool
Consists of mining jobs (block candidates sent to the miners)
```

```
Each mining job has a blockDataHash and belongs to some miner
The coinbase transaction in the job is assigned to the miner's
address
After a new block is mined in the network (by someone)
All pending mining jobs are deleted (because are no longer valid)
When a miner submits a mined block later → 404 "Not Found"
```

MiningJobs: map<blockDataHash → Block candidate>


#### R EST E n d p o i nt s : D e b u g → M i n e a B l o c k

Use this endpoint for debugging / testing purposes only. Example:

```
GET http://{host}:5555/debug/mine/{minerAddress}/{difficulty}
```

```
{
"index": 44,
"transactions ":[{"from":"0x1...","to":"0x2...","value":5},{...}],
"difficulty":3,"minedBy":"0x3","dateCreated":"2018- 05 - 10",...
}
```

```
200 OK
```

```
GET http://{host}:5555 /debug/mine/af85c8...9e/3
```

```
It should mine the pending transaction and create the next block
Executes the entire mining process: get mining job → calculate
valid proof-of-work hash → submit the mined job
```


#### N e t wo r k D i f f i c u l t y : S tat i c o r D y n a m i c?

```
The network difficulty in each block candidate
Specifies the number of leading zeroes in the expected mined block
SHA256 hash, e.g. 5 leading zeroes
Difficulty might be a constant number (hard-coded in the nodes)
Advanced developers might adjust the difficulty over the time using some
calculations to target a fixed number of seconds between blocks
For example, if the target block time == 5 seconds
For the next block, the difficulty can be dynamically adjusted:
If average block time for the entire chain < 5 → difficulty++
If average block time for the entire chain > 5 → difficulty--
```

```
```

## PEERS AND SYNCHRONIZATION


#### R EST E n d p o i nt s : L i st A l l Pe e rs

```
Peers are described by their unique nodeId and URL
map(nodeId → url)
```

```
Each node is connected to a few neighbor peers
Not to all peers in the network
```

```
{
"162269f6993d2b5440dddcd6": "http://localhost:5556",
"162266dff5753a87a3e72403": "http://af6c7a.ngrok.org:5555",
}
```

```
GET http://{host}:5555/peers
```

```
200 OK
```


#### R EST E n d p o i nt s : C o n n e c t a Pe e r

```
Always keep the connections bi-directional
If Alice is connected to Bob, then Bob should also be connected to Alice
```

```
{
"message":
" Connected to peer: http://212.50.11.109:5556 "
}
```

```
POST http://{host}:5555/peers/connect
{
"peerUrl": "http://212.50.11.109:5556"
}
```

```
200 OK / 409 Conflict / 400 Bad Request
```


#### R EST E n d p o i nt s : C o n n e c t a Pe e r ( I nva l i d )

```
If a node is already connected to given peer, return " 409 Conflict "
If the chain ID does not match, don't connect, return " 400 Bad Request "
```

```
{
"errorMsg":
" Already connected to peer: http://212.50.11.109:5556 "
}
```

```
POST http://{host}:5555/peers/connect
{
"peerUrl": "http://212.50.11.109:5556"
}
```

```
409 Conflict / 400 Bad Request
```


#### C o n n e c t i n g to a Pe e r

```
To avoid double-connecting to the same peer
First get /info and check the nodeId
Never connect twice to the same nodeId
To ensure bi-directional connections
When Alice is connected to Bob, try to connect Bob to Alice
First check for existing connection: get /info and check the nodeId
After successful connection to a peer, try to synchronize the
chain (if the peer has better chain) + synchronize the pending
transactions
```


**S y n c h r o n i z i n g t h e C h a i n & Pe n d i n g Tx s**

```
Synchronizing the chain from certain peer
First get /info and check the peer's chain cumulative difficulty
If the peer chain has bigger difficulty, download it from /blocks
Validate the downloaded peer chain (blocks, transactions, etc.)
If the peer chain is valid, replace the current chain with it
Notify all peers about the new chain
```

```
Synchronizing the pending transactions from certain peer
Download /transactions/pending and append the missing ones
Transactions with the same hash should never be duplicated
```


#### Va l i d at i n g a C h a i n

```
When a chain is downloaded from a peer, it needs be validated
Validate the genesis block → should be exactly the same
Validate each block from the first to the last
Validate that all block fields are present and have valid values
Validate the transactions in the block
Validate transaction fields and their values , recalculate the transaction data
hash , validate the signature
Re-execute all transactions, re-calculate the values of minedInBlockIndex and
transferSuccessful fields
```


#### Va l i d at i n g a C h a i n ( 2 )

```
Validate each block from the first to the last (cont.)
Re-calculate the block data hash and block hash for each block
Ensure the block hash matches the block difficulty
Validate that prevBlockHash == the hash of the previous block
Re-calculate the cumulative difficulty of the incoming chain
If the cumulative difficulty > current cumulative difficulty
Replace the current chain with the incoming chain
Clear all current mining jobs (because they are invalid)
```


#### C a l c u l at i n g t h e C u m u l at i ve D i f f i c u l t y

```
Difficulty 0 == 0 leading zeroes → every hash works well
Difficulty 1 == 1 leading zero → 1/16 of hashes work
Difficulty 2 == 2 leading zero → 1/256 of hashes work
...
Conclusion: difficulty p is 16 times more difficult than p- 1
```

```
Cumulative difficulty == how much effort is spent to calculate it
cumulativeDifficulty == 16 ^ d 0 + 16 ^ d 1 + ... 16 ^ dn
where d 0 , d 1 , ... dn are the individual difficulties of the blocks
```


```
A peer should notify all its connected peers when
A new block is mined or new valid block is received from some peer
A chain of higher difficulty was arrived (synchronized) from other peer
```

```
{ "message": " Thank you for the notification. " }
```

```
POST http://{host}:5555/peers/notify-new-block
{ "blocksCount": 51 , "cumulativeDifficulty": 283 ,
"nodeUrl": "http://chain-node-03.herokuapp.com:5555" }
```

```
200 OK
```

**R E S T E n d p o i n t s : N o t i f y Pe e r s a b o u t N e w B l o c k**


#### N o t i f y i n g a l l C o n n e c te d Pe e rs

```
A node sends notification to all its connected peers when a change
in the chain occurs
If the chain cumulative difficulty is increased (new block is mined /
better chain is received)
```

```
The notified node should check whether the new block ends to a better
chain (based on the cumulative difficulty) and then accept the new chain
The new chain is downloaded from nodeUrl/blocks (using an
additional HTTP request)
This notification might be also sent over a Web Socket
```


#### D e l e t i n g L o st Pe e rs

```
Extra: implement functionality to delete lost peers
If a peer is contacted and it does not respond, delete it from the
connected peers
```

```
If /info does not return the correct peerId
It is invalid or does not respond → delete it
You may run this check once per minute or when you send a
notification about a new block
```

```
68
```

```
```

## B u i l d i n g a B l o c kc h a i n

# Questions?

```
```

```
```

### T H A N K Y O U
