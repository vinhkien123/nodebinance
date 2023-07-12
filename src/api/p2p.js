var express = require('express');
var router = express.Router();
const passport = require('passport');
const passportConfig = require('../middlewares/passport');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {
    success,
    error_400,
    error_500
} = require('../message');
const Binance = require('node-binance-api');
const binance = new Binance({
    APIKEY: '<key>',
    APISECRET: '<secret>'
});
const arraySymbol = ["BTC",
    "LTC",
    "USDT",
    "ETH",
    "BCH",
    "BPAY"
]
const crypto = require("crypto");

const {
    validationResult
} = require('express-validator');

const { authenticateWallet, authenticateKyc, checkWalletToSymbol } = require('../middlewares/authenticate');
const { addSellP2P, addBuyP2P } = require('../controller/p2p');
router.post('/addSellP2P', passport.authenticate('jwt', {
    session: false
}),authenticateKyc, authenticateWallet,checkWalletToSymbol,addSellP2P
);
router.post('/addBuyP2P', passport.authenticate('jwt', {
    session: false
}),authenticateKyc, authenticateWallet,checkWalletToSymbol,addBuyP2P
);

router.get('/exchange', async function (req, res, next) {

    try {
        const data = await customerQuery.getExchangeP2P()
        success(res, "get success !", data)

    } catch (error) {
        error_500(res, error)
    }
});
router.get('/exchange/buysell', async function (req, res, next) {

    try {
        const data = await customerQuery.getExchangeP2PBUYSELL()
        success(res, "get success !", data)

    } catch (error) {
        error_500(res, error)
    }
});
router.get('/getTransactionForm', async function (req, res, next) {

    try {
        const data = await customerQuery.getExchgetTransaction()
        success(res, "get success !", data)

    } catch (error) {
        error_500(res, error)
    }
});
router.get('/exchange/vndusd', async function (req, res, next) {

    try {
        const data = await customerQuery.getVNDTOUSD()
        success(res, "get success !", data)

    } catch (error) {
        error_500(res, error)
    }
});
module.exports = router;