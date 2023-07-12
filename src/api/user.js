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
const { validationBody, validationUserName } = require('../commons');
const { signUp, login, getReferral, getParent, changePassword, kycUser, checkKycUser, getProfile, generateOTPToken, turn2FA, getCountry, depositCoin, createWallet, verifyEmail, refreshToken, getWallet, sendmailforgetpassword, forgetPassword, getValueConfig, getParentList, checkUser2fa, uploadAvatar, getProfileToId } = require('../controller/user');
const { uploadImage, uploadImageSingle } = require('../middlewares/upload');
const { check2fa, isToken, authenticateAdmin } = require('../middlewares/authenticate');
const { commissionOrder } = require('../commons/binaryOption');

router.post('/verifyEmail', passport.authenticate('jwt', {
    session: false
}), verifyEmail)
router.post('/checkuser2fa',
    checkUser2fa
);
router.get('/verifyEmailt', async (req, res,) => {

})
router.post('/signup', signUp)
router.post('/login', login)
router.post('/getProfile', passport.authenticate('jwt', {
    session: false
}), getProfile)
router.post('/getProfileToId', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin, getProfileToId)
router.post('/changePassword', passport.authenticate('jwt', {
    session: false
}), changePassword)
router.post('/getParent', getParent)
router.post('/sendmailforgetpassword', sendmailforgetpassword)
router.post('/forgetPassword', passport.authenticate('jwt', {
    session: false
}), forgetPassword)
router.post('/getParentList', passport.authenticate('jwt', {
    session: false
}), getParentList)

router.get('/getCountry', getCountry)
router.post('/generateOTPToken', passport.authenticate('jwt', {
    session: false
}), generateOTPToken)
router.post('/turn2FA', passport.authenticate('jwt', {
    session: false
}), check2fa, turn2FA)
router.post('/kycUser', uploadImage, kycUser)
router.post('/uploadAvatar', uploadImageSingle, uploadAvatar)

router.post('/depositCoin', depositCoin)
router.post('/checkKycUser', passport.authenticate('jwt', {
    session: false
}), checkKycUser)
router.get('/getReferral', getReferral)
router.post('/refreshToken', isToken, refreshToken)
router.post('/createWallet', passport.authenticate('jwt', {
    session: false
}), createWallet)
router.post('/getWallet', passport.authenticate('jwt', {
    session: false
}), getWallet)
router.post('/getValueConfig', getValueConfig)


module.exports = router;