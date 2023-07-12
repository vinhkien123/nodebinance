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
const { checkTransactionDepositVnd, createDepositVND, cancelTransactionDepositVnd, historyDepositVnd, verifyTransactionDepositVnd, getBanking, addBankingAdmin, uploadImageDeposiVND, cancelDepositVNDAdmin, activeDepositVNDAdmin, historyDepositVndAdmin, getAllBanking, editBankingAdmin, deleteBankingAdmin, addListBanking, getBankingUser, getAllBankingUserAdmin, updateBankingUserAdmin, widthdrawVND, getHistoryWidthdraw, getHistoryWidthdrawAdmin, cancelWidthdrawVnd, comfirmWidthdrawVnd, deleteBankingUserAdmin, updateBankingUser } = require('../controller/depositVND');
const { authenticateAdmin, check2fa } = require('../middlewares/authenticate');
const { uploadImageSingle } = require('../middlewares/upload');

router.post('/checkTransactionDepositVnd', passport.authenticate('jwt', {
    session: false
}),checkTransactionDepositVnd)
router.post('/createDepositVND', passport.authenticate('jwt', {
    session: false
}),createDepositVND)
router.post('/cancelTransactionDepositVnd', passport.authenticate('jwt', {
    session: false
}),cancelTransactionDepositVnd)
router.post('/historyDepositVnd', passport.authenticate('jwt', {
    session: false
}),historyDepositVnd)
router.post('/verifyTransactionDepositVnd', passport.authenticate('jwt', {
    session: false
}),verifyTransactionDepositVnd)
router.post('/getBanking',getBanking)
router.post('/addBankingAdmin',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,addBankingAdmin)
router.post('/editBankingAdmin',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,editBankingAdmin)
router.post('/deleteBankingAdmin',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,deleteBankingAdmin)

router.post('/uploadImageDeposiVND', uploadImageSingle, uploadImageDeposiVND);
router.post('/activeDepositVNDAdmin',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,activeDepositVNDAdmin)
router.post('/cancelDepositVNDAdmin',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,cancelDepositVNDAdmin)
router.post('/historyDepositVndAdmin',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,historyDepositVndAdmin)
router.post('/getAllBanking',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,getAllBanking)
router.post('/addListBanking',passport.authenticate('jwt', {
    session: false
}),addListBanking)
router.post('/getBankingUser',passport.authenticate('jwt', {
    session: false
}),getBankingUser)
router.post('/getAllBankingUserAdmin',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,getAllBankingUserAdmin)
router.post('/updateBankingUser',passport.authenticate('jwt', {
    session: false
}),updateBankingUser)

router.post('/updateBankingUserAdmin',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,updateBankingUserAdmin)
// 
router.post('/widthdrawVND',passport.authenticate('jwt', {
    session: false
}),check2fa,widthdrawVND)
router.post('/getHistoryWidthdraw',passport.authenticate('jwt', {
    session: false
}),getHistoryWidthdraw)
router.post('/getHistoryWidthdrawAdmin',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,getHistoryWidthdrawAdmin)
router.post('/comfirmWidthdrawVnd',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,comfirmWidthdrawVnd)
router.post('/cancelWidthdrawVnd',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,cancelWidthdrawVnd)
router.post('/deleteBankingUserAdmin',passport.authenticate('jwt', {
    session: false
}),authenticateAdmin,deleteBankingUserAdmin)

module.exports = router;