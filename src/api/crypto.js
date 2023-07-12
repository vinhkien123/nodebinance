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
const { widthdraw, getHistoryWidthdraw, getHistoryWidthdrawAdmin, withdrawalConfirmation, transfer, getHistoryTransfer, getHistoryTransferAdmin, getHistoryDeposit, getHistoryDepositAdmin, cancelWidthdraw } = require('../controller/crypto');
const { authenticateAdmin, spinRedis, authenticateKyc, authenticateBlock, check2fa } = require('../middlewares/authenticate');

router.post('/widthdraw', passport.authenticate('jwt', {
    session: false
}),authenticateBlock,authenticateKyc,check2fa, widthdraw)
router.post('/getHistoryWidthdraw', passport.authenticate('jwt', {
    session: false
}), getHistoryWidthdraw)
router.post('/transfer', passport.authenticate('jwt', {
    session: false
}),authenticateBlock,authenticateKyc,check2fa,spinRedis, transfer)
router.post('/getHistoryTransfer', passport.authenticate('jwt', {
    session: false
}), getHistoryTransfer)
router.post('/getHistoryTransferAdmin', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin, getHistoryTransferAdmin)
router.post('/getHistoryDeposit', passport.authenticate('jwt', {
    session: false
}), getHistoryDeposit)
router.post('/getHistoryDepositAdmin', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin, getHistoryDepositAdmin)
router.post('/getHistoryWidthdrawAdmin', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,getHistoryWidthdrawAdmin)
router.post('/withdrawalConfirmation', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,withdrawalConfirmation)
router.post('/cancelWidthdraw', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,cancelWidthdraw)


module.exports = router;