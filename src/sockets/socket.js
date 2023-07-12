const { path } = require('./configs/config');
const socketPasser = require('./socketPasser');
global.arrayUser = [];
const Binance = require('node-binance-api');
const { getRowToTable } = require('../queries/customerQuery');
const { chartBO, getChartBORealTime, stringToTime } = require('../commons/crypto');
const cron = require('node-cron');
const { existsRedis, getRedis, incrbyRedis, setnxRedis } = require('../model/model.redis');
const binance = new Binance({
    APIKEY: '<key>',
    APISECRET: '<secret>'
});
async function chartFutureData(socket, io) {
    try {
        socket.on(`chartFuture`, async (res) => {
            await emitChartFuture(res.symbol, res.time, io)
        })
        // const allSymbol = await getRowToTable(`tb_chart`)
        // let arrayPromise = []
        // for (element of allSymbol) {
        //     const timeArray = ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"]
        //     for (let itemTime of timeArray) {
        //         let numberTime = stringToTime(itemTime)


        //     }
        // }
    } catch (error) {
        console.log(error, 'chartFutureData');
    }
}
async function emitChartBO(socket, symbol) {
    try {
        const data = await getChartBORealTime(symbol)
        socket.emit(`${symbol}`, data)
    } catch (error) {
        console.log(error);
    }
}
let online = []
let symbolServer = {}
async function emitChartFuture(symbol, time, io) {
    try {
        symbolServer[`${symbol}${time}`] = 1
        // const data = await getChartBORealTime(symbol, time)
        // const dataFuture = await getRowToTable(`tb_chart`)
        const keyName = `${symbol}${time}`
        const getKey = await existsRedis(keyName)
        if (!getKey) {
            await setnxRedis(keyName, 0)
        }
        let flagSymbolFutute = await getRedis(keyName)
        flagSymbolFutute = await incrbyRedis(keyName, 1)
        if (flagSymbolFutute <= 1) {
            binance.futuresChart(symbol, time, (symbol, stringTime, item) => {
                io.local.emit(`${symbol}${time}`, item)
            });
        }
    } catch (error) {
        console.log(error);
    }
}
socket = function (io) {

    //Listening for connection client.
    io.on('connection', function (socketIo) {
        // socketIo.on("joinRoom", (idRoom) => {
        //     socketIo.join(`${idRoom}`)
        // })
        /// checkOnline 
        let flag = true
        online.forEach((user) => {
            if (user == socketIo.id) {
                flag = false
            }
        })
        if (flag) online.push(socketIo.id)
        io.local.emit('checkOnline', online.length)
        socketIo.on("joinUser", (userid) => {
            socketIo.join(userid)
        })
        chartFutureData(socketIo, io)
        // const intervalTime = setInterval(async function () {
        //     const time = await getRowToTable(`tb_config`, `name='time'`)
        //     if (time.length > 0) {
        //         socketIo.emit('TIME', time[0].value)
        //     }
        // }, 1000)



        // socketIo.on(path.SER_PAT, function (req) {
        //     socketPasser(req, socketIo, io);
        // });
        // const interval = setInterval(async () => {
        //     try {
        //         const allSymbol = await getRowToTable(`tb_chart`)
        //         let arrayPromise = []
        //         for (element of allSymbol) {
        //             arrayPromise.push(emitChartBO(socketIo, element.symbol))
        //         }
        //         await Promise.all(arrayPromise)
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }, 1000)
        socketIo.on("disconnect", () => {
            // clearInterval(interval);
            if (!socketIo.id) return;
            let updateOnline = online.filter(item => item != socketIo.id)
            online = updateOnline
            io.local.emit('checkOnline', online.length)
        });
        // binance.websockets.prevDay([`BTCUSDT`,`BNBUSDT`], (error, response) => {
        //     console.log(response);
        //     // socketIo.emit('priceBNB',response.bestAsk)
        // });
        // console.log("123123");

    });
}

module.exports.socket = socket
