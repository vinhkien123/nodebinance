const { getRowToTable, updateRowToTable, addRowToTable, getChartOneLimitLast, getChartToSymbolAndLimitLast, getChartToSymbolAndLimitLastNoClose, getChartOneLimitLastLast, deleteRowToTable, getChartOneLimitLastOrder, getChartOneLimitLastToTime } = require("../queries/customerQuery")
const { success } = require("../message");
const { getStartWeekAndLastDay } = require(".");
const { getListLimitPage } = require("./request");
const { default: axios } = require("axios");
const { closeMarketFutureFunc } = require("./binance");
const Binance = require('node-binance-api');
const binance = new Binance({
    APIKEY: '<key>',
    APISECRET: '<secret>'
});
async function checkFuturePosition(item, symbol) {
    // regime là Cross hoặc Isolated
    const position = await getRowToTable(`tb_position_future`, `symbol='${symbol}'`)
    if (position.length > 0) {
        const arrayPromise = []
        for await (let itemPosition of position) {
            if (itemPosition.regime == 'cross') {
                if (itemPosition.side == "sell") {
                    const user = await getRowToTable(`tb_user`, `id=${itemPosition.userid}`)
                    const itemUser = user[0]
                    const liquidationPrice = itemUser.balance / (itemPosition.margin * itemPosition.core) * itemPosition.entryPrice
                    if (item.close >= liquidationPrice) {
                        await closeMarketFutureFunc(itemPosition, item)
                        await updateRowToTable(`tb_user`, `balance=0`, `id=${itemPosition.userid}`)
                    }
                }
            } else {
                if (itemPosition.side == "buy") {
                    if (item.close <= itemPosition.liquidationPrice) {
                        await closeMarketFutureFunc(itemPosition, item)
                    }
                } else {
                    if (item.close <= itemPosition.liquidationPrice) {
                        await closeMarketFutureFunc(itemPosition, item)
                    }
                }
            }

        }
    }
}
async function updatePrice(symbol, table, item) {
    const arrayPromise = []
    const list = await getListLimitPage(table, 7, 1, `symbol='${symbol}'`)
    let number = 0.1
    let amountNumber = 0.1
    if(item.close < 10){
        number = 0.0001
        amountNumber = 0.0001
    }else if(item.close > 10 && item.close<50){
        number = 0.001
        amountNumber = 0.001
    }
    // console.log("oOKKKKKKKKKKKKKKKK");
    for (let itemArray of list.array) {
        const usdtRamdom = ramdomNumber(25, 72000)
        let price

        if (table == 'tb_buy_binance') {
            price = parseFloat(item.close) - number
        } else {
            price = parseFloat(item.close) + number
        }
        const amount = usdtRamdom / item.close
        // if(table=='tb_sell_binance'){
        //     console.log(price,"lase");
        //     console.log(item.close,"close");
        // }
        arrayPromise.push(updateRowToTable(table, `amount=${amount},price=${price},totalUSDT=${usdtRamdom}`, `id=${itemArray.id}`))
        number += amountNumber
    }
    await Promise.all(arrayPromise)
}
function ramdomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;;
}
function stringToTime(string) {
    let time = 60
    if (string == "1m") {
        time = 60
    } else if (string == "3m") {
        time = 60 * 3
    } else if (string == "5m") {
        time = 60 * 5
    } else if (string == "15m") {
        time = 60 * 15
    } else if (string == "30m") {
        time = 60 * 30
    } else if (string == "1h") {
        time = 60 * 60
    } else if (string == "2h") {
        time = 60 * 60 * 2
    } else if (string == "4h") {
        time = 60 * 60 * 4
    } else if (string == "6h") {
        time = 60 * 60 * 6
    }
    else if (string == "8h") {
        time = 60 * 60 * 8
    } else if (string == "12h") {
        time = 60 * 60 * 12
    } else if (string == "1d") {
        time = 60 * 60 * 24
    } else if (string == "3d") {
        time = 60 * 60 * 24 * 3
    } else if (string == "1w") {
        time = 60 * 60 * 24 * 7
    } else if (string == "1M") {
        time = 60 * 60 * 24 * 365
    }
    return time
}
function timeToString(string) {
    let time = 60
    if (string == 60) {
        time = "1m"
    } else if (string == 60 * 3) {
        time = "3m"
    } else if (string == 60 * 5) {
        time = "5m"
    } else if (string == 60 * 15) {
        time = "15m"
    } else if (string == 60 * 30) {
        time = "30m"
    } else if (string == 60 * 60) {
        time = "1h"
    } else if (string == 60 * 60 * 2) {
        time = "2h"
    } else if (string == 60 * 60 * 4) {
        time = "4h"
    } else if (string == 60 * 60 * 6) {
        time = "6h"
    }
    else if (string == 60 * 60 * 8) {
        time = "8h"
    } else if (string == 60 * 60 * 12) {
        time = "12h"
    } else if (string == 60 * 60 * 24) {
        time = "1d"
    } else if (string == 60 * 60 * 24 * 3) {
        time = "3d"
    } else if (string == 60 * 60 * 24 * 7) {
        time = "1w"
    } else if (string == 60 * 60 * 24 * 365) {
        time = "1M"
    }
    return time
}
const opts = {
    errorEventName: 'error',
    logDirectory: `${__dirname}/log`,
    fileNamePattern: 'log.txt',
    dateFormat: 'YYYY.MM.DD'
};
const log = require('simple-node-logger').createRollingFileLogger(opts);
function getTimeFristSecond(time) {
    const second = new Date().getTime()
    return Math.floor(second / 1000)
}
async function updateHistoryBalance(userid, str, balance, action) {
    await updateRowToTable(`tb_balance_user`, `${str}=${str}${action}${balance}`, `userid=${userid}`)
}
async function updateHistoryBalanceDemo(userid, str, balance, action) {
    await updateRowToTable(`tb_balance_user_demo`, `${str}=${str}${action}${balance}`, `userid=${userid}`)
}
async function updateStatusBalance(userid, str, amount, action) {
    const time = getStartWeekAndLastDay()
    await updateRowToTable(`tb_balance_user`, `${str}=${str}${action}${amount},afterBalance=afterBalance${action}${amount}`, `userid=${userid} AND UNIX_TIMESTAMP(created_at)>=${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)
}
async function orderSuccess(order, flag, profit) {
    try {
        let arrayPromise = []
        const strBalance = order.type == "demo" ? `demoBalance` : `balance`
        const resultProfit = flag ? order.amount * order.configProfit + order.amount : 0
        const winOder = order.amount * order.configProfit
        const time = getStartWeekAndLastDay()

        // const profileUser = await getRowToTable(`tb_user`, `id=${order.userid}`)
        const profileUser = [{ marketing: 0 }]
        if (flag) {
            ///// thắng
            arrayPromise.push(addBalanceStr(resultProfit, order.userid, strBalance))
            arrayPromise.push(updateRowToTable(`tb_order`, `resultProfit=${resultProfit},status='SUCCESS'`, `id=${order.id}`))
            //// thay đổi balance demo để thống kê

            if (order.type == "demo") {
                arrayPromise.push(
                    updateRowToTable(`tb_balance_user_demo`, `totalOrder=totalOrder+${order.amount},afterBalance=afterBalance+${winOder},win=win+${winOder}`, `userid=${order.userid} AND UNIX_TIMESTAMP(created_at)>=${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)
                )
            } else {
                // if (profileUser[0].marketing == 0) {
                //     const obj = {
                //         username: order.username,
                //         email: order.email,
                //         amount: winOder - order.amount,
                //         userid: order.userid,
                //         type: 0,
                //         profitBefore: profit[0].value,
                //         profitAfter: profit[0].value - winOder,
                //         message: `ORDER TRADE`
                //     }
                //     arrayPromise.push(
                //         updateRowToTable(`tb_config`, `value=value+${winOder}`, `name='lose' OR name='profit'`),
                //         addRowToTable(`tb_profits`, obj)
                //     )
                // }
                arrayPromise.push(
                    updateRowToTable(`tb_balance_user`, `totalOrder=totalOrder+${order.amount},afterBalance=afterBalance+${winOder},win=win+${winOder},totalWin=totalWin+1,totalAmountWin=totalAmountWin+${order.amount}`, `userid=${order.userid} AND UNIX_TIMESTAMP(created_at)>=${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)
                )
                if (order.streak == 8 && order.streakStr == 'win') {
                    const pool = await getRowToTable(`tb_config`, `name='POOL'`)
                    let amountRamdom = pool[0].value
                    const amountBonus = (amountRamdom / 1000).toFixed(2)
                    arrayPromise.push(addRowToTable(`tb_streak`, { userName: order.username, email: order.email, userid: order.userid, amount: amountBonus, streak: order.streakStr }))
                }
            }
        } else if (flag == false) {
            //// thua
            arrayPromise.push(updateRowToTable(`tb_order`, `status='SUCCESS'`, `id=${order.id}`))
            if (order.type == "demo") {
                arrayPromise.push(updateRowToTable(`tb_balance_user_demo`, `totalOrder=totalOrder+${order.amount},afterBalance=afterBalance-${order.amount},lose=lose+${order.amount}`, `userid=${order.userid} AND UNIX_TIMESTAMP(created_at)>=${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`))
            } else {
                // if (profileUser[0].marketing == 0) {
                //     // const obj = {
                //     //     username: order.username,
                //     //     email: order.email,
                //     //     amount: order.amount,
                //     //     userid: order.userid,
                //     //     type: 1,
                //     //     profitBefore: profit[0].value,
                //     //     profitAfter: profit[0].value + order.amount,
                //     //     message: `ORDER TRADE`
                //     // }

                //     arrayPromise.push(
                //         // updateRowToTable(`tb_config`, `value=value+${order.amount}`, `name='win'`),
                //         // updateRowToTable(`tb_config`, `value=value+${order.amount}`, `name='profit'`),
                //         // addRowToTable(`tb_profits`, obj)
                //     )
                // }
                arrayPromise.push(
                    updateRowToTable(`tb_balance_user`, `totalOrder=totalOrder+${order.amount},afterBalance=afterBalance-${order.amount},lose=lose+${order.amount},totalLose=totalLose+1,totalAmountLose=totalAmountLose+${order.amount}`, `userid=${order.userid} AND UNIX_TIMESTAMP(created_at)>=${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)
                )
                if (order.streak == 8 && order.streakStr == 'lose') {
                    const pool = await getRowToTable(`tb_config`, `name='POOL'`)
                    let amountRamdom = pool[0].value
                    const amountBonus = (amountRamdom / 1000).toFixed(2)
                    arrayPromise.push(addRowToTable(`tb_streak`, { userName: order.username, email: order.email, userid: order.userid, amount: amountBonus, streak: order.streakStr }))
                }

            }
        } else if (flag == undefined) {
            // hòa draw
            arrayPromise.push(updateRowToTable(`tb_order`, `status='SUCCESS',draw=1`, `id=${order.id}`))
            arrayPromise.push(updateRowToTable(`tb_user`, `balance=balance+${order.amount}`, `id=${order.userid}`))
            arrayPromise.push(
                updateRowToTable(`tb_balance_user`, `totalOrder=totalOrder+${order.amount},totalDraw=totalDraw+1`, `userid=${order.userid} AND UNIX_TIMESTAMP(created_at)>=${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)
            )
        }

        await Promise.all(arrayPromise)
    } catch (error) {
        console.log(error, "orderSuccess");
    }

}
async function orderClosing(symbol) {
    try {
        let arrayPromise = []

        const dataQuery = getRowToTable(`tb_order`, `status="PENDING" AND symbol='${symbol}'`)
        const chartQuery = getChartToSymbolAndLimitLastNoClose(symbol, 1, 1)
        const profitQuery = getRowToTable(`tb_config`, `name='profit'`)
        const [data, chart, profit] = await Promise.all([dataQuery, chartQuery, profitQuery])
        const dataChart = chart[0]
        const close = dataChart.close
        const open = dataChart.open
        for (let order of data) {
            if (order.side == 'sell') {
                if (close < open) {
                    // thắng lệnh sell
                    arrayPromise.push(orderSuccess(order, true, profit))
                } else {
                    // thua lệnh sell
                    arrayPromise.push(orderSuccess(order, false, profit))
                }
            } else if (order.side == 'buy') {
                if (close > open) {
                    // thắng lệnh buy
                    arrayPromise.push(orderSuccess(order, true, profit))
                } else {
                    // thua lệnh buy
                    arrayPromise.push(orderSuccess(order, false, profit))
                }
            } else {
                arrayPromise.push(orderSuccess(order, false, profit))
            }
        }
        await Promise.all(arrayPromise)
        // setTimeout(async()=>{
        //     await Promise.all(arrayPromise)
        // },1500)
    } catch (error) {
        console.log(error);
    }
}
async function minusBalanceStr(amount, userid, str) {
    try {

        await updateRowToTable(`tb_user`, `${str}=${str}-${amount}`, `id=${userid}`)
    } catch (error) {
        console.log(error);
    }
}
async function addBalanceStr(amount, userid, str) {
    try {

        await updateRowToTable(`tb_user`, `${str}=${str}+${amount}`, `id=${userid}`)
    } catch (error) {
        console.log(error);
    }
}
async function addPriceChartItem(close, high, low, open, volume, bestAsk, symbol, percentChange) {
    try {
        // const lastChartQuery = getChartOneLimitLast(symbol)
        // const lastChartLastQuery = getChartOneLimitLastLast(symbol)
        // const timeNowQuery = getRowToTable(`tb_config`, `name='time'`)
        // const [lastChart, lastChartLast, timeText] = await Promise.all([lastChartQuery, lastChartLastQuery, timeNowQuery])
        // const timeNow = timeText[0].value
        var close = parseFloat(close)
        var high = parseFloat(high)
        var low = parseFloat(low)
        var open = parseFloat(open)
        var volume = parseFloat(volume)
        var bestAsk = parseFloat(bestAsk)
        // if (lastChart[0].closeBuy == 1 && close <= lastChart[0].open && timeNow > 53) {
        //     close = close + ((lastChart[0].open - close) * 1.5)
        // } else if (lastChart[0].closeSell == 1 && close >= lastChart[0].open && timeNow > 53) {
        //     close = close - ((close - lastChart[0].open) * 1.5)

        // } else if (lastChartLast[0].closeBuy == 1 && close <= lastChart[0].open && timeNow < 8) {

        //     close = close + ((lastChart[0].open - close) * 1.5)
        // } else if (lastChartLast[0].closeSell == 1 && close >= lastChart[0].open && timeNow < 8) {

        //     close = close - ((close - lastChart[0].open) * 1.5)
        // }

        await updateRowToTable(`tb_chart`, `high=${high},low=${low},open=${open},volume=${volume},bestAsk=${bestAsk},percentChange=${percentChange}`, `symbol='${symbol}'`)
    } catch (error) {
        console.log(error, "addPriceChartItem");
    }
}
async function addChartSpotBinance(symbol) {
    try {
        const timeArray = ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"]
        const arrayPromise = []
        for (item of timeArray) {
            const ticks = await binance.candlesticks(symbol, item)
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
                    time: stringToTime(item)
                }
                if (i >= 1) {
                    let [t, o, h, l, closeLast] = ticks[i - 1]
                    obj.open = closeLast
                }
                arrayPromise.push(addRowToTable(`tb_chart_candlestick`, obj))

            }
            // for (last_tick of ticks) {

            // }
            // binance.candlesticks(symbol, item, (error, ticks, symbol) => {
            //     if (error) console.log(error);
            // console.log(item, stringToTime(item));

            //     for (last_tick of ticks) {
            //         let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
            //         const obj = {
            //             symbol,
            //             close,
            //             high,
            //             low,
            //             open,
            //             volume,
            //             timestamp: time / 1000,
            //             closeTimestamp: closeTime / 1000,
            //             time: stringToTime(item)

            //         }
            //         arrayPromise.push(addRowToTable(`tb_chart_candlestick`, obj))
            //     }

            // }, { limit: 1440, endTime: new Date().getTime() });
        }
        await Promise.all(arrayPromise)
    } catch (error) {
        console.log(error, "addChartSpotBinance");
    }

}
async function getFunding(symbol) {

}
async function testChartBinance() {
    // binance.futuresChart( 'BTCUSDT', '1m', (symbol,time,item) =>{
    //     console.log(item);
    // } );
    // console.info( await binance.futuresPrices() );

    // binance.websockets.candlesticks(['BNBUSDT'], "1m", (candlesticks) => {
    //     let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
    //     let { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks;
    //     console.log(candlesticks);

    //     // console.info(symbol+" "+interval+" candlestick update");
    //     // console.info("open: "+open);
    //     // console.info("high: "+high);
    //     // console.info("low: "+low);
    //     // console.info("close: "+close);
    //     // console.info("volume: "+volume);
    //     // console.info("isFinal: "+isFinal);
    //   });
}
module.exports = {
    testChartBinance,
    stringToTime,
    addChartSpotBinance,
    checkBalance: async (amount, userid) => {
        try {
            const wallet = await getRowToTable(`tb_user`, `id=${userid}`)
            // if (wallet.length <= 0) return { status: false, message: "Wallet is not define" }
            if (amount > wallet[0].balance) return { status: false, message: "Insufficient balance" }

            return { status: true }
        } catch (error) {
            return { status: false, message: "error checkBalance" }
        }
    },
    checkBalanceStr: async (amount, userid, str) => {
        try {
            const wallet = await getRowToTable(`tb_user`, `id=${userid}`)
            // if (wallet.length <= 0) return { status: false, message: "Wallet is not define" }
            if (amount > wallet[0][str]) return { status: false, message: "Insufficient balance" }

            return { status: true }
        } catch (error) {
            return { status: false, message: "error checkBalanceStr" }
        }
    },
    checkBalanceDemo: async (amount, userid) => {
        try {
            const wallet = await getRowToTable(`tb_user`, `id=${userid}`)
            // if (wallet.length <= 0) return { status: false, message: "Wallet is not define" }
            if (amount > wallet[0].demoBalance) return { status: false, message: "Insufficient balance" }

            return { status: true }
        } catch (error) {
            return { status: false, message: "error checkBalanceDemo" }
        }
    },
    minusBalance: async (amount, userid) => {
        try {

            await updateRowToTable(`tb_user`, `balance=balance-${amount}`, `id=${userid}`)
        } catch (error) {
            console.log(error);
        }
    },
    minusBalanceStr,
    addBalanceStr,
    getPriceCoin: async function (symbol) {
        var symbol = symbol.toUpperCase()
        // if (symbol == "VND") {
        //     const raito = await customerQuery.getExhange("USD")
        //     const lastPrice = 1 / raito[0].raito
        //     return {
        //         lastPrice
        //     }
        // }
        symbol = symbol.replace('_TRC20', '')
        const price = await getRowToTable(`tb_coin`, `name='${symbol}'`)
        var coin = {}
        if (price.length > 0) {
            if (price[0].flag == 1) {
                coin = {
                    lastPrice: price[0].set_price,
                }
            } else {
                coin = {
                    lastPrice: price[0].price
                }
            }
            if (price[0].type == "TRC20") {
                coin.symbol = `${symbol}_TRC20`
            } else {
                coin.symbol = `${symbol}`
            }
            coin.deposit = price[0].deposit
            return coin
        } else {
            return "Token is not define!"
        }

    },
    priceCoin: async function (message) {
        try {
            var token = await getRowToTable(`tb_coin`)
            var array = []
            for await (addToken of token) {
                array.push(`${addToken.name}BUSD`)
            }



            binance.websockets.prevDay(false, async (error, response) => {
                let arrayPromise = []
                token.forEach(element => {
                    var str = ""
                    if (element.name == "USDT") {
                        str = `BUSDUSDT`
                    }
                    if (`${element.name}USDT` == response.symbol || response.symbol == str) {
                        arrayPromise.push(updateRowToTable(`tb_coin`, `percent=${response.percentChange},volume=${response.volume}`, `name='${element.name}'`))

                    }
                });
                await Promise.all(arrayPromise)
            });
            // binance.websockets.prevDay(false, async (error, response) => {
            //     let arrayPromise = []
            //     token.forEach(element => {
            //         var str = ""
            //         if (element.name == "USDT") {
            //             str = `BUSDUSDT`
            //         }
            //         if (`${element.name}USDT` == response.symbol || response.symbol == str) {
            //             // price=${price},percent=${percent},volume=${volume} WHERE name="${symbol}"
            //             arrayPromise.push(updateRowToTable(`tb_coin`, `price=${response.bestAsk},percent=${response.percentChange},volume=${response.volume}`, `name='${element.name}'`))

            //         }
            //     });
            //     await Promise.all(arrayPromise)
            // });
        } catch (error) {
            console.log(error);
        }
    },
    addPriceChart: async function (message) {
        try {
            var token = await getRowToTable(`tb_chart`)
            var array = []
            for (addToken of token) {
                array.push(addToken)
            }
            array.forEach(element => {
                let arrayPromisez = []
                binance.futuresMiniTickerStream(`${element.symbol}`, async (item) => {
                    try {
                        const arrayPromise = []
                        const chartItem = await getRowToTable(`tb_chart`,`symbol='${element.symbol}'`)
                        // if(element.symbol=="BTCUSDT") console.log(item);
                        item.close = parseFloat(item.close) + (parseFloat(item.close) /100 * chartItem[0].percent)
                        arrayPromise.push(updatePrice(element.symbol, `tb_buy_binance`, item))
                        arrayPromise.push(updatePrice(element.symbol, `tb_sell_binance`, item))
                        arrayPromise.push(updateRowToTable(`tb_chart`, `close=${item.close},open=${item.open},high=${item.high},low=${item.low}`, `symbol='${element.symbol}'`))

                        arrayPromise.push(checkFuturePosition(item, element.symbol))
                        await Promise.all(arrayPromise)

                    } catch (error) {
                        console.log(error);
                    }
                });
            })
            binance.websockets.prevDay(false, async (error, response) => {

                let arrayPromise = []
                array.forEach(element => {

                    if (element == response.symbol) {

                        const { close, high, low, open, volume, bestAsk, percentChange } = response
                        arrayPromise.push(addPriceChartItem(close, high, low, open, volume, bestAsk, element, percentChange))
                    }
                });


                await Promise.all(arrayPromise)
            });
        } catch (error) {
            console.log(error);
        }
    },
    chartSpot: async function () {
        try {
            var token = await getRowToTable(`tb_chart`)
            var array = []
            let arrayPromise = []

            for (response of token) {

                let { close, high, low, open, volume, bestAsk, symbol } = response
                const timestamp = getTimeFristSecond(new Date())

                let obj = { close: close, high: bestAsk, low: bestAsk, open: open, volume, symbol, timestamp: timestamp }
                const lastChart = await getChartOneLimitLast(symbol)
                const lastChartLast = await getChartOneLimitLastLast(symbol) /// check chart truoc co set lenh hay khong
                // const time = await getRowToTable(`tb_config`, `name='time'`)
                const timeArray = ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"]
                for (let itemTime of timeArray) {
                    let numberTime = stringToTime(itemTime)
                    const lastChartToTime = await getChartOneLimitLastToTime(symbol, numberTime)

                    const nowTime = timestamp


                    // if (nowTime > lastChartToTime[0].closeTimestamp) {
                    if (nowTime) {
                        if (lastChart.length > 0) {
                            obj.open = lastChart[0].close
                        }
                        obj.order = 1
                        obj.time = numberTime
                        obj.closeTimestamp = Math.floor((obj.timestamp + numberTime))
                        if (numberTime == 60) {

                        }
                        arrayPromise.push(addRowToTable(`tb_chart_candlestick`, obj))
                    } else {
                        /// cập nhật high và điều kiện
                        if (lastChart[0].high < close) {
                            arrayPromise.push(updateRowToTable(`tb_chart_candlestick`, `high=${close}`, `id=${lastChart[0].id}`))
                        }
                        /// cập nhật low và điều kiện
                        if (lastChart[0].low > close) arrayPromise.push(updateRowToTable(`tb_chart_candlestick`, `low=${close}`, `id=${lastChart[0].id}`))
                        arrayPromise.push(updateRowToTable(`tb_chart_candlestick`, `close=${close}`, `id=${lastChartToTime[0].id}`))
                    }
                }
                // if (lastChart.length <= 0) {


                // } else if (lastChart.length > 0) {
                //     if (lastChart[0].closeCandlestick == 0) {
                //         if (timeNow == 30 || timeNow == 60) {
                //             if (lastChart[0].order == 0) {
                //                 /// chốt các lệnh đang pending
                //                 await orderClosing(symbol)
                //             }
                //             /// đóng nến
                //             await updateRowToTable(`tb_chart_candlestick`, `closeCandlestick=1`, `id=${lastChart[0].id}`)
                //         }
                //         // else if (lastChartLast[0].closeBuy != 0 || lastChartLast[0].closeSell != 0) {
                //         //     let strString = lastChartLast[0].closeBuy == 1 ? `-` : `+`

                //         // }
                //         else {
                //             /// cập nhật high và điều kiện
                //             if (lastChart[0].high < close) {
                //                 arrayPromise.push(updateRowToTable(`tb_chart_candlestick`, `high=${close}`, `id=${lastChart[0].id}`))
                //             }
                //             /// cập nhật low và điều kiện
                //             if (lastChart[0].low > close) arrayPromise.push(updateRowToTable(`tb_chart_candlestick`, `low=${close}`, `id=${lastChart[0].id}`))

                //             // const seconds = ((lastChart[0].timestamp + 30) * 1000 - nowTime) / 1000


                //             //// RAMDOM CHART
                //             // if (lastChart[0].closeBuy == 0 && lastChart[0].closeSell == 0 && lastChart[0].order == 0 && timeNow > 53) {
                //             //     const ramdomChart = await getRowToTable(`tb_ramdom_chart`, `symbol='${symbol}'`)
                //             //     if (ramdomChart.length > 0) {
                //             //         if (ramdomChart[0].type == 1) {
                //             //             lastChart[0].closeBuy = 1
                //             //         } else {
                //             //             lastChart[0].closeSell = 1
                //             //         }
                //             //     }
                //             // }
                //             //// END RAMDOM
                //             /// auto chart 
                //             // const autoChart = await getRowToTable(`tb_config`, `name='autoChart'`)
                //             // if (autoChart[0].value == 1 && lastChart[0].order == 0) {
                //             //     console.log(lastChartOrder[0].orderBuy);
                //             //     if (lastChartOrder[0].orderBuy > lastChartOrder[0].orderSell && close >= lastChart[0].open && timeNow > 53 && lastChart[0].closeSell != 1 && lastChart[0].closeBuy != 1) {
                //             //         close = close - ((close - lastChart[0].open) * 1.5)
                //             //         console.log("set sell losssssssssssssssssssssssssssss");
                //             //     } else if (lastChartOrder[0].orderBuy < lastChartOrder[0].orderSell && close <= lastChart[0].open && timeNow > 53 && lastChart[0].closeBuy != 1 && lastChart[0].closeSell != 1) {
                //             //         console.log("set buy losssssssssssssssssssssss")
                //             //         close = close + ((lastChart[0].open - close) * 1.5)

                //             //     }
                //             // }
                //             /// end auto chart

                //             // Xet thắng thua trên admin
                //             // if (lastChart[0].closeBuy == 1 && close <= lastChart[0].open && timeNow > 53) {
                //             //     /// xét lệnh buy
                //             //     // console.log("thắng");
                //             //     close = close + ((lastChart[0].open - close) * 1.5)
                //             // } else if (lastChart[0].closeSell == 1 && close >= lastChart[0].open && timeNow > 53) {
                //             //     // console.log("thua");
                //             //     /// xét lệnh sell
                //             //     close = close - ((close - lastChart[0].open) * 1.5)
                //             // } else if (lastChartLast[0].closeBuy == 1 && close <= lastChart[0].open && timeNow < 8) {
                //             //     close = close + ((lastChart[0].open - close) * 1.5)
                //             // } else if (lastChartLast[0].closeSell == 1 && close >= lastChart[0].open && timeNow < 8) {
                //             //     close = close - ((close - lastChart[0].open) * 1.5)
                //             // }
                //             arrayPromise.push(updateRowToTable(`tb_chart_candlestick`, `close=${close},buyer=buyer+${buyer},seller=seller+${seller}`, `id=${lastChart[0].id}`))

                //         }
                //     } else {
                //         /// cập nhật open
                //         if (lastChart.length > 0) {
                //             // obj.open = lastChart[0].close
                //             obj.order = timeNow <= 30 ? 1 : 0
                //             obj.orderAuto = timeNow <= 30 ? 1 : 0
                //             obj.open = lastChart[0].close
                //             if (lastChart[0].closeBuy == 1 && close <= obj.open) {
                //                 obj.close = lastChart[0].close + ((obj.open - close) * 1.5)
                //             } else if (lastChart[0].closeSell == 1 && close >= obj.open) {
                //                 obj.close = lastChart[0].close - ((close - obj.open) * 1.5)
                //             }

                //             obj.high = obj.open
                //             obj.low = obj.open
                //         }
                //         obj.closeCandlestick = 0
                //         //// DELETE RAMDOM CHART
                //         if (obj.order == 1) {
                //             const ramdomChart = await getRowToTable(`tb_ramdom_chart`, `symbol='${symbol}'`)
                //             if (ramdomChart.length > 0) {
                //                 arrayPromise.push(deleteRowToTable(`tb_ramdom_chart`, `id=${ramdomChart[0].id}`))
                //             }
                //         }
                //         ////DELETE END RAMDOM
                //         arrayPromise.push(addRowToTable(`tb_chart_candlestick`, obj))
                //     }

                //     // closeCandlestick
                // }

            }
            await Promise.all(arrayPromise)

            // binance.websockets.prevDay(false, async (error, response) => {

            // });
        } catch (error) {
            console.log(error);
        }
    },
    getChartBORealTime: async function (symbol, time) {
        try {
            const data = await getChartOneLimitLastToTime(symbol, time)
            if (data.length > 0) {
                return data[0]
            }
        } catch (error) {
            console.log(error);
        }
    },
    updateHistoryBalance,
    updateStatusBalance,
    ramdomNumber,
    timeToString
}