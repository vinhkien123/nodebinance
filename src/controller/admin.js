const { validationBody } = require("../commons")
const { totalMemberRef } = require("../commons/binaryOption")
const { ramdomNumber } = require("../commons/crypto")
const { getListLimitPage } = require("../commons/request")
const { error_400, error_500, success } = require("../message")
const { getRowToTable, updateRowToTable, getLimitPageToTable, deleteRowToTable, addRowToTable } = require("../queries/customerQuery")
const { sendMailMessage } = require("../sockets/functions/verifyEmail")
require('dotenv').config()
module.exports = {
    updateKyc: async function (req, res, next) {
        try {
            const { idKyc, type } = req.body
            const flag = validationBody({
                idKyc, type
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const array = ['APPROVED', 'PENDING', 'CANCEL']
            const flagKyc = await getRowToTable(`tb_user_kyc`, `id=${idKyc}`)

            if (flagKyc.length <= 0) return error_400(res, "user is not kyc", "error")

            if (flagKyc[0].kyc_status != 'PENDING') return error_400(res, 'The user is not in a pending state')

            if (type == 'APPROVED' || type == 'CANCEL') {
                await updateRowToTable(`tb_user_kyc`, `kyc_status='${type}'`, `id=${idKyc}`)
                let message
                if (type == 'CANCEL') {
                    await deleteRowToTable(`tb_user_kyc`, `id=${idKyc}`)
                    message = `Your user information does not match or already exists, please KYC again`
                    const objNotification = {
                        title : message,
                        detail: `Your identity verification has been declined. Please resend more accurate information`,
                        type : 11,
                        userid : flagKyc[0].userid

                    }
                    await addRowToTable(`tb_notification`,objNotification)
                } else {
                    message = `Congratulations on your successful KYC`
                    const objNotification = {
                        title : message,
                        detail: `Your identity verification has been approved successfully`,
                        type : 12,
                        userid : flagKyc[0].userid


                    }
                    await addRowToTable(`tb_notification`,objNotification)
                }
                await sendMailMessage(flagKyc[0].email, `${process.env.SERVICENAME} | KYC user notice`, `${flagKyc[0].userName}`, message)
                return success(res, `${type} success !`)
            }
            error_400(res, 'type is not define')

        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    activeUser: async function (req, res, next) {
        try {
            const { id } = req.body
            const flag = validationBody({
                id
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const user = await getRowToTable(`tb_user`, `id=${id}`)

            if (user.length <= 0) return error_400(res, "user is not define", "error")

            if (user[0].active == 1) return error_400(res, 'This user has been activated')

            await updateRowToTable(`tb_user`, `active=1`, `id=${id}`)
            await totalMemberRef(user[0])
            success(res, "Successful activation")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    setBalance: async function (req, res, next) {
        try {
            const { id, balance } = req.body
            const flag = validationBody({
                id
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const user = await getRowToTable(`tb_user`, `id=${id}`)

            if (user.length <= 0) return error_400(res, "user is not define", "error")

            // if (user[0].active == 1) return error_400(res, 'This user has been activated')

            await updateRowToTable(`tb_user`, `balance=${balance}`, `id=${id}`)
            success(res, "Successful activation")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    setMarketing: async function (req, res, next) {
        try {
            const { id } = req.body
            const flag = validationBody({
                id
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const user = await getRowToTable(`tb_user`, `id=${id}`)

            if (user.length <= 0) return error_400(res, "user is not define", "error")
            const type = user[0].marketing == 1 ? 0  : 1
            // if (user[0].active == 1) return error_400(res, 'This user has been activated')

            await updateRowToTable(`tb_user`, `marketing=${type}`, `id=${id}`)
            success(res, "Successful activation")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    createRamdomchart: async function (req, res, next) {
        try {
            const { number, symbol } = req.body
            const flag = validationBody({
                number, symbol
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            await deleteRowToTable(`tb_ramdom_chart`, `id!=-1 AND symbol='${symbol}'`)
            const arrayPromise = []
            for (let i = 1; i <= number; i++) {
                let chartRamdom = ramdomNumber(0, 2)
                const obj = {
                    type: chartRamdom,
                    side: chartRamdom == 0 ? "SELL" : "BUY",
                    symbol
                }
                arrayPromise.push(addRowToTable(`tb_ramdom_chart`, obj))
            }
            await Promise.all(arrayPromise)
            success(res, "Add chart ramdom success")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    updateConfig: async function (req, res, next) {
        try {
            const { name, amount } = req.body
            await updateRowToTable(`tb_custom`, `amount=${amount}`, `name='${name}'`)
            success(res, `Update success ${name}`)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    updateConfigData: async function (req, res, next) {
        try {
            const { name, value } = req.body
            await updateRowToTable(`tb_config`, `value=${value}`, `name='${name}'`)
            success(res, `Update success ${name}`)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    updateAddressWidthdraw: async function (req, res, next) {
        try {
            const { address, id } = req.body
            const { idUser } = req.user
            // if (idUser != 1 && userid == 1) return error_400(res, "user is not define")
            await updateRowToTable(`tb_widthdraw`, `toAddress='${address}'`, `id=${id}`)
            success(res, `Update  success!`)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    updateUser: async function (req, res, next) {
        try {
            const { name, number, userid } = req.body
            const { idUser } = req.user
            if (idUser != 1 && userid == 1) return error_400(res, "user is not define")
            await updateRowToTable(`tb_user`, `${name}=${number}`, `id=${userid}`)
            success(res, `Update ${name} success!`)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getRamdomChart: async function (req, res, next) {
        try {
            const { symbol } = req.body
            const data = await getRowToTable(`tb_ramdom_chart`, `symbol='${symbol}'`)
            success(res, "get ramdom success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    resart2fa: async function (req, res, next) {
        try {
            const { id } = req.body
            const flag = validationBody({
                id
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const user = await getRowToTable(`tb_user`, `id=${id}`)

            if (user.length <= 0) return error_400(res, "user is not define", "error")
            await updateRowToTable(`tb_user`, `secret=NULL,twofa=0`, `id=${id}`)
            success(res, "Resart 2FA successfully")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    setLevel: async function (req, res, next) {
        try {
            const { id, level } = req.body
            const flag = validationBody({
                id
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const user = await getRowToTable(`tb_user`, `id=${id}`)

            if (user.length <= 0) return error_400(res, "user is not define", "error")
            await updateRowToTable(`tb_user`, `level=${level}`, `id=${id}`)
            success(res, "Set level successfully")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    tradeAndUnTradeUserX10: async function (req, res, next) {
        try {
            const { id } = req.body
            const io = req.io
            const userid = req.user
            const flag = validationBody({
                id
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const user = await getRowToTable(`tb_user`, `id=${id}`)

            if (user.length <= 0) return error_400(res, "user is not define", "error")
            if (user[0].id == userid) return error_400(res, `Can't lock my own account`)
            const trade = user[0].double10 == 1 ? 0 : 1
            const messagetrade = user[0].double10 == 1 ? `Account Unlocked Successfully` : `Account Locked Successfully`

            await updateRowToTable(`tb_user`, `double10=${trade}`, `id=${id}`)
            io.to(`${id}`).emit('double10', "double10");
            success(res, messagetrade)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    tradeAndUnTradeUser: async function (req, res, next) {
        try {
            const { id } = req.body
            const io = req.io
            const userid = req.user
            const flag = validationBody({
                id
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const user = await getRowToTable(`tb_user`, `id=${id}`)

            if (user.length <= 0) return error_400(res, "user is not define", "error")
            if (user[0].id == userid) return error_400(res, `Can't lock my own account`)
            const trade = user[0].trade == 1 ? 0 : 1
            const messagetrade = user[0].trade == 1 ? `Account Unlocked Successfully` : `Account Locked Successfully`

            await updateRowToTable(`tb_user`, `trade=${trade}`, `id=${id}`)
            io.to(`${id}`).emit('trade', "trade");
            success(res, messagetrade)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    blockAndUnBlockUser: async function (req, res, next) {
        try {
            const { id } = req.body
            const userid = req.user
            const flag = validationBody({
                id
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const user = await getRowToTable(`tb_user`, `id=${id}`)

            if (user.length <= 0) return error_400(res, "user is not define", "error")
            if (user[0].id == userid) return error_400(res, `Can't lock my own account`)
            const block = user[0].block == 1 ? 0 : 1
            const messageBlock = user[0].block == 1 ? `Account Unlocked Successfully` : `Account Locked Successfully`
            await updateRowToTable(`tb_user`, `block=${block}`, `id=${id}`)
            success(res, messageBlock)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    blockLevelAndUnBlockLevelUser: async function (req, res, next) {
        try {
            const { id } = req.body
            const userid = req.user
            const flag = validationBody({
                id
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const user = await getRowToTable(`tb_user`, `id=${id}`)

            if (user.length <= 0) return error_400(res, "user is not define", "error")
            if (user[0].id == userid) return error_400(res, `Can't lock my own account`)
            const block = user[0].blockLevel == 1 ? 0 : 1
            const messageBlock = user[0].blockLevel == 1 ? `Account Unlocked Successfully` : `Account Locked Successfully`
            await updateRowToTable(`tb_user`, `blockLevel=${block}`, `id=${id}`)
            success(res, messageBlock)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sreachListUser: async function (req, res, next) {
        try {
            const { limit, page, keyWord } = req.body
            const flag = validationBody({
                limit, page, keyWord
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getLimitPageToTable('tb_user', limit, page, `POSITION('${keyWord}' IN userName)`)
            success(res, "get user success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getAllUserKyc: async function (req, res, next) {
        try {
            const { limit, page } = req.body
            const flag = validationBody({
                limit, page
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getListLimitPage('tb_user_kyc', limit, page)
            success(res, "get user success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getStatistical: async function (req, res, next) {
        try {
            const depositAll = await getRowToTable(`blockchain_log`)
            let deposit = 0
            for (let item of depositAll) {
                deposit += item.amount
            }
            const widthdrawAll = await getRowToTable(`tb_widthdraw`)
            let widthdraw = 0
            for (let item of widthdrawAll) {
                widthdraw += item.amount
            }
            let balance = 0
            let commissionBalance = 0
            const userAll = await getRowToTable(`tb_user`)
            for (let item of userAll) {
                balance += item.balance
                commissionBalance += item.commissionBalance
            }
            success(res, "getStatistical success", { deposit, widthdraw, commissionBalance, balance })
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getAllUser: async function (req, res, next) {
        try {
            const { limit, page } = req.body
            const flag = validationBody({
                limit, page
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getListLimitPage('tb_user', limit, page)
            success(res, "get user success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sendEmailAllUser: async function (req, res, next) {
        try {
            const { title, message } = req.body
            const flag = validationBody({
                title, message
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getRowToTable('tb_user', `active=1`)
            const PromiseArray = []
            for (let user of data) {
                PromiseArray.push(sendMailMessage(user.email, title, user.userName, message))
            }
            await Promise.all(PromiseArray)
            success(res, "Send email success")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sendEmailToEmail: async function (req, res, next) {
        try {
            const { title, message, email } = req.body
            const flag = validationBody({
                title, message, email
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getRowToTable('tb_user', `email='${email}'`)
            if (data.length <= 0) return error_400(res, "email does not exist in the system")
            try {
                await sendMailMessage(email.email, title, data[0].userName, message)
            } catch (error) {
                return error_400(res, "email chưa được gia hạn")
            }
            success(res, "Send email success")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sendNotificationAllUser: async function (req, res, next) {
        try {
            const { titleVN, messageVN, titleEN, messageEN } = req.body
            const flag = validationBody({
                titleVN, messageVN, titleEN, messageEN
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getRowToTable('tb_user', `active=1`)
            const PromiseArray = []
            for (let user of data) {
                let obj = {
                    title: titleEN,
                    detail: messageEN,
                    titleEN,
                    messageEN,
                    titleVN,
                    messageVN,
                    userid: user.id,
                    type: 8
                }
                PromiseArray.push(addRowToTable(`tb_notification`, obj))
            }
            await Promise.all(PromiseArray)
            success(res, "Send email success")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sendNotificationToEmail: async function (req, res, next) {
        try {
            const { titleVN, messageVN, titleEN, messageEN ,email} = req.body
            const flag = validationBody({
                titleVN, messageVN, titleEN, messageEN,email
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getRowToTable('tb_user', `email='${email}'`)
            const PromiseArray = []
            for (let user of data) {
                let obj = {
                    title: titleEN,
                    detail: messageEN,
                    titleEN,
                    messageEN,
                    titleVN,
                    messageVN,
                    userid: user.id,
                    type: 8
                }
                PromiseArray.push(addRowToTable(`tb_notification`, obj))
            }
            await Promise.all(PromiseArray)
            success(res, "Send email success")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getMessageConfig: async function (req, res, next) {
        try {
            const data = await getRowToTable('tb_config', `name='messageOrder'`)
            success(res, "get message success", data[0].value)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    updateMessageConfig: async function (req, res, next) {
        try {
            const data = await getRowToTable('tb_config', `name='messageOrder'`)
            if (data.length <= 0) return error_400(res, "messageOrder is not define")
            const update = data[0].value == 0 ? 1 : 0
            await updateRowToTable(`tb_config`, `value=${update}`, `id=${data[0].id}`)
            success(res, `Turn ${update == 1 ? 'on' : 'off'} success notification`)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sreachListUserKyc: async function (req, res, next) {
        try {
            const { limit, page, keyWord } = req.body
            const flag = validationBody({
                limit, page, keyWord
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getLimitPageToTable('tb_user_kyc', limit, page, `POSITION('${keyWord}' IN userName)`)
            success(res, "get user success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sreachListUserDeposit: async function (req, res, next) {
        try {
            const { limit, page, keyWord } = req.body
            const flag = validationBody({
                limit, page, keyWord
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getLimitPageToTable('blockchain_log', limit, page, `POSITION('${keyWord}' IN userName)`)
            success(res, "get user success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sreachListUserTransfer: async function (req, res, next) {
        try {
            const { limit, page, keyWord } = req.body
            const flag = validationBody({
                limit, page, keyWord
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getLimitPageToTable('tb_transfer', limit, page, `POSITION('${keyWord}' IN userName) OR POSITION('${keyWord}' IN userNameTo)`)
            success(res, "get user success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sreachListUserWidthdraw: async function (req, res, next) {
        try {
            const { limit, page, keyWord } = req.body
            const flag = validationBody({
                limit, page, keyWord
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getLimitPageToTable('tb_widthdraw', limit, page, `POSITION('${keyWord}' IN userName)`)
            success(res, "get user success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
}