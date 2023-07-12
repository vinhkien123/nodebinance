const Web3 = require('web3');
const DogeWar = require('./contracts/DogeWar.json')
const DogeWarProxy = require('./contracts/DogeWarProxy.json')
const Ruby = require('./contracts/RubyToken.json')
const RubyProxy = require('./contracts/RubyTokenProxy.json')
const WODToken = require('./contracts/WODToken.json')
const DogeHero = require('./contracts/DogeHero.json')
const DogeHeroProxy = require('./contracts/DogeHeroProxy.json')
const GeneScience = require('./contracts/GeneScience.json')
const SaleAuction = require('./contracts/SaleClockAuction.json')
const SaleAuctionProxy = require('./contracts/SaleClockAuctionProxy.json')
const SiringAuction = require('./contracts/SiringClockAuction.json')
const SiringAuctionProxy = require('./contracts/SiringClockAuctionProxy.json')
// wss://speedy-nodes-nyc.moralis.io/6e06ba12c95d358fb54b812f/bsc/testnet/ws
// wss://crimson-crimson-wind.bsc.quiknode.pro/eeac2a2c4facff426cdd86851190365719e2455a/
const RPC = `wss://bsc.getblock.io/testnet/?api_key=3fbe7b1e-fe87-4c0e-9902-789a8da1e2c7`
// const RPC = `wss://speedy-nodes-nyc.moralis.io/6e06ba12c95d358fb54b812f/bsc/testnet/ws`

const web3 = new Web3(new Web3.providers.WebsocketProvider(RPC));
const networkId = '97'
const smallNumber = (amount) => {
    return web3.utils.fromWei(amount)
}
const dogeWarInstance = new web3.eth.Contract(DogeWar.abi, DogeWarProxy.networks[networkId].address)
const dogeHeroInstance = new web3.eth.Contract(DogeHero.abi, DogeHeroProxy.networks[networkId].address)
const ruby = new web3.eth.Contract(Ruby.abi, RubyProxy.networks[networkId].address)
const wodToken = new web3.eth.Contract(WODToken.abi, WODToken.networks[networkId].address)
const geneScience = new web3.eth.Contract(GeneScience.abi, GeneScience.networks[networkId].address)
const saleAuction = new web3.eth.Contract(SaleAuction.abi, SaleAuctionProxy.networks[networkId].address)
const siringAuction = new web3.eth.Contract(SiringAuction.abi, SiringAuctionProxy.networks[networkId].address)
module.exports = {
    web3,
    dogeWarInstance,
    dogeHeroInstance,
    ruby,
    wodToken,
    geneScience,
    saleAuction,
    siringAuction,
    smallNumber
}