const { getStartWeekAndLastWeek, addProfit, getStartWeekAndLastDay } = require(".")
const { getDataParentToUserid, addRowToTable, updateRowToTable, getDataParentToUseridBottomNetwork, getDataParentToUseridBottomNetworkQuery, getRowToTable, getDataParentToUseridToTimeAndLevel, getDataToUserNameCusNetworkQuery } = require("../queries/customerQuery")
const opts = {
    errorEventName: 'error',
    logDirectory: `${__dirname}/log`,
    fileNamePattern: 'log.txt',
    dateFormat: 'YYYY.MM.DD'
};
const log = require('simple-node-logger').createRollingFileLogger(opts);

async function getParentUser(parentId, array) {
    let dataUser = await getDataParentToUserid(parentId)
    if (dataUser.length <= 0) return
    await getParentUser(dataUser[0].parentId, array)
    // if (dataUser[0].level != level) return
    array.push(...dataUser)
    if (dataUser[0].parentId == 1 || dataUser[0].parentId == null) return
}
// CURRENT_TIMESTAMP
async function getParentUserBottomNetworkToTime(userid, level, array, timeStart, timeEnd) {
    let dataUser = await getDataToUserNameCusNetworkQuery(userid)
    if (dataUser.length <= 0) return
    for await (let userF of dataUser) {
        await getParentUserBottomNetworkToTime(userF.id, level, array, timeStart, timeEnd)
        if (userF.level == level && new Date(userF.updateLevel_at).getTime() >= timeStart && new Date(userF.updateLevel_at).getTime() <= timeEnd) {
            array.push(userF)
        }
    }
}
// POSITION('${keyWord}' IN userName)
async function getDataToUserNameNetworkQuery(userid, keyWord, timeStart, timeEnd, array) {

    let dataUser = await getDataToUserNameCusNetworkQuery(userid)
    if (dataUser.length <= 0) return
    for await (let userF of dataUser) {
        await getDataToUserNameNetworkQuery(userF.id, keyWord, timeStart, timeEnd, array)
        if (userF.userName.indexOf(keyWord) >= 0 && new Date(userF.created_at).getTime() / 1000 >= timeStart && new Date(userF.created_at).getTime() / 1000 <= timeEnd) {
            array.push(userF)
        }
    }
}
async function getParentUserBottomNetwork(userid, level, array) {
    let dataUser = await getDataParentToUseridBottomNetworkQuery(userid)
    // console.log(dataUser,"user",userid);
    if (dataUser.length <= 0) return
    for await (let userF of dataUser) {
        await getParentUserBottomNetwork(userF.id, level, array)
        if (userF.level == level) {
            array.push(userF)
        }
    }
}
async function getDataOfUserId(userid, user) {
    try {
        let timeNow = new Date().getTime() / 1000 
        // - 25200
        let oneDay = 60 * 60 * 24
        let timeStartLast7Day = timeNow - (oneDay * 7)
        let timeStartLast30Day = timeNow - (oneDay * 30)
        const list = await getRowToTable(`tb_balance_user`, `userid=${userid} AND  UNIX_TIMESTAMP(created_at)>${timeStartLast7Day} AND UNIX_TIMESTAMP(created_at)<${timeNow}`)
        const list30Day = await getRowToTable(`tb_balance_user`, `userid=${userid} AND  UNIX_TIMESTAMP(created_at)>=${timeStartLast30Day} AND UNIX_TIMESTAMP(created_at)<=${timeNow}`)
        let obj = {
            totalVolume7Day: 0,
            commissionBalance7Day: 0,
            totalOrder7Day : 0,
            totalOrder30Day : 0,
            totalVolume30Day: 0,
            commissionBalance30Day: 0
        }
        for (i = 0; i < list.length; i++) {
            if (i == 0) obj.beforeBalance = list[i].beforeBalance
            if (i == list.length - 1) obj.afterBalance = list[i].afterBalance
            obj.commissionBalance7Day += list[i].commissionBalance
            obj.totalVolume7Day += list[i].totalVolume
            obj.totalOrder7Day += list[i].totalOrder
        }
        for (i = 0; i < list30Day.length; i++) {
            if (i == 0) obj.beforeBalance = list30Day[i].beforeBalance
            if (i == list30Day.length - 1) obj.afterBalance = list30Day[i].afterBalance
            obj.totalVolume30Day += list30Day[i].totalVolume
            obj.commissionBalance30Day += list30Day[i].commissionBalance
            obj.totalOrder30Day += list[i].totalOrder

        }
        user.totalOrder30Day = obj.totalOrder30Day
        user.totalOrder7Day = obj.totalOrder7Day
        user.commissionBalance7Day = obj.commissionBalance7Day
        user.totalVolume7Day = obj.totalVolume7Day
        user.totalVolume30Day = obj.totalVolume30Day
        user.commissionBalance30Day = obj.commissionBalance30Day
    } catch (error) {
        console.log(error, "last30day");
    }
}
async function addHistoryCommission(user, amountRose, amountOrder, percent, percentF, userOrder) {
    try {
        const obj = {
            userid: user.id,
            userName: user.userName,
            amount: amountOrder,
            amountReceive: amountRose,
            percent,
            percentF,
            parentId: userOrder.id,
            parentUserName: userOrder.userName,
            level: user.level
        }
        const time = getStartWeekAndLastDay()
        await Promise.all([
            updateRowToTable(`tb_user`, `commissionBalance=commissionBalance+${amountRose},totalCommission=totalCommission+${amountRose},balance=balance+${amountRose}`, `id=${user.id}`),
            addRowToTable(`tb_commission`, obj),
            addProfit(user.userName, user.email, amountRose, user.id, `Commission`, 0),
            updateRowToTable(`tb_balance_user`, `totalVolume=totalVolume+${amountOrder}, commissionBalance=commissionBalance+${amountRose}
        `, `userid=${user.id} AND UNIX_TIMESTAMP(created_at)>=${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)
        ])
    } catch (error) {
        console.log(error, "addHistoryCommission");
    }
}
// type : 0 thông báo nhận được hoa hồng từ thành viên vip | data : amountRoseMemberVip
// 
async function addCommissionMemberVip(user, amountRose) {
    try {
        const obj = {
            userid: user.id,
            userName: user.userName,
            balance: amountRose,
            email: user.email,
            detail: 'Vip member commission'
        }
        const objNotification = {
            title: `Receive commission from VIP member`,
            detail: `Your downline just became a VIP. You get ${amountRose}$ commission.`,
            type: 0,
            amountRoseMemberVip: amountRose,
            userName: user.userName,
            email: user.email,
            userid: user.id
        }
        await Promise.all([
            updateRowToTable(`tb_user`, `totalMemberVip=totalMemberVip+1,commissionMemberVip=commissionMemberVip+${amountRose},balance=balance+${amountRose}`, `id=${user.id}`),
            addRowToTable(`tb_transfer_commission`, obj),
            addRowToTable(`tb_notification`, objNotification),


        ])
    } catch (error) {
        console.log(error, "addHistoryCommission");
    }
}
async function roseOrder(listUser, amountOrder, userOrder) {
    let arrayPromise = []
    //// phần trăm hoa hồng theo level 
    // 1%
    // 0.5%
    // 0.25%
    // 0.125%
    // 0.0625%
    // 0.03125%
    // 0.015625%

    /// đảo ngược danh sách user 
    listUser.reverse()
    ////// listUser là danh sách user nhận hoa hồng
    let amountRose
    for (let i = 0; i < listUser.length; i++) {
        let percent = 0
        if (i == 0 && listUser[i].level >= i + 1) {
            percent = 0.01
        } else if (i == 1 && listUser[i].level >= i + 1) {
            percent = 0.005
        } else if (i == 2 && listUser[i].level >= i + 1) {
            percent = 0.0025
        } else if (i == 3 && listUser[i].level >= i + 1) {
            percent = 0.00125
        } else if (i == 4 && listUser[i].level >= i + 1) {
            percent = 0.000625
        } else if (i == 5 && listUser[i].level >= i + 1) {
            percent = 0.0003125
        } else if (i == 6 && listUser[i].level >= i + 1) {
            percent = 0.00015625
        }
        if (percent > 0) {
            amountRose = amountOrder * percent
            arrayPromise.push(addHistoryCommission(listUser[i], amountRose, amountOrder, percent, 0, userOrder))
        }
    }
    await Promise.all(arrayPromise)
    //// tính toán hoa hồng và thêm vào lịch sử + tiền hoa hồng 

}
async function funcTotalMember(listUser) {
    let arrayPromise = []
    //// phần trăm hoa hồng theo level 
    // 1%
    // 0.5%
    // 0.25%
    // 0.125%
    // 0.0625%
    // 0.03125%
    // 0.015625%

    /// đảo ngược danh sách user 
    listUser.reverse()
    ////// listUser là danh sách user nhận hoa hồng
    for (let i = 0; i < listUser.length; i++) {
        if (i < 7) {
            arrayPromise.push(updateRowToTable(`tb_user`,`totalMember=totalMember+1`,`id=${listUser[i].id}`))
        }
    }
    await Promise.all(arrayPromise)
    //// tính toán hoa hồng và thêm vào lịch sử + tiền hoa hồng 

}
async function commissionOrder(user, amountOrder) {
    try {
        /// lấy danh sách hoa hồng theo level
        let arrayPromise = []
        let arrayUserLever1 = []
        arrayPromise.push(
            getParentUser(user.parentId, arrayUserLever1),
        )
        await Promise.all(arrayPromise)
        let PromiseArray = []
        if (arrayUserLever1.length > 0) PromiseArray.push(roseOrder(arrayUserLever1, amountOrder, user))
        await Promise.all(PromiseArray)
    } catch (error) {
        log.info("commissionOrder", error)
        console.log("commissionOrder", error);
    }

}
async function totalMemberRef(user) {
    try {
        /// lấy danh sách hoa hồng theo level
        let arrayPromise = []
        let arrayUserLever1 = []
        arrayPromise.push(
            getParentUser(user.parentId, arrayUserLever1),
        )
        await Promise.all(arrayPromise)
        let PromiseArray = []
        if (arrayUserLever1.length > 0) PromiseArray.push(funcTotalMember(arrayUserLever1))
        await Promise.all(PromiseArray)
    } catch (error) {
        log.info("totalMemberRef", error)
        console.log("totalMemberRef", error);
    }

}
async function viewLever(user) {
    let time = getStartWeekAndLastWeek()
    const list = await getRowToTable(`tb_balance_user`, `userid=${user.id} AND  UNIX_TIMESTAMP(created_at)>${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)
    let obj = {
        win: 0,
        lose: 0,
        deposit: 0,
        afterBalance: 0,
        beforeBalance: 0,
        widthdraw: 0,
        totalOrder: 0,
        totalMemberVipF1: 0

    }
    for (i = 0; i < list.length; i++) {
        if (i == 0) obj.beforeBalance = list[i].beforeBalance
        if (i == list.length - 1) obj.afterBalance = list[i].afterBalance
        obj.win += list[i].win
        obj.lose += list[i].lose
        obj.deposit += list[i].deposit
        obj.widthdraw += list[i].widthdraw
        obj.totalOrder += list[i].totalOrder
        obj.totalMemberVipF1 += list[i].totalMemberVipF1
    }
    return obj
}
async function addLever(user) {
    const orderWeekUser = await viewLever(user)
    // if ()
}
async function getListUserF1(user) {
    try {
        const viewUserObj = await viewLever(user)
        const listUserF1 = await getRowToTable(`tb_user`, `parentId=${user.id} AND id!=1`)
        let arrayPromise = []
        let totalOrderF1 = 0
        let totalMemberVipF1 = 0
        for await (let userF1 of listUserF1) {
            const objF1 = await viewLever(userF1)
            totalOrderF1 += objF1.totalOrder
            totalMemberVipF1 += objF1.totalMemberVipF1
        }


        let obj = {
            deposit: viewUserObj.deposit,
            orderUser: viewUserObj.totalOrder,
            F1IB1200: 0,
            F1IB800: 0,
            F1IB500: 0,
            F1IB300: 0,
            F1IB100: 0
        }
        //// không đủ điều kiện nạp 500$ trên tuần
        // if (obj.deposit < 500 ) {
        //     await updateRowToTable(`tb_user`, `level=0`, `id=${user.id}`)
        //     return
        // }

        if (user.id == 2) {
            console.log(totalOrderF1, "totalOrderF1");
            console.log(totalMemberVipF1, "totalMemberVipF1");
        }
        let level = 0
        if (totalOrderF1 >= 64000 && totalMemberVipF1 >= 8 && user.level >= 1) {
            //lever 7
            level = 7
        }
        else if (totalOrderF1 >= 32000 && totalMemberVipF1 >= 7 && user.level >= 1) {
            //lever 6
            level = 6
        }
        else if (totalOrderF1 >= 16000 && totalMemberVipF1 >= 6 && user.level >= 1) {
            //lever 5
            level = 5
        } else if (totalOrderF1 >= 8000 && totalMemberVipF1 >= 5 && user.level >= 1) {
            //lever 4
            level = 4
        } else if (totalOrderF1 >= 4000 && totalMemberVipF1 >= 4 && user.level >= 1) {
            //lever 3
            level = 3
        } else if (totalOrderF1 >= 2000 && totalMemberVipF1 >= 3 && user.level >= 1) {
            //lever 2
            level = 2
        }
        /////// update level nếu user đó đã đạt lv1 thì không về lv0 nữa
        if (user.level >= 1 && level == 0) {
            await updateRowToTable(`tb_user`, `level=1`, `id=${user.id}`)
        } else if (user.level >= 1 && level > 0) {
            await updateRowToTable(`tb_user`, `level=${level}`, `id=${user.id}`)
        }
    } catch (error) {
        console.log("getListUserF1", error);
    }
}

async function refeshLevelFunc() {
    const listUser = await getRowToTable(`tb_user`, `blockLevel!=1`)
    let arrayPromise = []
    for (let user of listUser) {
        arrayPromise.push(getListUserF1(user))
    }
    Promise.all(arrayPromise)
}
async function trasnferCommissionToBalance(user) {
    try {
        await updateRowToTable(`tb_user`, `commissionBalance=0,beforeCommission=${user.commissionBalance}`, `id=${user.id}`)
        const obj = {
            userid: user.id,
            userName: user.userName,
            balance: user.commissionBalance,
            detail: `Transaction commission`,
            email: user.email
        }


        await addRowToTable(`tb_transfer_commission`, obj)
        let timeNow = new Date()
        let day = timeNow.getDate();
        let month = timeNow.getMonth() + 1;
        let year = timeNow.getFullYear();
        timeNow = `${day}-${month}-${year}`
        const objNotification = {
            userid: user.id,
            userName: user.userName,
            type: 3,
            title: `You have received trading commission`,
            detail: `You have successfully received Trading Commission worth ${user.commissionBalance} USDT for ${timeNow}`,
            amountCommission: user.commissionBalance,
            timeCommission: timeNow,
            email: user.email
        }
        await addRowToTable(`tb_notification`, objNotification)
    } catch (error) {
        console.log(error);
    }
}
async function trasnferTotalOrderBalance(user) {
    await updateRowToTable(`tb_user`, `beforeTotalOrder=${user.totalOrder}`, `id=${user.id}`)

}
async function refeshCommissionFunc() {
    const listUser = await getRowToTable(`tb_user`, `commissionBalance>0`)
    let arrayPromise = []
    for (let user of listUser) {
        arrayPromise.push(trasnferCommissionToBalance(user))
    }
    Promise.all(arrayPromise)
}
async function refeshTotalOrder() {
    const listUser = await getRowToTable(`tb_user`)
    let arrayPromise = []
    for (let user of listUser) {
        arrayPromise.push(trasnferTotalOrderBalance(user))
    }
    Promise.all(arrayPromise)
}
module.exports = {
    commissionOrder,
    getParentUser,
    getParentUserBottomNetwork,
    refeshLevelFunc,
    refeshCommissionFunc,
    addCommissionMemberVip,
    viewLever,
    refeshTotalOrder,
    getParentUserBottomNetworkToTime,
    getDataToUserNameNetworkQuery,
    getDataOfUserId,
    totalMemberRef
}