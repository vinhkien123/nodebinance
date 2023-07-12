const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
require('dotenv').config()
const cron = require('node-cron');
const port = process.env.PORT || 4000
const client = require('./database/redis');
const data = require('./database/database')
const Web3 = require('web3');
const DogeHero = require('./contracts/DogeHero.json')
const DogeHeroProxy = require('./contracts/DogeHeroProxy.json')
app.use(function (req, res, next) {
  req.io = io;
  next();
});
const Binance = require('node-binance-api');
const binance = new Binance({
  APIKEY: '<key>',
  APISECRET: '<secret>'
});
const router = require('express').Router()
var path = require('path');
const socketModule = require('./sockets/socket');
// const data = require('./database/database')
const apiRouter = require('./api/index');
const cors = require('cors');
const { priceCoin, chartBO, addPriceChart, getChartBORealTime, testChartBinance, addChartSpotBinance, chartSpot, stringToTime } = require('./commons/crypto');
const { getRowToTable, updateRowToTable, addRowToTable, addRowToTableBalance, addRowToTableBalanceDemo, getChartToDelete, deleteRowToTable } = require('./queries/customerQuery');
const user = require('./controller/user');
const { refeshLevelFunc, refeshCommissionFunc, refeshTotalOrder } = require('./commons/binaryOption');
const { ramdomNumber } = require('./commons');
const { getEventContract } = require('./listenBlockchain/listen');
const { getListLimitPage } = require('./commons/request');
var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json());
// ?folder=female
app.get('/images/:images', function (req, res) {

  res.sendFile(path.join(__dirname, '../images/', `${req.params.images}`));
});

app.use('/api', apiRouter);
//////////////////////
app.use(express.static(path.join(__dirname, 'public/build')))
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/build', 'index.html'));
});
///////////
// app.use(express.static(path.join(__dirname, 'public/build1')))
// app.get('/*', function (req, res) {
//   res.sendFile(path.join(__dirname, 'public/build', 'index.html'));
// });
// app.get('/admin/*', function (req, res) {
//   res.sendFile(path.join(__dirname, 'public/build1', 'index.html'));
// });
async function emitBuySell(chart) {
  try {
    const arrayPromise = []
    const listBuy = getListLimitPage(`tb_buy_binance`, 7, 1, `symbol='${chart.symbol}'`)
    const listSell = getListLimitPage(`tb_sell_binance`, 7, 1, `symbol='${chart.symbol}'`)
    arrayPromise.push(listBuy, listSell)
    const [buy, sell] = await Promise.all(arrayPromise)
    io.local.emit(`${chart.symbol}BUY`, buy)
    io.local.emit(`${chart.symbol}SELL`, sell)

  } catch (error) {
    console.log(error);
  }
}
async function emitSocketBuySell() {
  const listChart = await getRowToTable(`tb_chart`)
  const arrayPromise = []
  for (let chart of listChart) {
    arrayPromise.push(emitBuySell(chart))
  }
  await Promise.all(arrayPromise)
}


