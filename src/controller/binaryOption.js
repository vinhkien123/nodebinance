const { convertTimeToString, validationBody, getPriceSell, getPriceSiring, getStartWeekAndLastWeek, getStartWeekAndLastDay, deleteProfileObj, messageTelegram } = require("../commons");
const { commissionOrder, getParentUser, getParentUserBottomNetwork, refeshLevelFunc, addCommissionMemberVip, getParentUserBottomNetworkToTime, getDataToUserNameNetworkQuery } = require("../commons/binaryOption");
const { checkBalance, checkBalanceDemo, checkBalanceStr, getChartBORealTime, minusBalance, timeToString, stringToTime } = require("../commons/crypto");
const { getListLimitPage, getListLimitPageHistory, getListLimitPageDDMMYY } = require("../commons/request");
const { dogeWarInstance } = require("../contract");
const { success, error_400, error_500 } = require("../message");
const { delRedis } = require("../model/model.redis");
const { getRowToTable, getChartToSymbolAndLimitLast, addRowToTable, updateRowToTable, getChartToSymbolAndLimitLastNoClose, getDataParentToUseridBottomNetwork, getChartOneLimitLast, deleteRowToTable, getLimitPageToTable, getChartToSymbolAndLimitLastToTime } = require("../queries/customerQuery");
const { addHistoryCommissione } = require("../queries/remitanoQuery");
const { getProfile } = require("./user");
const opts = {
    errorEventName: 'error',
    logDirectory: `${__dirname}/log`,
    fileNamePattern: 'log.txt',
    dateFormat: 'YYYY.MM.DD'
};
const log = require('simple-node-logger').createRollingFileLogger(opts);
require('dotenv').config()
async function orderItemBalance(order) {
    const user = await getRowToTable(`tb_user`, `id=${order.userid}`)
    if (user.length > 0) {
        order.balance = user[0].balance
    } else {
        order.balance = 0
    }
}
const Binance = require('node-binance-api');
const binance = new Binance({
    APIKEY: '<key>',
    APISECRET: '<secret>'
});
module.exports = {
    getChart: async (req, res, next) => {
        try {
            const { symbol, time, limit, page } = req.body
            const flag = validationBody({ symbol })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const stringTime = timeToString(time)
            const array = []
            console.log(stringTime);
            binance.candlesticks(symbol, stringTime, (error, ticks, symbol) => {
                for (let i = 0; i < ticks.length; i++) {
                    let last_tick = ticks[i]
                    let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
                    let obj = {
                        symbol,
                        close,
                        high,
                        low,
                        open,
                        volume,
                        timestamp: Math.floor(time / 1000),
                        closeTimestamp: Math.floor(closeTime / 1000),
                        time: time
                    }
                    array.push(obj)
                }
                success(res, "get success", { array })
            }, { limit: limit, endTime: new Date().getTime() });

        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    // getChart: async (req, res, next) => {
    //     try {
    //         const { symbol, time, limit, page } = req.body
    //         const flag = validationBody({ symbol })
    //         if (flag.length > 0) return error_400(res, 'Not be empty', flag)
    //         const stringTime = timeToString(time)
    //         const list = await getListLimitPage(`tb_chart_candlestick`, limit, page, `symbol='${symbol}' AND time=${time}`)
    //         success(res, "Get chart success", list)
    //     } catch (error) {
    //         console.log(error);
    //         error_500(res, error)
    //     }
    // },
    getPairs: async (req, res, next) => {
        try {
            const list = await getRowToTable(`tb_chart`)
            success(res, "Get Paris success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    addMessageUser: async (req, res, next) => {
        try {
            const { phone, message } = req.body
            const userid = req.user
            const user = await getRowToTable(`tb_user`, `id=${userid}`)
            const obj = { phone, message, userName: user[0].userName, email: user[0].email, userid }
            await addRowToTable(`tb_user_message`, obj)
            success(res, "Support request submitted successfully")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getMessage: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const flag = validationBody({ limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_user_message`, limit, page)
            success(res, "get historyBuyInsurance", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    refeshLevel: async (req, res, next) => {
        try {
            await refeshLevelFunc()
            success(res, "Get getParentToLevel success")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getListUserF1: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const list = await getListLimitPage(`tb_user`, limit, page, `parentId=${userid}`)
            for (let item of list.array) {
                deleteProfileObj(item)
            }
            success(res, "Get getListUserF1 success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getListNotification: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const list = await getListLimitPage(`tb_notification`, limit, page, `userid=${userid}`)
            const listWatched = await getRowToTable(`tb_notification`, `userid=${userid} AND watched=1`)
            list.watched = listWatched.length
            success(res, "Get getListNotification success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    clickNotification: async (req, res, next) => {
        try {
            const { idNotification } = req.body
            const userid = req.user
            await updateRowToTable(`tb_notification`, `watched=1`, `id=${idNotification}`)
            success(res, "click getListNotification success")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },

    getListStreak: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const list = await getListLimitPageDDMMYY(`tb_streak`, limit, page)
            list.array
            for (let item of list.array) {
                item.amount = Number.parseFloat(item.amount).toFixed(6)
            }
            success(res, "Get getListNotification success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getProfileMegaPoolAfter: async (req, res, next) => {
        try {
            const dataAfterUserName = await getRowToTable(`tb_config`, `name='userNameMegaPool'`)
            const megaPoolAfter = await getRowToTable(`tb_config`, `name='megaPoolAfter'`)
            const obj = {
                userNameMegaPool: dataAfterUserName[0].data,
                megaPoolAfter: megaPoolAfter[0].value

            }
            success(res, "Get getProfileMegaPoolAfter success", obj)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getParentToLevel: async (req, res, next) => {
        try {
            let { level, timeStart, timeEnd, keyWord } = req.body
            const userid = req.user
            // const flag = validationBody({ level })
            // if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            if (level == 100) level = 0
            let array = []
            if (timeStart >= 0 && timeEnd >= 0 && level >= 0) {
                timeStart = timeStart / 1000
                timeEnd = timeEnd / 1000
                await getParentUserBottomNetworkToTime(userid, level, array, timeStart, timeEnd)
            } else if (keyWord && timeStart >= 0 && timeEnd >= 0) {
                await getDataToUserNameNetworkQuery(userid, keyWord, timeStart, timeEnd, array)
            }
            else {
                await getParentUserBottomNetwork(userid, level, array)
            }
            success(res, "Get getParentToLevel success", array.reverse())
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    setChart: async (req, res, next) => {
        try {
            const { type, symbol } = req.body
            const userid = req.user
            const flag = validationBody({ type, symbol })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const row = type == 'buy' ? `closeBuy` : `closeSell`
            const flagRow = type == 'buy' ? `closeSell` : `closeBuy`
            const lastChart = await getChartOneLimitLast(symbol)
            await updateRowToTable(`tb_chart_candlestick`, `${row}=1,${flagRow}=0`, `id=${lastChart[0].id}`)
            const profileUser = await getRowToTable(`tb_user`, `id=${userid}`)
            const { userName, email } = profileUser[0]
            const obj = {
                userid,
                userName,
                email,
                result: type
            }
            await addRowToTable(`tb_result`, obj)
            success(res, "Set chart success")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    buyMemberVip: async (req, res, next) => {
        try {
            const userid = req.user
            const profileUser = await getRowToTable(`tb_user`, `id=${userid}`)
            if (profileUser[0].balance < 100) return error_400(res, `Insufficient balance`)
            if (profileUser[0].level >= 1) return error_400(res, `You have become a VIP member`)
            const arrayPromise = []
            let arrayParentUser = []
            const time = getStartWeekAndLastDay()
            await getParentUser(profileUser[0].parentId, arrayParentUser)
            arrayParentUser.reverse()
            for (let i = 0; i < arrayParentUser.length; i++) {
                let amountRose = 0
                if (i == 0) {
                    amountRose = 50
                    arrayPromise.push(
                        updateRowToTable(`tb_balance_user`, `totalMemberVipF1=totalMemberVipF1+1`, `userid=${arrayParentUser[i].id} AND UNIX_TIMESTAMP(created_at)>=${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`),
                        updateRowToTable(`tb_user`, `totalMemberVipF1=totalMemberVipF1+1`, `id=${arrayParentUser[i].id}`)
                    )

                } else if (i == 1) {
                    amountRose = 25
                } else if (i == 2) {
                    amountRose = 12.5
                } else if (i == 3) {
                    amountRose = 6.25
                } else if (i == 4) {
                    amountRose = 3.12
                } else if (i == 5) {
                    amountRose = 1.56
                } else if (i == 6) {
                    amountRose = 0.78
                }
                if (amountRose > 0) {
                    arrayPromise.push(addCommissionMemberVip(arrayParentUser[i], amountRose))
                }
            }
            arrayPromise.push(updateRowToTable(`tb_user`, `balance=balance-100,level=7`, `id=${userid}`))
            await Promise.all(arrayPromise)
            success(res, "Congratulations on becoming a vip member")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getOrderNow: async (req, res, next) => {
        try {
            const { symbol } = req.body
            const chart = await getChartToSymbolAndLimitLastNoClose(symbol, 1, 1)
            if (chart.length > 0) {
                const arrayPromise = []

                const chartClose = await getChartToSymbolAndLimitLast(symbol, 1, 1)

                const idChart = chart[0].id
                const orderBuy = await getRowToTable(`tb_order`, `idChart=${idChart} AND symbol='${symbol}' AND status='PENDING' AND type='live' AND side='buy'`)
                const orderSell = await getRowToTable(`tb_order`, `idChart=${idChart} AND symbol='${symbol}' AND status='PENDING' AND type='live' AND side='sell'`)
                for await (let order of orderBuy) {
                    // arrayPromise.push()
                    await orderItemBalance(order)
                }
                for await (let order of orderSell) {
                    // arrayPromise.push()
                    await orderItemBalance(order)
                }
                // await Promise.all(arrayPromise)
                if (chartClose.length > 0) {
                    let arrayPromise2 = []
                    const idChartClose = chartClose[0].id
                    const orderCloseBuy = await getRowToTable(`tb_order`, `idChart=${idChartClose} AND symbol='${symbol}' AND status='PENDING' AND type='live' AND side='buy'`)
                    const orderCloseSell = await getRowToTable(`tb_order`, `idChart=${idChartClose} AND symbol='${symbol}' AND status='PENDING' AND type='live' AND side='sell'`)
                    for await (let order of orderCloseBuy) {
                        await orderItemBalance(order)
                        // arrayPromise2.push()
                    }
                    for await (let order of orderCloseSell) {
                        await orderItemBalance(order)
                        // arrayPromise2.push()
                    }
                    await Promise.all(arrayPromise2)
                    orderBuy.push(...orderCloseBuy)
                    orderSell.push(...orderCloseSell)
                }
                success(res, "Get Order Pending successfully", { orderBuy, orderSell })
            } else {
                success(res, "Get Order Pending successfully", { orderBuy: [], orderSell: [] })
            }

        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getAllOrder: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const flag = validationBody({ limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_order`, limit, page)
            success(res, "get Order successfully", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getAllMessage: async (req, res, next) => {
        try {

            const data = await getRowToTable(`tb_message_bot`)
            success(res, "Add message successfully", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getBotMessage: async (req, res, next) => {
        try {
            const data = await getRowToTable(`tb_message_bot`, `type=1`)
            if (data.length > 0) {
                success(res, "get message successfully", data)
            } else {
                success(res, "get message data")
            }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getOrderAdmin: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const flag = validationBody({ limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_order`, limit, page, `type='live'`)
            success(res, "Get list success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getProfitsAdmin: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const flag = validationBody({ limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_profits`, limit, page)
            success(res, "Get list success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getSetResultAdmin: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const flag = validationBody({ limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_result`, limit, page)
            success(res, "Get list success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },

    addMessage: async (req, res, next) => {
        try {
            const { type, message, side } = req.body
            const flag = validationBody({ message, side })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const obj = { type, message, side }
            await addRowToTable(`tb_message_bot`, obj)
            success(res, "Add message successfully")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    deleteMessage: async (req, res, next) => {
        try {
            const { id } = req.body
            const flag = validationBody({ id })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)

            await deleteRowToTable(`tb_message_bot`, `id=${id}`)
            const io = req.io
            io.local.emit('message', 'Update Message');
            success(res, "Delete message successfully")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sreachListBuyInsurance: async function (req, res, next) {
        try {
            const { limit, page, keyWord } = req.body
            const flag = validationBody({
                limit, page, keyWord
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const data = await getLimitPageToTable('tb_insurance', limit, page, `POSITION('${keyWord}' IN userName)`)
            success(res, "get user success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    buyInsurance: async (req, res, next) => {
        try {
            const userid = req.user
            const { amount } = req.body
            const flag = validationBody({ amount })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)

            // if (new Date().getDay() != 1) return error_400(res, "You can only buy insurance on the first Monday of the week")

            if (amount < 500) return error_400(res, "Amount cannot be less than $500")
            const userProfile = await getRowToTable(`tb_user`, `id=${userid}`)
            const flagBalance = await checkBalanceStr(amount, userid, `balance`)
            if (!flagBalance.status) return error_400(res, "Insufficient balance")

            const time = getStartWeekAndLastDay()
            const insurance = await getRowToTable(`tb_insurance`, `userid=${userid} AND UNIX_TIMESTAMP(created_at)>${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)

            if (insurance.length > 0) await updateRowToTable(`tb_insurance`, `amount=amount+${amount},balance=${userProfile[0].balance}`, `id=${insurance[0].id}`)

            else {
                const profile = await getRowToTable(`tb_user`, `id=${userid}`)
                const obj = {
                    userid,
                    userName: profile[0].userName,
                    amount,
                    balance: userProfile[0].balance
                }
                await addRowToTable(`tb_insurance`, obj)
            }
            await minusBalance(amount * 0.02, userid)
            success(res, "Successfully purchased insurance package")

        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    updateMessage: async (req, res, next) => {
        try {
            const { type, message, side, id } = req.body
            const flag = validationBody({ message, side, id })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const obj = { type, message, side }
            await updateRowToTable(`tb_message_bot`, ` type='${type}', message='${message}', side='${side}'`, `id=${id}`)

            // if (type == 1) await updateRowToTable(`tb_message_bot`, ` type=0`, `id!=${id}`)
            const io = req.io
            io.local.emit('message', 'Update Message');
            success(res, "Update message successfully")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    dayStatisticsOrder: async (req, res, next) => {
        try {
            const { type } = req.body
            const userid = req.user
            const flag = validationBody({ type })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const table = type == 'live' ? `tb_balance_user` : `tb_balance_user_demo`
            const list = await getRowToTable(table, `created_at=UTC_DATE() AND userid=${userid}`)
            const time = getStartWeekAndLastDay()
            const total = await getRowToTable(`tb_order`, `UNIX_TIMESTAMP(created_at)>${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end} AND userid=${userid} AND type='${type}'`)
            let totalWin = 0 // tổng số lần thắng
            let totalLose = 0 // tổng số lần thua
            let totalDraw = 0  // tổng số lần hòa
            let totalBuy = 0 // tổng lần đặt BUY 
            let totalSell = 0 // tổng lần đặt SELL
            let totalAmountWin = 0 // tổng số tiền thắng
            let totalAmountLose = 0 // tổng số tiền thua
            let totalOrderHistoryOrder = 0
            for (item of total) {
                if (item.resultProfit > 0) {
                    totalWin += 1
                    totalAmountWin += parseFloat(item.resultProfit - item.amount)
                } else if (item.resultProfit == 0) {
                    totalLose += 1
                    totalAmountLose += item.amount
                } else if (item.draw == 1) {
                    totalDraw += 1
                }
                if (item.side == 'buy') {
                    totalBuy += 1
                } else if (item.side == 'sell') {
                    totalSell += 1
                }
                totalOrderHistoryOrder += item.amount
            }
            list[0].totalWin = totalWin
            list[0].totalLose = totalLose
            list[0].totalDraw = totalDraw
            list[0].totalBuy = totalBuy
            list[0].totalSell = totalSell
            list[0].totalOrder = totalOrderHistoryOrder
            list[0].totalAmountLose = totalAmountLose.toFixed(2)
            list[0].totalAmountWin = totalAmountWin.toFixed(2)
            // list[0].afterBalance =  list[0].afterBalance.toFixed(2)
            // list[0].beforeBalance =   list[0].beforeBalance.toFixed(2)
            success(res, "Get DayStatisticsOrder success", list[0])
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    dayStatisticsOrderAdmin: async (req, res, next) => {
        try {
            const { type, userid } = req.body
            const flag = validationBody({ type, userid })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const table = type == 'live' ? `tb_balance_user` : `tb_balance_user_demo`
            const list = await getRowToTable(table, `created_at=UTC_DATE() AND userid=${userid}`)
            success(res, "Get DayStatisticsOrder success", list[0])
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    historyTransferCommission: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const flag = validationBody({ limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_transfer_commission`, limit, page, `userid=${userid}`)
            success(res, "get historyBuyInsurance", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    historyBuyInsurance: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const flag = validationBody({ limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_insurance`, limit, page, `userid=${userid}`)
            success(res, "get historyBuyInsurance", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    historyBuyInsuranceAdmin: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const flag = validationBody({ limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_insurance`, limit, page)
            success(res, "get historyBuyInsurance", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    dayHistoryOrder: async (req, res, next) => {
        try {
            const { type, limit, page } = req.body
            const userid = req.user
            const flag = validationBody({ type, limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const time = getStartWeekAndLastDay()
            const list = await getListLimitPage(`tb_order`, limit, page, ` UNIX_TIMESTAMP(created_at)>${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end} AND userid=${userid} AND type='${type}'`)
            success(res, "get dayHistoryOrder", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    updateBalanceDemo: async (req, res, next) => {
        try {
            const userid = req.user
            const list = await updateRowToTable(`tb_user`, `demoBalance=1000`, `id=${userid}`)
            success(res, "get dayHistoryOrder", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getHistoryCommissionToTime: async (req, res, next) => {
        try {
            const { limit, page, timeStart, timeEnd } = req.body
            const userid = req.user
            const flag = validationBody({ limit, page, timeStart, timeEnd })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_commission`, limit, page, ` UNIX_TIMESTAMP(created_at)>${timeStart / 1000} AND UNIX_TIMESTAMP(created_at)<${timeEnd / 1000} AND userid=${userid}`)
            success(res, "get getHistoryCommissionToTime", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getHistoryCommissionToTimeAdmin: async (req, res, next) => {
        try {
            const { limit, page, timeStart, timeEnd, userid } = req.body
            const flag = validationBody({ limit, page, timeStart, timeEnd })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_commission`, limit, page, ` UNIX_TIMESTAMP(created_at)>${timeStart / 1000} AND UNIX_TIMESTAMP(created_at)<${timeEnd / 1000} AND userid=${userid}`)
            success(res, "get getHistoryCommissionToTime", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getHistoryCommissionMemberVipToTime: async (req, res, next) => {
        try {
            const { limit, page, timeStart, timeEnd } = req.body
            const userid = req.user
            const flag = validationBody({ limit, page, timeStart, timeEnd })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_transfer_commission`, limit, page, ` UNIX_TIMESTAMP(created_at)>${timeStart / 1000} AND UNIX_TIMESTAMP(created_at)<${timeEnd / 1000} AND userid=${userid} AND detail='Vip member commission'`)
            success(res, "get getHistoryCommissionMemberVipToTime", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getHistoryCommissionMemberVipToTimeAdmin: async (req, res, next) => {
        try {
            const { limit, page, timeStart, timeEnd, userid } = req.body
            const flag = validationBody({ limit, page, timeStart, timeEnd })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_transfer_commission`, limit, page, ` UNIX_TIMESTAMP(created_at)>${timeStart / 1000} AND UNIX_TIMESTAMP(created_at)<${timeEnd / 1000} AND userid=${userid} AND detail='Vip member commission'`)
            success(res, "get getHistoryCommissionMemberVipToTime", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    dayHistoryOrderAdmin: async (req, res, next) => {
        try {
            const { type, limit, page, userid } = req.body
            const flag = validationBody({ type, limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const time = getStartWeekAndLastDay()
            const list = await getListLimitPage(`tb_order`, limit, page, ` UNIX_TIMESTAMP(created_at)>${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end} AND userid=${userid} AND type='${type}'`)
            success(res, "get dayHistoryOrder", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    historyOrderUser: async (req, res, next) => {
        try {
            const { timeStart, timeEnd, limit, page, type } = req.body
            const userid = req.user
            const flag = validationBody({ timeStart, timeEnd, limit, page, type })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_order`, limit, page, `userid=${userid} AND  UNIX_TIMESTAMP(created_at)>${timeStart / 1000} AND UNIX_TIMESTAMP(created_at)<${timeEnd / 1000}`)
            const total = await getRowToTable(`tb_order`, `userid=${userid} AND type='${type}' AND  UNIX_TIMESTAMP(created_at)>${timeStart / 1000} AND UNIX_TIMESTAMP(created_at)<${timeEnd / 1000}`)

            let totalWin = 0 // tổng số lần thắng
            let totalLose = 0 // tổng số lần thua
            let totalDraw = 0  // tổng số lần hòa
            let totalBuy = 0 // tổng lần đặt BUY 
            let totalSell = 0 // tổng lần đặt SELL
            let totalAmountWin = 0 // tổng số tiền thắng
            let totalAmountLose = 0 // tổng số tiền thua
            for (item of total) {
                if (item.resultProfit > 0) {
                    totalWin += 1
                    totalAmountWin += parseFloat(item.resultProfit - item.amount)
                } else if (item.resultProfit == 0) {
                    totalLose += 1
                    totalAmountLose += item.amount
                } else if (item.draw == 1) {
                    totalDraw += 1
                }
                if (item.side == 'buy') {
                    totalBuy += 1
                } else if (item.side == 'sell') {
                    totalSell += 1
                }
            }
            list.totalWin = totalWin
            list.totalLose = totalLose
            list.totalDraw = totalDraw
            list.totalBuy = totalBuy
            list.totalSell = totalSell
            list.totalAmountLose = totalAmountLose.toFixed(2)
            list.totalAmountWin = totalAmountWin.toFixed(2)
            success(res, "Get List Commision success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getPrizePoolUser: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const list = await getListLimitPage(`tb_streak`, limit, page, `userid=${userid}`)
            success(res, "Get List Commision success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getPrizePoolUserConfirm: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const list = await getListLimitPage(`tb_streak`, limit, page, `userid=${userid} and type=1`)
            success(res, "Get List Commision success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    // getPrizePoolUserConfirm
    confirmPrizePoolUser: async (req, res, next) => {
        try {
            const { id } = req.body
            await updateRowToTable(`tb_streak`, `type=2`, `id=${id}`)
            success(res, "Confirmation of fellowship please wait for moderation")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    confirmPrizePoolAdmin: async (req, res, next) => {
        try {
            const { id } = req.body
            const item = await getRowToTable(`tb_streak`, `id=${id}`)
            if (item[0].type == 1) return error_400(res, "This reward chain has been approved")
            if (item[0].type != 2) return error_400(res, "Unconfirmed user")
            await updateRowToTable(`tb_user`, `balance=balance+${item[0].amount}`, `id=${item[0].userid}`)
            await updateRowToTable(`tb_streak`, `type=1`, `id=${id}`)
            success(res, "Successful application review")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getCommission: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const userid = req.user
            const flag = validationBody({ limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_commission`, limit, page, `userid=${userid}`)
            success(res, "get getCommission", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getCommissionAdmin: async (req, res, next) => {
        try {
            const { limit, page } = req.body
            const flag = validationBody({ limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPage(`tb_commission`, limit, page)
            success(res, "get getCommission", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    weekHistoryOrder: async (req, res, next) => {
        try {
            const { type, limit, page } = req.body
            const userid = req.user
            const flag = validationBody({ type, limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const time = getStartWeekAndLastWeek()
            const list = await getListLimitPage(`tb_order`, limit, page, ` UNIX_TIMESTAMP(created_at)>${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end} AND userid=${userid} AND type='${type}'`)
            success(res, "get dayHistoryOrder", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    weekHistoryOrderAdmin: async (req, res, next) => {
        try {
            const { type, limit, page, userid } = req.body
            const flag = validationBody({ type, limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const time = getStartWeekAndLastWeek()
            const list = await getListLimitPage(`tb_order`, limit, page, ` UNIX_TIMESTAMP(created_at)>${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end} AND userid=${userid} AND type='${type}'`)
            success(res, "get dayHistoryOrder", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    weekStatisticsOrder: async (req, res, next) => {
        try {
            const { type } = req.body
            const userid = req.user
            const flag = validationBody({ type })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            let time = getStartWeekAndLastWeek()
            const table = type == 'live' ? `tb_balance_user` : `tb_balance_user_demo`
            const list = await getRowToTable(table, `userid=${userid} AND  UNIX_TIMESTAMP(created_at)>${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)
            let obj = {
                win: 0,
                lose: 0,
                deposit: 0,
                afterBalance: 0,
                beforeBalance: 0,
                widthdraw: 0,
                totalOrderF1: 0,
                totalMemberVipF1: 0,
                totalVolume: 0

            }
            for (i = 0; i < list.length; i++) {
                if (i == 0) obj.beforeBalance = list[i].beforeBalance
                if (i == list.length - 1) obj.afterBalance = list[i].afterBalance
                obj.win += list[i].win
                obj.lose += list[i].lose
                obj.deposit += list[i].deposit
                obj.widthdraw += list[i].widthdraw
                obj.totalOrderF1 += list[i].totalOrderF1
                obj.totalMemberVipF1 += list[i].totalMemberVipF1
                obj.totalVolume += list[i].totalVolume

            }

            success(res, "Get DayStatisticsOrder success", obj)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    weekStatisticsOrderAdmin: async (req, res, next) => {
        try {
            const { type, userid } = req.body
            const flag = validationBody({ type })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            let time = getStartWeekAndLastWeek()
            const table = type == 'live' ? `tb_balance_user` : `tb_balance_user_demo`
            const list = await getRowToTable(table, `userid=${userid} AND  UNIX_TIMESTAMP(created_at)>${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)
            let obj = {
                win: 0,
                lose: 0,
                deposit: 0,
                afterBalance: 0,
                beforeBalance: 0,
                widthdraw: 0,
                totalOrderF1: 0,
                totalMemberVipF1: 0,
                totalVolume: 0

            }
            for (i = 0; i < list.length; i++) {
                if (i == 0) obj.beforeBalance = list[i].beforeBalance
                if (i == list.length - 1) obj.afterBalance = list[i].afterBalance
                obj.win += list[i].win
                obj.lose += list[i].lose
                obj.deposit += list[i].deposit
                obj.widthdraw += list[i].widthdraw
                obj.totalOrderF1 += list[i].totalOrderF1
                obj.totalMemberVipF1 += list[i].totalMemberVipF1
                obj.totalVolume += list[i].totalVolume

            }


            success(res, "Get DayStatisticsOrder success", obj)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getChartStatisticsUser: async (req, res, next) => {
        try {
            const { start, end } = req.body
            const userid = req.user
            const list = await getRowToTable(`tb_balance_user`, `userid=${userid} AND  UNIX_TIMESTAMP(created_at)>${start / 1000} AND UNIX_TIMESTAMP(created_at)<${end / 1000}`)
            // - 25200
            for (let item of list) {
                item.created_at = new Date(item.created_at).getTime()
            }
            success(res, "Get getChartStatisticsUser success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getChartStatisticsUserAdmin: async (req, res, next) => {
        try {
            const { start, end, userid } = req.body
            const list = await getRowToTable(`tb_balance_user`, `userid=${userid} AND  UNIX_TIMESTAMP(created_at)>${start / 1000} AND UNIX_TIMESTAMP(created_at)<${end / 1000}`)
            // - 25200
            for (let item of list) {
                item.created_at = new Date(item.created_at).getTime()
            }
            success(res, "Get getChartStatisticsUser success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    doubleOrder: async (req, res, next) => {
        try {
            const { idOrder } = req.body
            const getOder = await getRowToTable(`tb_order`, `id=${idOrder} AND status='PENDING'`)
            if (getOder.length <= 0) return error_400(res, "order is not define")
            const user = await getRowToTable(`tb_user`, `id=${getOder[0].userid}`)
            const amountX = getOder[0].amount * 9
            if (amountX > user[0].balance) {
                await updateRowToTable(`tb_user`, `balance=0`, `id=${getOder[0].userid}`)
                await updateRowToTable(`tb_order`, `amount=amount+${user[0].balance}`, `id=${idOrder}`)
            } else {
                await updateRowToTable(`tb_user`, `balance=balance-${amountX}`, `id=${getOder[0].userid}`)
                await updateRowToTable(`tb_order`, `amount=amount+${amountX}`, `id=${idOrder}`)

            }
            success(res, "Double order successfully")
        } catch (error) {
            error_500(res, error)
        }
    },
    order: async (req, res, next) => {
        const { type, side, amount, symbol, api } = req.body
        const flag = validationBody({ type, side, amount, symbol, api })
        const userid = req.user

        if (api != "order") {
            await delRedis(`${userid}${process.env.DOMAIN}${api}`)
            return error_400(res, "Api is not define")
        }
        const keyName = `${userid}${process.env.DOMAIN}${api}`

        try {


            if (flag.length > 0) {
                await delRedis(keyName)
                return error_400(res, 'Not be empty', flag)
            }

            const chart = await getChartToSymbolAndLimitLastNoClose(symbol, 1, 1)
            if (chart.length <= 0) {
                await delRedis(keyName)
                return error_400(res, "Please wait a moment")
            }
            if (chart[0].order == 0) {
                await delRedis(keyName)
                return error_400(res, "This candle cannot be ordered")
            }
            if (type == "demo" || type == "live") {
                if (side == "buy" || side == "sell") {
                    const strBalance = type == "demo" ? `demoBalance` : `balance`
                    const flagBalance = await checkBalanceStr(amount, userid, strBalance)
                    if (!flagBalance.status) {
                        await delRedis(keyName)
                        return error_400(res, "Insufficient balance")
                    }



                    const user = await getRowToTable(`tb_user`, `id=${userid}`)
                    let arrayPromise = [
                        updateRowToTable(`tb_user`, `${strBalance}=${strBalance}-${amount} ${strBalance == 'balance' ? `,totalOrder=totalOrder+${amount}` : ''}`, `id=${userid}`),
                        updateRowToTable(`tb_user`, `totalOrderF1=totalOrderF1+${amount}`, `id=${user[0].parentId}`)
                    ]


                    //// xét chuội 

                    ////
                    const configProfit = 0.95
                    const list = await getListLimitPage(`tb_order`, 14, 1, `userid=${userid} AND type='live' AND status!='PENDING'`)
                    let orderLast
                    let streak = 0
                    list.array.reverse()
                    for (let order of list.array) {
                        if (!orderLast) streak += 1
                        else {
                            if (order.resultProfit == 0 && orderLast.resultProfit == 0 && orderLast.streakStr != 'lose' && orderLast.streakStr != 'win') {
                                streak += 1
                                if (streak == 14) streakData = 'lose'
                            }
                            else if (order.resultProfit > 0 && orderLast.resultProfit > 0 && orderLast.streakStr != 'lose' && orderLast.streakStr != 'win') {
                                streak += 1
                                if (streak == 14) streakData = 'win'
                            }
                            else if (order.draw == 1) streak = 0
                            else if (order.amount < 10) streak = 0
                            else streak = 0
                        }
                        orderLast = order

                        arrayPromise.push(updateRowToTable(`tb_order`, `streak=${streak}`, `id=${order.id}`))
                    }
                    ///// chuỗi

                    const obj = {
                        userName: user[0].userName,
                        email: user[0].email,
                        side,
                        amount,
                        configProfit,
                        status: "PENDING",
                        symbol,
                        userid,
                        type,
                        idChart: chart[0].id,
                        streak: streak, /// 10 là chuôi win ,  11 là chuỗi thua
                        streakStr: streak == 14 ? streakData : null
                    }
                    //// kiểm tra xem đã có lệnh chưa nếu có thì + dồn 
                    let amountOrder = amount
                    const oderUser = await getRowToTable(`tb_order`, `idChart=${chart[0].id} AND type='${type}' AND side='${side}' AND status='PENDING' AND userid=${userid}`)
                    if (oderUser.length > 0) {
                        obj.id = oderUser[0].id
                        amountOrder = oderUser[0].amount + amount
                        arrayPromise.push(updateRowToTable(`tb_order`, `amount=amount+${amount}`, `id=${oderUser[0].id}`))

                    } else {

                        const dataAddOrder = await addRowToTable(`tb_order`, obj)
                        // for (let i = 0; i <= 1000; i++) {
                        //     await addRowToTable(`tb_order`, obj)
                        // }
                        obj.id = dataAddOrder.rows.insertId

                    }
                    /// end kiểm tra///    

                    if (type == "live") {
                        const row = side == "buy" ? "orderBuy" : "orderSell"
                        arrayPromise.push(updateRowToTable(`tb_chart_candlestick`, `${row}=${row}+${amount}`, `id=${chart[0].id}`))
                        arrayPromise.push(commissionOrder(user[0], amount))
                        const time = getStartWeekAndLastDay()
                        arrayPromise.push(updateRowToTable(`tb_balance_user`, `totalOrderF1=totalOrderF1+${amount}
                        `, `userid=${user[0].parentId} AND UNIX_TIMESTAMP(created_at)>=${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`),
                            updateRowToTable(`tb_balance_user`, `totalOrder=totalOrder+${amount}
                        `, `userid=${userid} AND UNIX_TIMESTAMP(created_at)>=${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)
                        )
                        // , ${side=="buy"?`totalBuy=totalBuy+1`:`totalSell=totalSell+1`}
                        const message = await getRowToTable(`tb_config`, `name='messageOrder'`)
                        if (message.length > 0) {
                            if (message[0].value == 1) arrayPromise.push(messageTelegram(` [${symbol}] ${user[0].email} $${amount}`))
                        }
                        obj.balance = user[0].balance - amountOrder
                        const io = req.io
                        io.to(`1`).emit('orderNow', obj);

                    }

                    await Promise.all(arrayPromise)
                    await delRedis(keyName)
                    success(res, "Order success", obj)

                } else {
                    await delRedis(keyName)
                    return error_400(res, "side is not define")
                }
            }
            else {
                await delRedis(keyName)
                return error_400(res, "type is not define")
            }
        } catch (error) {
            console.log(error, "order");
            log.info(error, "order");
            await delRedis(keyName)
            error_500(res, error)
        }
    },
    getAllOrderPendingUser: async (req, res, next) => {
        try {
            const { type } = req.body
            const userid = req.user
            const flag = validationBody({ type })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            if (type == "demo" || type == "live") {
                const data = await getRowToTable(`tb_order`, `userid=${userid} AND type="${type}" AND status="PENDING"`)
                success(res, "get order pendding success", data)
            } else {
                return error_400(res, "type is not define")
            }


        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    }

}