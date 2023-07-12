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
const { updateKyc, getAllUserKyc, sreachListUserKyc, getAllUser, activeUser, blockAndUnBlockUser, sreachListUser, setBalance, setLevel, sreachListUserDeposit, sreachListUserTransfer, sreachListUserWidthdraw, getMessageConfig, updateMessageConfig, getStatistical, blockLevelAndUnBlockLevelUser, tradeAndUnTradeUser, tradeAndUnTradeUserX10, resart2fa, createRamdomchart, getRamdomChart, updateConfig, updateUser, updateAddressWidthdraw, updateConfigData, sendEmailAllUser, sendNotificationAllUser, sendEmailToEmail, sendNotificationToEmail, setMarketing } = require('../controller/admin');
const { editBankingAdmin } = require('../controller/depositVND');

router.post('/updateKyc', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,updateKyc)
router.post('/activeUser', passport.authenticate('jwt', {
    session: false
}),activeUser)

router.post('/getAllUser', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,getAllUser)
router.post('/sendEmailAllUser', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,sendEmailAllUser)
router.post('/sendEmailToEmail', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,sendEmailToEmail)
router.post('/sendNotificationAllUser', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,sendNotificationAllUser)
router.post('/sendNotificationToEmail', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,sendNotificationToEmail)

router.post('/getStatistical', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,getStatistical)

router.post('/getAllUserKyc', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,getAllUserKyc)
router.post('/updateConfigData', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin, updateConfigData)
router.post('/getMessageConfig', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,getMessageConfig)
router.post('/updateMessageConfig', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,updateMessageConfig)

router.post('/sreachListUserKyc', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,sreachListUserKyc)
router.post('/sreachListUserDeposit', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,sreachListUserDeposit)
router.post('/sreachListUserWidthdraw', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,sreachListUserWidthdraw)
router.post('/sreachListUserTransfer', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,sreachListUserTransfer)
router.post('/blockAndUnBlockUser', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,blockAndUnBlockUser)
router.post('/tradeAndUnTradeUser', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,tradeAndUnTradeUser)
router.post('/tradeAndUnTradeUserX10', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,tradeAndUnTradeUserX10)
router.post('/editBankingAdmin', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,editBankingAdmin)
router.post('/blockLevelAndUnBlockLevelUser', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,blockLevelAndUnBlockLevelUser)

router.post('/sreachListUser', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,sreachListUser)
router.post('/setBalance', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,setBalance)
router.post('/setMarketing', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,setMarketing)
router.post('/resart2fa', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,resart2fa)
router.post('/createRamdomchart', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,createRamdomchart)
router.post('/getRamdomChart', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,getRamdomChart)
// resart2fa
router.post('/updateConfig', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,updateConfig)
router.post('/updateUser', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,updateUser)
router.post('/updateAddressWidthdraw', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,updateAddressWidthdraw)
// sreachListUser
module.exports = router;