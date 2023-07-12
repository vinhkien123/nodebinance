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
const { getChart, getPairs, order, getAllOrderPendingUser, dayStatisticsOrder, weekStatisticsOrder, dayHistoryOrder, weekHistoryOrder, getParentToLevel, refeshLevel, setChart, getCommission, getCommissionAdmin, dayStatisticsOrderAdmin, dayHistoryOrderAdmin, weekHistoryOrderAdmin, weekStatisticsOrderAdmin, addMessage, updateMessage, getAllMessage, deleteMessage, getBotMessage, getOrderNow, getAllOrder, buyInsurance, historyBuyInsuranceAdmin, historyBuyInsurance, sreachListBuyInsurance, getMessage, addMessageUser, getListUserF1, historyTransferCommission, doubleOrder, getProfitsAdmin, getOrderAdmin, getSetResultAdmin, historyOrderUser, buyMemberVip, getPrizePoolUser, confirmPrizePoolUser, confirmPrizePoolAdmin, getChartStatisticsUser, getListNotification, getListStreak, getHistoryCommissionToTime, getHistoryCommissionMemberVipToTime, getPrizePoolUserConfirm, updateBalanceDemo, getChartStatisticsUserAdmin, getHistoryCommissionToTimeAdmin, getHistoryCommissionMemberVipToTimeAdmin, clickNotification, getProfileMegaPoolAfter } = require('../controller/binaryOption');
const { existsRedis, setnxRedis, getRedis, incrbyRedis, delRedis } = require('../model/model.redis');
const { getRowToTable, updateRowToTable } = require('../queries/customerQuery');
const { createWallet } = require('../lib/coinpayment');
const { spinRedis, authenticateAdmin, check2fa } = require('../middlewares/authenticate');
const { setLevel } = require('../controller/admin');
const { refeshCommissionFunc } = require('../commons/binaryOption');
const { checkAdmin } = require('../commons');
router.post('/getChart', getChart)
router.post('/order', passport.authenticate('jwt', {
    session: false
}), spinRedis, order)
router.post('/doubleOrder', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, doubleOrder)

router.post('/getAllOrderPendingUser', passport.authenticate('jwt', {
    session: false
}), getAllOrderPendingUser)
router.post('/getOrderNow', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, getOrderNow)
router.post('/buyMemberVip', passport.authenticate('jwt', {
    session: false
}), buyMemberVip)
router.post('/getPairs', getPairs)
router.post('/setChart', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, setChart)

router.post('/historyOrderUser', passport.authenticate('jwt', {
    session: false
}), historyOrderUser)
router.post('/getPrizePoolUser', passport.authenticate('jwt', {
    session: false
}), getPrizePoolUser)
router.post('/getPrizePoolUserConfirm', passport.authenticate('jwt', {
    session: false
}), getPrizePoolUserConfirm)
router.post('/confirmPrizePoolUser', passport.authenticate('jwt', {
    session: false
}),check2fa, confirmPrizePoolUser)
router.post('/confirmPrizePoolAdmin', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin, confirmPrizePoolAdmin)
router.post('/getCommission', passport.authenticate('jwt', {
    session: false
}), getCommission)
router.post('/getCommissionAdmin', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, getCommissionAdmin)
router.post('/setLevel', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, setLevel)
router.post('/getSetResultAdmin', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, getSetResultAdmin)
router.post('/refeshLevel', passport.authenticate('jwt', {
    session: false
}), refeshLevel)
// message bot
router.post('/addMessage', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, addMessage)
router.post('/updateMessage', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, updateMessage)
router.post('/getAllMessage', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, getAllMessage)
router.post('/getAllOrder', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, getAllOrder)
router.post('/getBotMessage', getBotMessage)
router.post('/deleteMessage', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, deleteMessage)
router.post('/getProfitsAdmin', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, getProfitsAdmin)
router.post('/getOrderAdmin', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, getOrderAdmin)

