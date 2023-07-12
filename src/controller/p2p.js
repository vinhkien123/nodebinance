const { messageTelegram, validationBody } = require("../commons");
const { getPriceCoin } = require("../commons/crypto");
const remitanoQuery = require("../queries/remitanoQuery");
const { flagAmountToSymBol, updateBalanceWalletOrUser } = require("../sockets/functions");


module.exports = {
    /// tạo quảng cáo, không được chênh lẹch giá 5% với giá thị trường
    addSellP2P: async function (req, res, next) {
        try {
            var {
                symbol,
                amountExchange,
                amountCoin,
                amountMaximum,
                typeExchange
            } = req.body
            const flag = validationBody({
                symbol,
                amountExchange,
                amountCoin,
                amountMaximum,
                typeExchange
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const phone = req.user
            const profileUser = await remitanoQuery.getUserToId(phone)
            if (profileUser.length > 0) {
                const coin = await getPriceCoin(symbol);
                if (coin.lastPrice) {

                    var priceX = coin.lastPrice
                    var priceDifference = parseFloat(priceX) / 100 * 5
                    var priceStart = parseFloat(priceX) - parseFloat(priceDifference)
                    var priceEnd = parseFloat(priceX) + parseFloat(priceDifference)

                    //console.log(parseFloat(priceStart), parseFloat(priceEnd));

                    if (priceStart <= parseFloat(amountExchange) && priceEnd >= parseFloat(amountExchange)) {
                        if (parseFloat(amountCoin) > 0 && parseFloat(amountMaximum) > 0) {
                            if (parseFloat(amountCoin) <= parseFloat(amountMaximum)) {
                                var vndToUSD = await remitanoQuery.getVNDTOUSD()

                                const tbcoin = await remitanoQuery.getTokenToName(symbol)

                                var symbolWallet = await convertSymbolGetWallet(symbol)

                                var walletUser = await remitanoQuery.getWalletToIdUser(phone, symbolWallet)
                                const flag = await flagAmountToSymBol(phone, symbol, amountMaximum)
                                if (flag) {
                                    const obj = await getWallet(phone)
                                    await updateBalanceWalletOrUser(phone, symbol, amountMaximum)
                                    const id = crypto.randomBytes(6).toString("hex");
                                    var array = []
                                    var stringArray = JSON.stringify(array)
                                    var percent = await remitanoQuery.getBUYSELLP2P()

                                    // await remitanoQuery.addBalanceLog(phone, `-${amountMaximum}`, obj[`${symbol.toLowerCase()}_balance`], parseFloat(obj[`${symbol.toLowerCase()}_balance`]) - parseFloat(amountMaximum), "P2P", `${symbol}_balance`, `Create an advertisement to sell ${symbol}`)
                                    await remitanoQuery.addSellP2P(id, phone, amountCoin, priceX, priceX * vndToUSD[0].raito, symbol, profileUser[0].username, typeExchange, amountMaximum, stringArray, stringArray, amountExchange, percent[0].raito, vndToUSD[0].raito)
                                    // await remitanoQuery.addNotification(phone, profileUser[0].username, "P2P", `Post a successful sale`)
                                    await messageTelegram(`===========================`)
                                    await messageTelegram(`[P2P]: ${profileUser[0].username} Post a successful sale`)
                                    await messageTelegram(`===========================`)
                                    success(res, "Create successful sell ads !")
                                } else {
                                    error_400(res, `${symbol} balance is not enough`, 9)
                                }
                            } else {
                                error_400(res, "The number of coins sold cannot be less than the maximum number of coins! ", 8)
                            }
                        } else {
                            error_400(res, "Invalid amount ! ", 7)
                        }
                    } else {
                        error_400(res, "Price must not differ by more than 5 % of the market !", 2)
                    }
                } else {
                    error_400(res, "Invalid coin ! ", 5)
                }


            } else {
                error_400(res, "User has not enabled 2Fa feature ! ", 3)

            }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    addBuyP2P: async function (req, res, next) {

        try {

            const {
                symbol,
                amountExchange,
                amountCoin,
                amountMaximum,
                typeExchange

            } = req.body
            const flag = validationBody({
                symbol,
                amountExchange,
                amountCoin,
                amountMaximum,
                typeExchange
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const phone = req.user
            const profileUser = await remitanoQuery.getUserToId(phone)
            if (profileUser.length > 0) {
                const tbcoin = await getPriceCoin(symbol)
                    if (tbcoin.lastPrice) {
                        var priceX = tbcoin.lastPrice

                        var priceDifference = parseFloat(priceX) / 100 * 5
                        var priceStart = parseFloat(priceX) - parseFloat(priceDifference)
                        var priceEnd = parseFloat(priceX) + parseFloat(priceDifference)
                        if (priceStart <= parseFloat(amountExchange) && priceEnd >= parseFloat(amountExchange)) {
                            if (parseFloat(amountCoin) > 0 && parseFloat(amountMaximum) > 0) {
                                if (parseFloat(amountCoin) <= parseFloat(amountMaximum)) {
                                    var vndToUSD = await remitanoQuery.getVNDTOUSD()
                                    var balance = false
                                    var symbolWallet = await convertSymbolGetWallet(symbol)
                                    const walletUser = await remitanoQuery.getWalletToIdUser(phone, symbolWallet)
                                    const walletVND = await remitanoQuery.getWalletToIdUser(phone, "VND")

                                    let priceMaximumCoinToVND = amountMaximum * (priceX * vndToUSD[0].raito)
                                    if (priceMaximumCoinToVND <= walletVND[0].amount) {
                                        var amountUser = walletVND[0].amount - priceMaximumCoinToVND

                                        await remitanoQuery.updateBalance(phone, amountUser, "VND")
                                        const id = crypto.randomBytes(6).toString("hex");
                                        var array = []
                                        var stringArray = JSON.stringify(array)
                                        var percent = await remitanoQuery.getBUYSELLP2P()
                                        await remitanoQuery.addBalanceLog(phone, `-${priceMaximumCoinToVND}`, walletVND[0].amount, parseFloat(walletVND[0].amount) - parseFloat(priceMaximumCoinToVND), "P2P", "vnd_balance", `Create an advertisement to sell ${symbol}`)
                                        await remitanoQuery.addBuyP2P(id, phone, amountCoin, priceX, priceX * vndToUSD[0].raito, symbol, profileUser[0].username, typeExchange, amountMaximum, stringArray, stringArray, amountExchange, percent[0].raito, vndToUSD[0].raito)
                                        await remitanoQuery.addNotification(phone, profileUser[0].username, "P2P", `Post successful purchase`)
                                        await messageTelegram(`===========================`)
                                        await messageTelegram(`[P2P]: ${profileUser[0].username} Post successful purchase`)
                                        await messageTelegram(`===========================`)
                                        success(res, "Create successful buy ads !")
                                    } else {
                                        error_400(res, `Vietnam dong balance is not enough`, 9)
                                    }
                                } else {
                                    error_400(res, "The number of coins sold cannot be less than the maximum number of coins! ", 8)
                                }
                            } else {
                                error_400(res, "Invalid amount ! ", 7)
                            }
                        } else {
                            error_400(res, "Price must not differ by more than 5 % of the market !", 2)
                        }
                    } else {
                        error_400(res, "Invalid coin ! ", 5)
                    }


            } else {
                error_400(res, "User has not enabled 2Fa feature ! ", 3)

            }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    }
}