function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
async function addUserMarketingPool() {
  const userMarketing = await getRowToTable(`tb_user`, `marketing=1`)
  if (userMarketing.length > 0) {
    let numberLength = ramdomNumber(0, userMarketing.length)
    const user = userMarketing[numberLength]
    const str = ramdomNumber(0, 1)
    await updateRowToTable(`tb_config`, `value=${user.id}`, `name='idPeopleMega'`)
    const prizePool = await getRowToTable(`tb_config`, `name='POOL'`)
    const prizePoolValue = prizePool[0].value
    const obj = {
      userName: user.userName,
      amount: parseFloat(prizePoolValue * 0.001),
      email: user.email,
      streak: str == 0 ? 'win' : "lose",
      type: 0,
      userid: user.id
    }
    await addRowToTable(`tb_streak`, obj)
  }

  // const objNotification = {
  //   title : `Streak Challenge Result Summary`,
  //   detail : `There are ${peoplePool[0].value + 1}`
  // }
  // await addRowToTable(`tb_notification`,)
}
async function addNotificationMegaPool() {
  try {
    const idMarketTingQuery = await getRowToTable(`tb_config`, `name='idPeopleMega'`)
    const peopleQuery = await getRowToTable(`tb_config`, `name='peoplePool'`)
    const megaPoolQuery = await getRowToTable(`tb_config`, `name='MEGAPRIZES'`)
    const peoplePool = peopleQuery[0].value
    const useridMarketing = idMarketTingQuery[0].value
    const user = await getRowToTable(`tb_user`, `id=${useridMarketing}`)
    const prizePool = await getRowToTable(`tb_config`, `name='POOL'`)
    const prizePoolValue = prizePool[0].value
    if (user.length > 0) {
      const lengthRamdom = ramdomNumber(0, user.length)
      const listUser = await getRowToTable(`tb_user`, `id!=1`)
      const arrayPromise = []
      for (let userL of listUser) {

        const obj = {
          title: `Streak Challenge Result Summary`,
          detail: `There are ${peoplePool} users who hit the Jackpot of total ${peoplePool * (prizePoolValue * 0.01)} and ${user[lengthRamdom].userName} account who won the Mega prize of total ${megaPoolQuery[0].value} yesterday.`,
          peoplePool,
          totalPool: peoplePool * (prizePoolValue * 0.001),
          userNamePool: user[lengthRamdom].userName,
          megaPool: megaPoolQuery[0].value,
          type: 14,
          userid: userL.id,
          email: userL.email,
          userName: userL.email
        }
        arrayPromise.push(addRowToTable(`tb_notification`, obj))

      }

      arrayPromise.push(updateRowToTable(`tb_config`, `value=${megaPoolQuery[0].value}`, `name='megaPoolAfter'`))
      arrayPromise.push(updateRowToTable(`tb_config`, `data='${user[lengthRamdom].userName}'`, `name='userNameMegaPool'`))
      arrayPromise.push(updateRowToTable(`tb_user`, `balance=balance+${megaPoolQuery[0].value}`, `id=${user[lengthRamdom].id}`))
      await Promise.all(arrayPromise)
    }
  } catch (error) {
    console.log(error, "notification");
  }
}
async function addUserPoolToNumber() {

  const prizePool = await getRowToTable(`tb_config`, `name='POOL'`)
  const prizePoolValue = prizePool[0].value
  const arrayPromise = []
  const lengthArray = ramdomNumber(60, 100)
  await updateRowToTable(`tb_config`, `value=${lengthArray}`, `name='peoplePool'`)
  let numberMarketing = ramdomNumber(0, lengthArray)
  for (let i = 0; i < lengthArray; i++) {
    if (i == numberMarketing) {
      arrayPromise.push(addUserMarketingPool())
    } else {
      const str = ramdomNumber(0, 2)
      const userName = makeid(ramdomNumber(6, 8))
      const obj = {
        userName,
        amount: parseFloat(prizePoolValue * 0.001),
        email: `${userName}@gmail.com`,
        streak: str == 0 ? 'win' : "lose",
        type: 0,
        userid: 999999999
      }
      arrayPromise.push(addRowToTable(`tb_streak`, obj))
    }

  }
  arrayPromise.push(addUserMarketingPool())
  await Promise.all(arrayPromise)
}
init = async function () {

  try {
    socketModule.socket(io);
    server.listen(port);
    await client.connect();
    // await chartFutureData()
    // testChartBinance()
    // priceCoin()
    // await addChartSpotBinance("BTCUSDT") 
    addPriceChart()

    console.log(`running on port: ${port}`);
    // await addUserMarketingPool()
    // await addNotificationMegaPool()
    // await refeshTotalOrder()
    // await refeshLevelFunc()
    // const listUser = await getRowToTable(`tb_user`)
    // for await (let user of listUser) {
    //   user.balance = user.balance.toFixed(2)
    //   await addRowToTableBalance(user.id, user.userName, user.email, user.balance, user.balance)
    //   await addRowToTableBalanceDemo(user.id, user.userName, user.email, user.demoBalance, user.demoBalance)
    // }
    // await refeshCommissionFunc()
    // await addUserPoolToNumber()
    // await addNotificationMegaPool()
    cron.schedule('0 0 * * *',
      async () => {
        try {
          let arrayPromise = []
          const listUser = await getRowToTable(`tb_user`)
          for (let user of listUser) {
            user.balance = user.balance.toFixed(2)
            arrayPromise.push(addRowToTableBalance(user.id, user.userName, user.email, user.balance, user.balance))
            arrayPromise.push(addRowToTableBalanceDemo(user.id, user.userName, user.email, user.demoBalance, user.demoBalance))
          }
          ///// refedht lever  //// 
          if (new Date().getDay() == 0) {
            arrayPromise.push(refeshLevelFunc())
          }

          ////// resart totalOrder 
          // arrayPromise.push(updateRowToTable)
          arrayPromise.push(refeshTotalOrder())
          arrayPromise.push(refeshCommissionFunc())
          // arrayPromise.push(addNotificationMegaPool())
          await Promise.all(arrayPromise)
          const chartss = await getChartToDelete(1, 1)
          await deleteRowToTable(`tb_chart_candlestick`, `id<${chartss[0].id - 1000}`)
          ////////////////////////////////////////////
          const amountRamdom = ramdomNumber(20000, 25000)
          await updateRowToTable(`tb_config`, `value=${amountRamdom}`, `name='POOL'`)
          const amountRamdomPrizes = ramdomNumber(3000, 5000)
          const amountNumberFloat = ramdomNumber(1, 99)
          await updateRowToTable(`tb_config`, `value=${amountRamdomPrizes + (amountNumberFloat / 100)}`, `name='MEGAPRIZES'`)
        } catch (error) {

          console.log(error, "dailyStaking");
        }
      });
    // const listCoin = await getRowToTable(`tb_chart`)
    cron.schedule("* * * * * *", async function () {
      const listCoin = await getRowToTable(`tb_chart`)
      io.local.emit(`listCoin`, listCoin)
      await emitSocketBuySell()

    })
  
    // cron.schedule("*/30 * * * * *", async function () {
    //   try {
    //     console.log("ok");
    //     await getEventContract()

    //   } catch (error) {
    //     console.log(error, "getPastEvent");
    //   }
    // });
    // cron.schedule("* * * * * *", async function () {

    // });

  } catch (error) {
    console.log(error, "init")
  }

}

init();