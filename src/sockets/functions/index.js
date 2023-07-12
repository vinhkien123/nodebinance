const remitanoQuery = require("../../queries/remitanoQuery")

async function updateBalanceWalletOrUser(idUser, symbol, amount) {
    var amount = parseFloat(amount)
    const user = await remitanoQuery.getUserToId(idUser)
    const wallet = await remitanoQuery.getWalletToIdUser(idUser, symbol)

    var symbolUser = symbol
    if (symbol.toLowerCase() == "bos") {
        symbolUser = "bos"
    } else if (symbol.toLowerCase() == "win") {
        symbolUser = "win"
    }
    var flag = array.filter(e => e == symbolUser.toLowerCase())
    console.log(flag.length)
    if (flag.length > 0) {
        if (symbol.toLowerCase() == "bos") {
            symbolUser = "coin"
        } else if (symbol.toLowerCase() == "win") {
            symbolUser = "win_trc20"
        }

        const value = user[0][`${symbolUser.toLowerCase()}_balance`] - amount
        const result = await remitanoQuery.updateBalanceUsers(idUser, value, `${symbolUser.toLowerCase()}_balance`)
    } else {
        console.log(symbol);
        const value = wallet[0][`amount`] - amount
        const result = await remitanoQuery.updateBalance(idUser, value, `${symbol}`)
    }
}
async function updateBalanceWalletOrUserBonus(idUser, symbol, amount) {

    const user = await remitanoQuery.getUserToId(idUser)
    const wallet = await remitanoQuery.getWalletToIdUser(idUser, symbol)
    var amount = parseFloat(amount)
    var symbolUser = symbol
    if (symbol.toLowerCase() == "bos") {
        symbolUser = "bos"
    } else if (symbol.toLowerCase() == "win") {
        symbolUser = "win"
    }
    var flag = array.filter(e => e == symbolUser.toLowerCase())
    console.log(flag.length)
    if (flag.length > 0) {
        if (symbol.toLowerCase() == "bos") {
            symbolUser = "coin"
        } else if (symbol.toLowerCase() == "win") {
            symbolUser = "win_trc20"
        }
        const value = user[0][`${symbolUser.toLowerCase()}_balance`] + amount
        const result = await remitanoQuery.updateBalanceUsers(idUser, value, `${symbolUser.toLowerCase()}_balance`)
    } else {
        const value = wallet[0][`amount`] + amount
        const result = await remitanoQuery.updateBalance(idUser, value, `${symbol}`)
    }
}
var array = ["btc", "eth", "usdt", "usd", "trx", "bos", "win"]
module.exports = {
    flagSymbolFunc: async (symbol) => {
        const getTrc20 = await remitanoQuery.getTrc20()
        var flag = true
        getTrc20.forEach(e => {
            if (`${e.symbol.toLowerCase()}_trc20` == symbol.toLowerCase()) {
                flag = false
            }
        })
        
        return flag
    },
    dataSymbol: async (symbol) => {
        var flagSymbolForm = symbol
        if (symbol == "BOS_TRC20") {
            flagSymbolForm = "bos"
        } else if (symbol == "BPAY_TRC20") {
            flagSymbolForm = "bpay_trc20"
        } else if (symbol == "USDT.TRC20") {
            flagSymbolForm = "usdt"
        }
        return flagSymbolForm
    },
    updateBalanceWalletOrUser: async (idUser, symbol, amount) => {
        var amount = parseFloat(amount)
        const user = await remitanoQuery.getUserToId(idUser)
        const wallet = await remitanoQuery.getWalletToIdUser(idUser, symbol)

        var symbolUser = symbol
        if (symbol.toLowerCase() == "bos") {
            symbolUser = "bos"
        } else if (symbol.toLowerCase() == "win") {
            symbolUser = "win"
        }
        var flag = array.filter(e => e == symbolUser.toLowerCase())
        console.log(flag.length)
        if (flag.length > 0) {
            if (symbol.toLowerCase() == "bos") {
                symbolUser = "coin"
            } else if (symbol.toLowerCase() == "win") {
                symbolUser = "win_trc20"
            }

            const value = user[0][`${symbolUser.toLowerCase()}_balance`] - amount
            const result = await remitanoQuery.updateBalanceUsers(idUser, value, `${symbolUser.toLowerCase()}_balance`)
        } else {
            console.log(symbol);
            const value = wallet[0][`amount`] - amount
            const result = await remitanoQuery.updateBalance(idUser, value, `${symbol}`)
        }
    },
    covenrtInternalCoin: async (idUser, amountForm, lastPriceForm, lastPriceTo, percent, symbolForm, symbolTo) => {
        const user = await remitanoQuery.getUserToId(idUser)
        let UsdtToAmountForm = amountForm * lastPriceForm
        let amountTo = UsdtToAmountForm / lastPriceTo
        var amountPercent = amountTo * percent
        var amountPriceTo = amountTo - amountPercent
        console.log(amountPriceTo, "price to to to to to");
        await updateBalanceWalletOrUser(idUser, symbolForm, amountForm)
        await updateBalanceWalletOrUserBonus(idUser, symbolTo, amountPriceTo)
        await remitanoQuery.addConvenrtCoin(idUser, amountForm, symbolForm, amountPriceTo, symbolTo, lastPriceTo)
        await remitanoQuery.addNotification(idUser, user[0].username, "Swap", `Successful coin conversion from ${amountForm} ${symbolForm} to ${amountPriceTo} ${symbolTo}`)

    },
    symbolConvenrtTrc20: async (symbol) => {
        var tokenTrc20 = await remitanoQuery.getTrc20()
        var flag = true
        var data = symbol
        tokenTrc20.forEach((element) => {
            if (symbol == element) {
                flag = false
            }
        })
        if (!flag) {
            data = `${symbol}_TRC20`
        }
        return data
    },
    convertSymbol: async (symbolForm, symbolTo, idUser) => {
        let obj = {}
        let flag = false
        console.log("ok", symbolForm, symbolTo);
        if (symbolForm == "BOS_TRC20") {
            if (symbolTo == "BPAY_TRC20") {
                const pricez = await remitanoQuery.getExhange("BOS")
                obj.symbolForm = "bos"
                obj.lastPriceForm = pricez[0].raito
                const pricezz = await remitanoQuery.getExhange("BPAY")
                obj.symbolTo = "BPAY_TRC20"
                obj.lastPriceTo = pricezz[0].raito
                flag = true
            } else {
                const pricez = await remitanoQuery.getExhange("BOS")
                obj.symbolForm = "bos"
                obj.lastPriceForm = pricez[0].raito
                flag = true
            }
        } else if (symbolForm == "BPAY_TRC20") {
            console.log("xzxzx1");
            if (symbolTo == "BOS_TRC20") {
                const pricez = await remitanoQuery.getExhange("BPAY")
                obj.symbolForm = "BPAY_TRC20"
                obj.lastPriceForm = pricez[0].raito
                const pricezz = await remitanoQuery.getExhange("BOS")
                obj.symbolTo = "bos"
                obj.lastPriceTo = pricezz[0].raito
                console.log("xzxzx");
                flag = true
            } else {
                const pricez = await remitanoQuery.getExhange("BPAY")
                obj.symbolForm = "BPAY_TRC20"
                obj.lastPriceForm = pricez[0].raito
                flag = true
            }

        } else if (symbolTo == "BOS_TRC20") {
            const pricez = await remitanoQuery.getExhange("BOS")
            obj.symbolTo = "bos"
            obj.lastPriceTo = pricez[0].raito
            flag = true

        } else if (symbolTo == "BPAY_TRC20") {
            if (symbolForm == "BOS_TRC20") {
                const pricez = await remitanoQuery.getExhange("BPAY")
                obj.symbolTo = "BPAY_TRC20"
                obj.lastPriceTo = pricez[0].raito
                const pricezz = await remitanoQuery.getExhange("BPAY")
                obj.symbolForm = "BPAY_TRC20"
                obj.lastPriceForm = pricezz[0].raito
                flag = true
            } else {
                const pricez = await remitanoQuery.getExhange("BPAY")
                obj.symbolTo = "BPAY_TRC20"
                obj.lastPriceTo = pricez[0].raito
                flag = true
            }


        }

        if (flag) {
            return obj
        } else {
            return flag
        }
    },
    flagWalletUSD: async (symbolForm, symbolTo, idUser) => {
        if (symbolForm == "USD") {
            const walletTo = await remitanoQuery.getWalletToIdUser(idUser, symbolTo)
            if (walletTo.length > 0) {
                return true
            } else {
                return symbolTo
            }
        } else {
            const walletForm = await remitanoQuery.getWalletToIdUser(idUser, symbolForm)
            if (walletForm.length > 0) {
                return true
            } else {
                return symbolForm
            }
        }
    },
    convertSymbolWallet: (symbol) => {
        var symbol = symbol
        if (symbol == "BOS_TRC20") {
            symbol = "bos"
        } else if (symbol == "WIN_TRC20") {
            symbol = "win"
        } else if (symbol == "USDT.TRC20") {
            symbol = "usdt"
        }


        return symbol
    },
    getWallet: async (idUser) => {
        const walletUser = await remitanoQuery.getWalletToIdUserAPI(idUser)
        const trc20 = await remitanoQuery.getTrc20()
        const user = await remitanoQuery.getUserToId(idUser)
        var array = ["btc", "eth", "usdt", "usd", "trx", "bos", "win"]
        var arrayObj = {}


        array.forEach((e) => {
            var symbol = e
            var symbolStr = `${e}_balance`
            trc20.forEach((element) => {

                if (element.symbol.toLowerCase() == e) {
                    if (e == "trx") {
                        symbolStr = `${e}_balance`
                        symbol = `${e}_trc20`
                    } else if (e == "bos") {
                        symbolStr = `coin_balance`
                        symbol = `bos_trc20`
                    } else {
                        symbolStr = `${e}_trc20_balance`
                        symbol = `bos_trc20`
                    }
                }
            })
            walletUser.forEach(wallet => {
                if (arrayObj[`${wallet.code.toLowerCase()}`] == undefined && wallet.code.toLowerCase() != "trx_trc20") {
                    arrayObj[`${wallet.code.toLowerCase()}_balance`] = wallet.amount
                }

            })
        })


        array.forEach((e) => {
            var flag = true
            var symbol = e
            var symbolStr = `${e}_balance`
            trc20.forEach((element) => {

                if (element.symbol.toLowerCase() == e) {
                    if (e == "trx") {
                        symbolStr = `${e}_balance`
                        symbol = `${e}_trc20`
                    } else if (e == "bos") {
                        symbolStr = `coin_balance`
                        symbol = `bos_trc20`
                    } else {
                        symbolStr = `${e}_trc20_balance`
                        symbol = `bos_trc20`
                    }
                }
            })


            if (user[0][`${symbolStr}`] != undefined) {
                flag = true
            }
            if (flag) {
                arrayObj[`${symbolStr}`] = user[0][`${symbolStr}`]
            }

        })


        return arrayObj
    },
    flagAmountToSymBol: async (idUser, symbol, amount) => {
        const user = await remitanoQuery.getUserToId(idUser)
        const wallet = await remitanoQuery.getWalletToIdUser(idUser, symbol)
        var symbolUser = symbol
        var symbolTest = symbol
        var amount = parseFloat(amount)
        if (symbol.toLowerCase() == "bos") {
            symbolUser = "coin"
        } else if (symbol.toLowerCase() == "win") {
            symbolUser = "win_trc20"
        }
        var flag = array.filter(e => e == symbolTest.toLowerCase())

        var ifFlag
        if (flag.length > 0) {
            if (user[0][`${symbolUser.toLowerCase()}_balance`] >= amount) {
                ifFlag = true
            } else {
                ifFlag = false
            }
        } else {
            console.log(typeof (wallet[0][`amount`]), typeof (amount), "amounttttt");
            if (wallet[0][`amount`] >= amount) {
                ifFlag = true
            } else {
                ifFlag = false
            }
        }
        return ifFlag
    },

    updateBalanceWalletOrUserBonus: async (idUser, symbol, amount) => {

        const user = await remitanoQuery.getUserToId(idUser)
        const wallet = await remitanoQuery.getWalletToIdUser(idUser, symbol)
        var amount = parseFloat(amount)
        var symbolUser = symbol
        if (symbol.toLowerCase() == "bos") {
            symbolUser = "bos"
        } else if (symbol.toLowerCase() == "win") {
            symbolUser = "win"
        }
        var flag = array.filter(e => e == symbolUser.toLowerCase())
        console.log(flag.length)
        if (flag.length > 0) {
            if (symbol.toLowerCase() == "bos") {
                symbolUser = "coin"
            } else if (symbol.toLowerCase() == "win") {
                symbolUser = "win_trc20"
            }
            const value = user[0][`${symbolUser.toLowerCase()}_balance`] + amount
            const result = await remitanoQuery.updateBalanceUsers(idUser, value, `${symbolUser.toLowerCase()}_balance`)
        } else {
            const value = wallet[0][`amount`] + amount
            const result = await remitanoQuery.updateBalance(idUser, value, `${symbol}`)
        }
    },
    addBalanceWallet: async (idUser, symbol, amount) => {

        const user = await remitanoQuery.getUserToId(idUser)
        const wallet = await remitanoQuery.getWalletToIdUser(idUser, symbol)
        var symbolUser = symbol
        // const tokenTrc20 = await remitanoQuery.getTrc20()
        // var flagSymbol = false
        // tokenTrc20.forEach(tokenTrc20 => {
        //     if (`${tokenTrc20.symboTrl.toLowerCase()}_trc20` == symbol.toLowerCase()) {
        //         flagSymbol = true
        //     }
        // })
        if (symbol.toLowerCase() == "bos_trc20") {
            symbolUser = "bos"
        } else if (symbol.toLowerCase() == "win_trc20") {
            symbolUser = "win"
        } else if (symbol.toLowerCase() == "usdt_trc20") {
            symbolUser = "usdt"
        }


        var flag = array.filter(e => e == symbolUser.toLowerCase())
        console.log(flag.length)
        if (flag.length > 0) {
            if (symbolUser.toLowerCase() == "bos") {
                symbolUser = "coin"
            } else if (symbolUser.toLowerCase() == "win") {
                symbolUser = "win_trc20"
            }
            const value = user[0][`${symbolUser.toLowerCase()}_balance`] + amount
            const result = await remitanoQuery.updateBalanceUsers(idUser, value, `${symbolUser.toLowerCase()}_balance`)
        } else {
            const value = wallet[0][`amount`] + amount
            const result = await remitanoQuery.updateBalance(idUser, value, `${symbol}`)
        }
    },
    checkPhoneAccount: (phone) => {
        const array = data.account
        let flag = true
        array.forEach(user => {
            if (user === phone) {
                flag = false
            }
        })
        return flag
    },
    checkOutAccount: (phone, id) => {
        const array = data.account
        const update = array.filter(item => item.id != id)
        return update
    },
    arrayToString: (array) => {
        const str = array.join(" ")
        // let a = str.replace(",", /\s+/g)
        return str
    }
}