///
router.post('/dayStatisticsOrderAdmin', passport.authenticate('jwt', {
    session: false
}), dayStatisticsOrderAdmin)
router.post('/buyInsurance', passport.authenticate('jwt', {
    session: false
}), buyInsurance)
router.post('/historyBuyInsuranceAdmin', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, historyBuyInsuranceAdmin)
router.post('/historyTransferCommission', passport.authenticate('jwt', {
    session: false
}), historyTransferCommission)

router.post('/historyBuyInsurance', passport.authenticate('jwt', {
    session: false
}), historyBuyInsurance)
router.post('/getMessage', passport.authenticate('jwt', {
    session: false

}), getMessage)
router.post('/addMessageUser', passport.authenticate('jwt', {
    session: false
}), addMessageUser)
router.post('/dayHistoryOrderAdmin', passport.authenticate('jwt', {
    session: false
}), dayHistoryOrderAdmin)
router.post('/weekHistoryOrderAdmin', passport.authenticate('jwt', {
    session: false
}), weekHistoryOrderAdmin)
router.post('/getHistoryCommissionMemberVipToTime', passport.authenticate('jwt', {
    session: false
}), getHistoryCommissionMemberVipToTime)
router.post('/getHistoryCommissionMemberVipToTimeAdmin', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin, getHistoryCommissionMemberVipToTimeAdmin)
router.post('/getHistoryCommissionToTime', passport.authenticate('jwt', {
    session: false
}), getHistoryCommissionToTime)
router.post('/getHistoryCommissionToTimeAdmin', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin, getHistoryCommissionToTimeAdmin)
// getHistoryCommissionMemberVipToTime
// getHistoryCommissionToTime
router.post('/weekStatisticsOrderAdmin', passport.authenticate('jwt', {
    session: false
}),authenticateAdmin, weekStatisticsOrderAdmin)
router.post('/getChartStatisticsUser', passport.authenticate('jwt', {
    session: false
}), getChartStatisticsUser)
router.post('/getChartStatisticsUserAdmin', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin,getChartStatisticsUserAdmin)
router.post('/dayStatisticsOrder', passport.authenticate('jwt', {
    session: false
}), dayStatisticsOrder)
router.post('/sreachListBuyInsurance', passport.authenticate('jwt', {
    session: false
}), authenticateAdmin, sreachListBuyInsurance)

router.post('/dayHistoryOrder', passport.authenticate('jwt', {
    session: false
}), dayHistoryOrder)
router.post('/updateBalanceDemo', passport.authenticate('jwt', {
    session: false
}), updateBalanceDemo)
router.post('/weekHistoryOrder', passport.authenticate('jwt', {
    session: false
}), weekHistoryOrder)
router.post('/weekStatisticsOrder', passport.authenticate('jwt', {
    session: false
}), weekStatisticsOrder)
router.post('/getParentToLevel', passport.authenticate('jwt', {
    session: false
}), getParentToLevel)
router.post('/getListUserF1', passport.authenticate('jwt', {
    session: false
}), getListUserF1)
router.post('/getListNotification', passport.authenticate('jwt', {
    session: false
}), getListNotification)
router.post('/clickNotification', passport.authenticate('jwt', {
    session: false
}), clickNotification)

router.post('/getListStreak', passport.authenticate('jwt', {
    session: false
}), getListStreak)
router.post('/getProfileMegaPoolAfter', passport.authenticate('jwt', {
    session: false
}), getProfileMegaPoolAfter)

router.post('/test', async function (req, res, next) {
    console.log("hello");
    try {
        const balanceUser = await getRowToTable(`tb_balance_user`,`created_at=UTC_DATE()`)
        console.log(balanceUser.length); //afterBalance
        const arrayPromise = []
        for (user of balanceUser){
            arrayPromise.push(updateRowToTable(`tb_user`,`balance=${user.afterBalance}`,`id=${user.userid}`))
        }
        await Promise.all(arrayPromise)
        success(res,"success")
        // await refeshCommissionFunc()
    } catch (error) {
        console.log(error);
    }
})

router.post('/addlibary', passport.authenticate('jwt', {
    session: false
}))

module.exports = router;