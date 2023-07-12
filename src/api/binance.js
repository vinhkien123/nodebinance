const express = require('express');
const app = express();

var router = express.Router();
const otplib = require('otplib')
const jwt = require('jsonwebtoken')
const crypto = require("crypto");
const md5 = require('md5');

const passport = require('passport');
const passportConfig = require('../middlewares/passport')

const queries = require('../queries/customerQuery')
const {
    error_500,
    error_400,
    success
} = require('../message');
const customerQuery = require('../queries/customerQuery');
const { authenticateAdmin } = require('../middlewares/authenticate');
const { addChartBinance, getTotalBuy, getTotalSell, getListCoin, orderFuture, closeMarketFuture, closeMarketFutureAll, getHistoryOpenOrder, getHistoryOrder, getPosition, funding, setBalance, getDepositBalance, leverAdjustment, setPercentChart, getListPositionAdmin, getListOrderFutureAdmin } = require('../controller/binance');
const { historyOrderUser } = require('../controller/binaryOption');

router.post('/addChartBinance', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,addChartBinance)
router.get('/funding',funding)

router.post('/getTotalBuy', getTotalBuy)
router.post('/getTotalSell', getTotalSell)
router.post('/getListCoin', getListCoin)
router.post('/orderFuture', passport.authenticate('jwt', {
    session: false
}),orderFuture)
router.post('/setBalance', passport.authenticate('jwt', {
    session: false
}),setBalance)
router.post('/setPercentChart', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,setPercentChart)
router.post('/getListPositionAdmin', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,getListPositionAdmin)
router.post('/getListOrderFutureAdmin', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,getListOrderFutureAdmin)
router.post('/getDepositBalance', passport.authenticate('jwt', {
    session: false
}),getDepositBalance)
router.post('/getHistoryOpenOrder', passport.authenticate('jwt', {
    session: false
}),getHistoryOpenOrder)
router.post('/getHistoryOrder', passport.authenticate('jwt', {
    session: false
}),getHistoryOrder)
router.post('/getPosition', passport.authenticate('jwt', {
    session: false
}),getPosition)
router.post('/leverAdjustment', passport.authenticate('jwt', {
    session: false
}),leverAdjustment)

// router.post('/cancelOpenOrder', passport.authenticate('jwt', {
//     session: false
// }),cancelOpenOrder)
// router.post('/limitFuture', passport.authenticate('jwt', {
//     session: false
// }),limitFuture)
router.post('/closeMarketFuture', passport.authenticate('jwt', {
    session: false
}),closeMarketFuture)
router.post('/closeMarketFutureAll', passport.authenticate('jwt', {
    session: false
}),closeMarketFutureAll)

// router.post('/getPosition', passport.authenticate('jwt', {
//     session: false
// }),getPosition)
module.exports = router;