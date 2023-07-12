const { convertTimeToString, validationBody, getPriceSell, getPriceSiring, messageTelegram } = require("../commons");
const { checkBalance, minusBalance, checkBalanceStr, addBalanceStr, updateStatusBalance } = require("../commons/crypto");
const { getListLimitPage, getListLimitPageHistory } = require("../commons/request");
const { dogeWarInstance } = require("../contract");
const { success, error_400, error_500 } = require("../message");
const { delRedis } = require("../model/model.redis");
const { getRowToTable, updateRowToTable, addRowToTable } = require("../queries/customerQuery");
const { sendMailMessage } = require("../sockets/functions/verifyEmail");
require('dotenv').config()
const opts = {
    errorEventName: 'error',
    logDirectory: `${__dirname}/log`,
    fileNamePattern: 'log.txt',
    dateFormat: 'YYYY.MM.DD'
};
const log = require('simple-node-logger').createRollingFileLogger(opts);
module.exports = {
    widthdraw: async (req, res, next) => {
        try {
            const { amount, toAddress, symbol, network } = req.body
            const flag = validationBody({ amount, toAddress, symbol, network })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const userid = req.user

            const checkWallet = await checkBalance(amount, userid)
            if (!checkWallet.status) return error_400(res, checkWallet.message)
            // const feeWidthdraw = await getRowToTable(`tb_config`, `name='feeWidthdraw'`)
            if (amount < 50) return error_400(res, 'Minimum amount must be 50$')
            ///// deposit mới cho rút
            // const checkDeposit = await getRowToTable(`blockchain_log`, `user_id=${userid}  ORDER BY id ASC LIMIT 0,1;`)
            // if (checkDeposit.length <= 0) return error_400(res, "You must deposit to be able to withdraw")
            // const time15Day = 1296000000
            // const timeDeposit = new Date(checkDeposit[0].created_at).getTime()
            // const timeNow = new Date().getTime()

            // if  (timeNow-timeDeposit<time15Day) return error_400(res, "You must withdraw after 15 days of deposit")
            //// end
            const user = await getRowToTable(`tb_user`, `id=${userid}`)
            const feeUSDWithdraw = await getRowToTable(`tb_config`, `name='withdraw'`)
            const queryGetFeeMode = await getRowToTable(`tb_config`, `name='feePercent'`)
            const feePercent = queryGetFeeMode[0].value == 1 ? true : false
            const balanceWidthdraw = feePercent ? amount - amount * (feeUSDWithdraw[0].value / 100) : amount - feeUSDWithdraw[0].value
            const objAdd = {
                userid,
                symbol,
                amount,
                status: 2,
                toAddress,
                feeWidthdraw: feeUSDWithdraw[0].value,
                balanceWidthdraw,
                network,
                userName: user[0].userName
            }
            await updateStatusBalance(userid, `widthdraw`, amount, `-`)
            await minusBalance(amount, userid)
            await addRowToTable(`tb_widthdraw`, objAdd)
            await messageTelegram(`[WITHDRAW] ${user[0].userName} withdraw ${amount}`)
            success(res, "Successful withdrawal order")
        } catch (error) {
            log.info(error)
            console.log(error);
            error_500(res, error)
        }
    },
    transfer: async (req, res, next) => {
        const { amount, userNameTo, api, note } = req.body
        const userid = req.user
        const flag = validationBody({ amount, userNameTo, api })
        const keyName = `${userid}${process.env.DOMAIN}${api}`
        const io = req.io
        try {



            if (flag.length > 0) {
                await delRedis(keyName)
                return error_400(res, 'Not be empty', flag)
            }
            if (api != "transfer") {
                await delRedis(keyName)
                return error_400(res, "Api is not define")
            }
            if (amount < 5) {
                await delRedis(keyName)
                return error_400(res, 'Minimum amount must be 5$')
            }
            const profileTo = await getRowToTable(`tb_user`, `userName='${userNameTo}'`)
            const profile = await getRowToTable(`tb_user`, `id=${userid}`)
            if (userNameTo == profile[0].userName) {
                await delRedis(keyName)
                return error_400(res, 'username does not exist')
            }
            if (profileTo.length <= 0) {
                await delRedis(keyName)
                return error_400(res, 'username does not exist')
            }
            const flagBalance = await checkBalanceStr(amount, userid, `balance`)
            if (!flagBalance.status) {
                await delRedis(keyName)
                return error_400(res, "Insufficient balance")
            }
            const queryGetFeeMode = await getRowToTable(`tb_config`, `name='feePercent'`)
            const feePercent = queryGetFeeMode[0].value == 1 ? true : false
            const queryGetTransfer = await getRowToTable(`tb_config`, `name='transfer'`)
            const percent = queryGetTransfer[0].value
            const receive = feePercent ? amount - (percent / 100) * amount : amount - percent
            const minusBalanceQuery = minusBalance(amount, userid)
            const addBalanceStrQuery = addBalanceStr(receive, profileTo[0].id, `balance`)
            // const updateBlanceQuery = updateRowToTable(`tb_balance_user`, `transfer=transfer+${amount}`, `userid=${userid} AND created_at=UTC_DATE()`)
            // const updateBlanceToQuery = updateRowToTable(`tb_balance_user`, `transfer=transfer+${amount}`, `userid=${userid} AND created_at=UTC_DATE()`)
            const obj = {
                userid,
                useridTo: profileTo[0].id,
                userName: profile[0].userName,
                userNameTo: profileTo[0].userName,
                emailTo: profileTo[0].email,
                email: profile[0].email,
                amount,
                receive,
                note: note == undefined ? "" : note
            }
            const objNotification = {
                title: `Internal withdrawal successful`,
                detail: `
                - Quantity : ${amount} USDT
                - Memo : ${note == undefined ? "" : note}
                - Receiver : ${profileTo[0].userName}
                `,
                userid,
                email: profile[0].email,
                userName: profile[0].userName,
                amountTransfer: amount,
                userNameTransfer: profileTo[0].userName,
                type: 4,
                memo: note == undefined ? "" : note
            }
            await addRowToTable(`tb_notification`, objNotification)
            const objNotificationTo = {
                title: `Successful internal recharge`,
                detail: `
                - Quantity : ${amount} USDT
                - Memo :${note == undefined ? "" : note}
                - Receiver : ${profile[0].userName}
                `,
                userid: profileTo[0].id,
                email: profileTo[0].email,
                userName: profileTo[0].userName,
                amountTransfer: amount,
                userNameTransfer: profile[0].userName,
                type: 5,
                memo: note == undefined ? "" : note
            }
            let message = `You have received ${amount} USDT from ${profile[0].userName}`
            try {
                await sendMailMessage(profileTo[0].email, `${process.env.SERVICENAME} | Transfer`, `${profileTo[0].userName}`, message)
            } catch (error) {
                console.log(error);
            }

            await addRowToTable(`tb_notification`, objNotificationTo)
            await updateStatusBalance(userid, `transfer`, amount, `-`)
            await updateStatusBalance(profileTo[0].id, `transfer`, receive, `+`)
            await Promise.all([addRowToTable(`tb_transfer`, obj), minusBalanceQuery, addBalanceStrQuery])
            io.to(`${profileTo[0].id}`).emit('transfer', "transfer");
            await delRedis(keyName)
            success(res, "Money transfer successful")
        } catch (error) {
            log.info(error);
            await delRedis(keyName)
            error_500(res, error)
        }
    },
    getHistoryTransferAdmin: async function (req, res, next) {
        try {
            const { limit, page } = req.body

            const flag = validationBody({
                limit, page
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getListLimitPage('tb_transfer', limit, page)
            success(res, "get history transfer admin success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getHistoryDeposit: async function (req, res, next) {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const flag = validationBody({
                limit, page
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getListLimitPage('blockchain_log', limit, page, `user_id=${userid}`)
            success(res, "get history deposit success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getHistoryDepositAdmin: async function (req, res, next) {
        try {
            const { limit, page } = req.body
            const flag = validationBody({
                limit, page
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getListLimitPage('blockchain_log', limit, page)
            success(res, "get history deposit success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getHistoryTransfer: async function (req, res, next) {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const flag = validationBody({
                limit, page
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getListLimitPage('tb_transfer', limit, page, `userid=${userid} OR useridTo=${userid}`)
            success(res, "get history transfer success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getHistoryWidthdraw: async function (req, res, next) {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const flag = validationBody({
                limit, page
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getListLimitPage('tb_widthdraw', limit, page, `userid=${userid}`)
            success(res, "get history widthdraw success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getHistoryWidthdrawAdmin: async function (req, res, next) {
        try {
            const { limit, page } = req.body
            const flag = validationBody({
                limit, page
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getListLimitPage('tb_widthdraw', limit, page)
            success(res, "get history widthdraw success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    withdrawalConfirmation: async function (req, res, next) {
        try {
            const { id, hash } = req.body
            const flag = validationBody({
                id, hash
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const widthdraw = await getRowToTable(`tb_widthdraw`, `id=${id}`)

            if (widthdraw.length <= 0) return error_400(res, "user is not define", "error")

            if (widthdraw[0].status == 1) return error_400(res, 'You have confirmed your withdrawal')

            const user = await getRowToTable(`tb_user`, `id=${widthdraw[0].userid}`)
            await updateRowToTable(`tb_widthdraw`, `status=1, hash='${hash}'`, `id=${id}`)
            let message = `You have successfully withdrawn ${widthdraw[0].amount} ${widthdraw[0].symbol} to ${widthdraw[0].toAddress} wallet`
            try {
                await sendMailMessage(user[0].email, `${process.env.SERVICENAME} | Widthdraw`, `${user[0].userName}`, message)
            } catch (error) {
                console.log(error);
            }
            const profile = await getRowToTable(`tb_user`, `id=${widthdraw[0].userid}`)
            const objNotification = {
                type: 7,
                userid: widthdraw[0].userid,
                userName: profile[0].userName,
                email: profile[0].email,
                title: `Withdrawal successful`,
                detail: `You have successfully withdrawn ${widthdraw[0].amount} USDT`,
                amountWithdraw: widthdraw[0].amount
            }
            await addRowToTable(`tb_notification`, objNotification)
            success(res, "Confirmation of successful withdrawal")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    cancelWidthdraw: async function (req, res, next) {
        try {
            const { id } = req.body
            const flag = validationBody({
                id
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const widthdraw = await getRowToTable(`tb_widthdraw`, `id=${id}`)

            if (widthdraw.length <= 0) return error_400(res, "user is not define", "error")

            if (widthdraw[0].status != 2) return error_400(res, 'You cannot cancel')

            await updateRowToTable(`tb_widthdraw`, `status=0 `, `id=${id}`)
            await updateRowToTable(`tb_user`, `balance=balance+${widthdraw[0].amount}`, `id=${widthdraw[0].userid}`)
            await updateStatusBalance(widthdraw[0].userid, `widthdraw`, widthdraw[0].amount, `+`)
            success(res, "Cancellation of withdrawal successfully")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
}