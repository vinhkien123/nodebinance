const { getRowToTable, addRowToTable, updateRowToTable, deleteRowToTable } = require("../queries/customerQuery");


async function getPosition(userid) {
    try {
        const itemFuture = await getRowToTable(`tb_future`, `userid=${userid} AND type =1 `)
        for (let item of itemFuture) {

        }
        const obj = {
            regime: itemFuture[0].regime,

        }
    } catch (error) {

    }
}
async function addFutureHistory(userid, symbol, core, type, regime, side, amount, price, typeTrade, idPositon) {
    try {
        const profile = await getRowToTable(`tb_user`, `id=${userid}`)
        const amountCoin = amount / price
        const obj = {
            userid,
            email: profile[0].email,
            cost: price,
            amount: amount,
            core,
            type,
            regime,
            symbol,
            amountCoin,
            side,
            liquidationPrice: 0,
            orderEntryPrice: price,
            closeEntryPrice: 0,
            idPosition: idPositon ? idPositon : 0,
            typeTrade
        }
        await addRowToTable(`tb_future`, obj)
    } catch (error) {
        console.log(error, `addFutureHistory`);
    }
}
async function closeMarketFutureFunc(position, priceSymbol) {
    try {
        let PnL
        if (position.side == "buy") {
            PnL = (priceSymbol.close - position.entryPrice) * position.amountCoin
        } else {
            PnL = (position.entryPrice - priceSymbol.close) * position.amountCoin
        }
        PnL -= PnL * 0.01
        let amount = position.margin
        if (PnL > 0) {
            amount += PnL
        }
        let sideAdd = position.side == "buy" ? "sell" : "buy"

        await updateRowToTable(`tb_user`, `balance=balance+${amount}`, `id=${position.userid}`)
        await addFutureHistory(position.userid, position.symbol, position.core, 3, position.regime, sideAdd, position.margin, priceSymbol.close, `Market`, position.id)
        await deleteRowToTable(`tb_position_future`, `id=${position.id}`)
    } catch (error) {
        console.log(error, "closeMarketFutureFunc");
    }
}
async function marketFutureFunc(userid, symbol, amount, core, regime, side, type) {
    try {
        const priceSymbol = await getRowToTable(`tb_chart`, `symbol='${symbol}'`)
        const profile = await getRowToTable(`tb_user`, `id=${userid}`)
        const amountCoin = amount / priceSymbol[0].close
        let liquidationPrice = 0
        if (side == 'sell' && type == 1) {
            if (core == 1) {
                liquidationPrice = priceSymbol[0].close * 2
            } else {
                liquidationPrice = priceSymbol[0].close + (priceSymbol[0].close / core)
            }
        }
        const obj = {
            userid,
            email: profile[0].email,
            cost: priceSymbol[0].close,
            amount: amount,
            core,
            type,
            regime,
            symbol,
            amountCoin,
            side,
            liquidationPrice,
            orderEntryPrice: priceSymbol[0].close,
            closeEntryPrice: 0,
        }
        await updateRowToTable(`tb_user`, `balance=balance-${amountCore}`, `id=${userid}`)
        await addRowToTable(`tb_future`, obj)
    } catch (error) {
        console.log(error, "marketFutureFunc");
    }
}
async function addPosition(userid, symbol, margin, regime, side, core) {
    try {
        const position = await getRowToTable(`tb_position_future`, `userid=${userid} AND symbol='${symbol}'`)
        const profile = await getRowToTable(`tb_user`, `id=${userid}`)
        const priceSymbol = await getRowToTable(`tb_chart`, `symbol='${symbol}'`)
        await updateRowToTable(`tb_user`, `balance=balance-${margin}`, `id=${userid}`)

        let amountCoin = margin * core / priceSymbol[0].close
        let liquidationPrice = 0
        if (side == 'sell') {
            if (core == 1) {
                liquidationPrice = priceSymbol[0].close * 2
            } else {
                liquidationPrice = priceSymbol[0].close + (priceSymbol[0].close / core)

            }
        } else {
            if (core == 1) {
                liquidationPrice = 0
            } else {
                liquidationPrice = priceSymbol[0].close - (priceSymbol[0].close / core)
            }
        }
        if (position.length > 0) {
            if (side == position[0].side) {
                let DCA = (position[0].amountCoin * position[0].entryPrice + amountCoin * priceSymbol[0].close) / (position[0].amountCoin + amountCoin)
                // if(side=='sell'){
                //     amountCoin+= DCA*0.001
                // }else{
                // }
                amountCoin -= amountCoin * 0.001

                await updateRowToTable(`tb_position_future`, `entryPrice=${DCA},amountCoin=amountCoin+${amountCoin},core=${core},margin=margin+${margin}`, `id=${position[0].id}`)
            } else {
                const marginBefore = position[0].margin - margin
                if (marginBefore * core <= -30) {
                    //// đổi side

                    await closeMarketFutureFunc(position[0], priceSymbol[0])
                    await addPosition(userid, symbol, marginBefore * -1, regime, side, core)

                } else if (marginBefore * core >= 30) {
                    let PnL
                    let amountCoinLiqui = margin * core / priceSymbol[0].close
                    //// feee
                    // amountCoinLiqui -= position[0].amountCoin - amountCoinLiqui
                    let amountCoinOrder = position[0].amountCoin - amountCoinLiqui
                    // *0.01
                    /// fee
                    if (side == "buy") {
                        PnL = (priceSymbol[0].close - position[0].entryPrice) * amountCoinOrder
                    } else {
                        PnL = (position[0].entryPrice - priceSymbol[0].close) * amountCoinOrder
                    }
                    // PnL -= PnL * 0.02
                    let amountPnL = margin + PnL
                    // let amountPnL =  PnL
                    if (amountPnL > 0) {
                        await updateRowToTable(`tb_user`, `balance=balance+${amountPnL}`, `id=${position[0].userid}`)
                    }
                    await updateRowToTable(`tb_position_future`, `amountCoin=${amountCoinOrder},core=${core},margin=${marginBefore}`, `id=${position[0].id}`)
                    return position[0].id
                } else {
                    //// closeMarketFuture
                    await closeMarketFutureFunc(position[0], priceSymbol[0])
                }
            }
        } else {
            const obj = {
                userid,
                email: profile[0].email,
                entryPrice: priceSymbol[0].close,
                symbol,
                liquidationPrice,
                margin,
                regime,
                side,
                core,
                amountCoin
            }
            let position = await addRowToTable(`tb_position_future`, obj)
            return position.rows.insertId
        }
    } catch (error) {
        console.log(error, "add positon");
    }
}
module.exports = {
    addPosition,
    closeMarketFutureFunc,
    addFutureHistory
}