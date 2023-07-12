const { default: axios } = require("axios");
const { convertTimeToString, validationBody, getPriceSell, getPriceSiring = ramdomNumber, ramdomNumber } = require("../commons");
const { addPosition, closeMarketFutureFunc } = require("../commons/binance");
const { addChartSpotBinance } = require("../commons/crypto");
const { getListLimitPage, getListLimitPageHistory } = require("../commons/request");
const { dogeWarInstance } = require("../contract");
const { success, error_400, error_500 } = require("../message");
const { getRedis } = require("../model/model.redis");
const { getRowToTable, addRowToTable, updateRowToTable } = require("../queries/customerQuery");
require('dotenv').config()


module.exports = {
    getListCoin: async (req, res, next) => {
        try {
            const listCoin = await getRowToTable(`tb_chart`)
            success(res, "get LISTv coin success", listCoin)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    addChartBinance: async (req, res, next) => {
        try {
            const { symbol } = req.body
            await addChartSpotBinance(symbol)
            success(res, "Add chart success")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    funding: async function (req, res) {
        try {
            const data = await axios({
                url: `https://open-api.coinglass.com/public/v2/funding`,
                method: "GET",
                headers: {
                    "coinglassSecret": `8691d48d2e8f4b5a88c8a99f6fdd841d`
                }
            })
            success(res, "funding success", data.data.data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getListOrderFutureAdmin: async (req, res, next) => {
        try {
            const userid = req.user
            const { limit, page } = req.body
            const list = await getListLimitPage(`tb_future`, limit, page)
            success(res, "Get list success", list)
        } catch (error) {
            console.log(error, `getListPositionAdmin`);
            error_500(res, error)
        }
    },
    getListPositionAdmin: async (req, res, next) => {
        try {
            const userid = req.user
            const { limit, page } = req.body
            const list = await getListLimitPage(`tb_position_future`, limit, page)
            success(res, "Get list success", list)
        } catch (error) {
            console.log(error, `getListPositionAdmin`);
            error_500(res, error)
        }
    },
    setPercentChart: async (req, res, next) => {
        try {
            const userid = req.user
            const { symbol, percent } = req.body
            await updateRowToTable(`tb_chart`, `percent=${percent}`, `symbol='${symbol}'`)
            success(res, "Update success")
        } catch (error) {

        }
    },
    setBalance: async (req, res, next) => {
        try {
            const userid = req.user
            const { balance } = req.body
            await updateRowToTable(`tb_user`, `balance=balance+${balance}`, `id=${userid}`)
            if (balance > 0) {
                await addRowToTable(`tb_deposit_balance`, {
                    userid,
                    amount: balance
                })
            }
            success(res, "Update success")
        } catch (error) {

        }
    },
    getTotalBuy: async (req, res, next) => {
        try {
            const { limit, page, symbol } = req.body
            const list = await getListLimitPage(`tb_buy_binance`, 7, page, `symbol='${symbol}'`)
            success(res, "Get List Commision success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getTotalSell: async (req, res, next) => {
        try {
            const { limit, page, symbol } = req.body
            const list = await getListLimitPage(`tb_sell_binance`, 7, page, `symbol='${symbol}'`)
            success(res, "Get List Commision success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    cancelOpenOrder: async (req, res, next) => {
        try {
            const { idOrder } = req.body
            // const order
        } catch (error) {
            console.log(error);
        }
    },
    orderFuture: async (req, res, next) => {
        try {
            const { amount, regime, core, symbol, side, typeTrade, priceLimit } = req.body
            /// amount là số lượng order 
            // regime là Cross hoặc Isolated
            // core là x đòn bẫy
            // symbol là cặp trade
            // side là trade buy hoạc sell
            // typeTrade là đặt lệnh Limit hoặc Market
            // priceLimit nếu typeTrade là Limit thì thêm priceLimit vào
            const userid = req.user
            const profile = await getRowToTable(`tb_user`, `id=${userid}`)
            if (profile.length > 0) {
                const ramdom = ramdomNumber(10, 100)
                const percent = ramdom / 100
                const amountCore = amount / core - (amount / core * (percent / 100))
                // const amountCore = amount - (amount * (percent / 100))

                if (profile[0].balance < amountCore) return error_400(res, "Insufficient balance")
                ///
                // const itemFuture = await getRowToTable(`tb_future`,`userid=${userid} AND type=1`)
                // if(itemFuture.length>0){
                //     if(itemFuture[0].regime)
                // }
                ///

                const priceSymbol = await getRowToTable(`tb_chart`, `symbol='${symbol}'`)
                if (typeTrade == "Limit") {
                    const checkPriceTrade = priceSymbol[0].close * 0.1 + priceSymbol[0].close
                    if (checkPriceTrade < priceLimit) return error_400(res, `Limit price can't be higher than ${checkPriceTrade}.`)
                }
                const amountCoinMinimum = 30 / priceSymbol[0].close
                if (amount < 30) return error_400(res, `Minimum Qty is 29.9 ${priceSymbol[0].pair} ≈ ${parseFloat(amountCoinMinimum).toFixed(3)} ${priceSymbol[0].currency}`)
                ///// check position
                const position = await getRowToTable(`tb_position_future`, `userid=${userid} AND symbol='${symbol}'`)
                if (position.length > 0) {
                    if (position[0].core < core) return error_400(res, `Leverage reduction is not supported in Isolated Margin Mode with open positions.`)
                    if (position[0].regime != regime) return error_400(res, `The margin mode cannot be changed while you have an open order/position`)
                }
                ////
                let amountCoin
                if (typeTrade == "Market") {
                    amountCoin = amountCore / priceSymbol[0].close
                } else {
                    amountCoin = amountCore / priceLimit
                }
                let liquidationPrice = 0
                if (side == 'sell') {
                    if (core == 1) {
                        liquidationPrice = priceSymbol[0].close * 2
                    } else {
                        liquidationPrice = priceSymbol[0].close + (priceSymbol[0].close / core)
                    }
                }
                let idPosition = 0
                if (typeTrade == "Market") {
                    const percentUser = 2 / 100
                    // const balanceUser = amountCore + amountCore * percentUser
                    // const balanceUser = amountCore 
                    // await updateRowToTable(`tb_user`, `balance=balance-${balanceUser}`, `id=${userid}`)
                    idPosition = await addPosition(userid, symbol, amountCore, regime, side, core)
                }


                const obj = {
                    userid,
                    email: profile[0].email,
                    cost: typeTrade == "Market" ? priceSymbol[0].close : priceLimit,
                    amount: amountCore,
                    core,
                    type: 1,
                    regime,
                    symbol,
                    amountCoin,
                    side,
                    liquidationPrice,
                    orderEntryPrice: typeTrade == "Market" ? priceSymbol[0].close : priceLimit,
                    closeEntryPrice: 0,
                    idPosition: idPosition ? idPosition : 0,
                    typeTrade,
                }
                await addRowToTable(`tb_future`, obj)
                success(res, "Order sucess")
            }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getHistoryOpenOrder: async (req, res, next) => {
        try {
            const userid = req.user
            const { limit, page, symbol } = req.body
            const list = await getListLimitPage(`tb_future`, limit, page, `type=2 AND userid=${userid} AND symbol='${symbol}'`)
            success(res, "Get list Open Order Success", list)
        } catch (error) {
            console.log(error);
        }
    },
    /// type 1 đang chạy
    /// type 2 đang chờ vào lệnh
    /// type 3 đã chốt lệnh
    leverAdjustment: async (req, res, next) => {
        try {
            const userid = req.user
            const { idPosition, core } = req.body
            const list = await getRowToTable(`tb_position_future`, `id=${idPosition} AND userid=${userid}`)
            if (list.length > 0) {
                const amount = list[0].core * list[0].margin
                const amountCore = amount / core
                await updateRowToTable(`tb_position_future`, `margin=${amountCore},core=${core}`, `id=${idPosition} AND userid=${userid}`)
                success(res, "Successful leverage change")
            } else {
                error_400(res, "is not define")
            }
        } catch (error) {
            console.log(error);
        }
    },
    getPosition: async (req, res, next) => {
        try {
            const userid = req.user
            const { symbol } = req.body
            const list = await getRowToTable(`tb_position_future`, `userid=${userid}`)
            if (list.length > 0) {
                success(res, "Get Position Success", list)
            } else {
                error_400(res, "is not define")
            }
        } catch (error) {
            console.log(error);
        }
    },
    getDepositBalance: async (req, res, next) => {
        try {
            const userid = req.user
            const { limit, page } = req.body
            const list = await getListLimitPage(`tb_deposit_balance`, limit, page, `userid=${userid}`)
            success(res, "Get list Open Order Success", list)
        } catch (error) {
            console.log(error);
        }
    },
    getHistoryOrder: async (req, res, next) => {
        try {
            const userid = req.user
            const { limit, page } = req.body
            const list = await getListLimitPage(`tb_future`, limit, page, `type!=2 AND userid=${userid}`)
            success(res, "Get list Open Order Success", list)
        } catch (error) {
            console.log(error);
        }
    },
    closeMarketFuture: async (req, res, next) => {
        try {
            const { idFuture } = req.body
            const userid = req.user
            const itemFuture = await getRowToTable(`tb_position_future`, `id=${idFuture} AND userid=${userid}`)
            if (itemFuture.length > 0) {
                const priceSymbol = await getRowToTable(`tb_chart`, `symbol='${itemFuture[0].symbol}'`)
                await closeMarketFutureFunc(itemFuture[0], priceSymbol[0])
                success(res, 'Market Order Filled')
            } else {
                error_400(res, "Order is not define")
            }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    closeMarketFutureAll: async (req, res, next) => {
        try {
            const userid = req.user
            const itemFuture = await getRowToTable(`tb_position_future`, `userid=${userid}`)
            if (itemFuture.length > 0) {
                const arrayPromise = []
                const priceSymbol = await getRowToTable(`tb_chart`, `symbol='${itemFuture[0].symbol}'`)
                for (let item of itemFuture) {
                    arrayPromise.push(closeMarketFutureFunc(item, priceSymbol[0]))
                }
                await Promise.all(arrayPromise)
                success(res, 'Market Order Filled')
            } else {
                error_400(res, "Order is not define")
            }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    }
}