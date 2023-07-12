const customerQuery = require('../queries/customerQuery')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const { addRowToTable, getRowToTable, updateRowToTable } = require('../queries/customerQuery')
const { default: axios } = require('axios')
function strWallet(str) {
    var strStart = str?.slice(0, 4)
    var strEnd = str?.slice(str?.length - 3, str?.length)
    return `${strStart}...${strEnd}`
}
let tokenTelegram
let chatId
if (process.env.DOMAIN == 'binatrade.net') {
    tokenTelegram = `6040003763:AAGdeTsePlqX1IWhlwgU0ZIQI9s3e7NQaf8`
    chatId = `-1001823400906`
} else if (process.env.DOMAIN == 'vivatrade.io') {
    tokenTelegram = `5839479179:AAEoXc2qMVmDcfCZ2Ta3TNQ39shX7STg0wg`
    chatId = `-1001867561766`
}
var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
require('dotenv').config()

module.exports = {
    // convertTimeItemToArray: (array) => {
    //     for (item of array) {
    //         let day = item..getDate();
    //         let month = time.getMonth() + 1;
    //         let year = time.getFullYear();
    //         var hours = time.getHours();
    //         var minutes = time.getMinutes();
    //         var seconds = time.getSeconds();
    //         return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    //     }
    // },
    getStartWeekAndLastDay: function () {
        let start, end
        let yesterdayTime = new Date(new Date().setDate(new Date().getDate()));
        start = yesterdayTime.setHours(0, 0, 0, 0) / 1000 ;
        end = yesterdayTime.setHours(23, 59, 59, 999) / 1000 ;
        // - 25200
        return { start, end }
    },
    ramdomNumber: (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min)
    },
    addProfit: async function (username, email, amount, userid, message, type) {
        try {
            const profileUser = await getRowToTable(`tb_user`, `id=${userid}`)
            if (profileUser[0].marketing == 0) {
                const profit = await getRowToTable(`tb_config`, `name='profit'`)
                const obj = {
                    username,
                    email,
                    amount,
                    userid,
                    type,
                    profitBefore: profit[0].value,
                    profitAfter: type == 0 ? profit[0].value - amount : profit[0].value + amount,
                    message,
                }
                const tb_profits = addRowToTable(`tb_profits`, obj)
                const tb_configLose = updateRowToTable(`tb_config`, `value=value+${amount}`, `name='${type == 0 ? 'lose' : 'win'}'`)
                const tb_configProfit = updateRowToTable(`tb_config`, `value=value${type == 0 ? '-' : '+'}${amount}`, `name='profit'`)
                await Promise.all([tb_profits, tb_configLose, tb_configProfit])
            }
        } catch (error) {
            console.log(error, "addProfit");
        }
    },
    getStartWeekAndLastWeek: function () {
        let start, end
        var dt = new Date(); // current date of week
        var currentWeekDay = dt.getDay();
        var lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;
        var wkStart = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
        var wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));
        start = wkStart.setHours(0, 0, 0, 0) / 1000 ;
        end = wkEnd.setHours(23, 59, 59, 999) / 1000 ;
        // - 25200
        return { start, end }
    },
    messageTelegram: async function (message) {
        try {

            const res = await axios({
                url: `https://api.telegram.org/bot${tokenTelegram}/sendMessage?text=${message}&chat_id=${chatId}`,
                method: `GET`,
                header: {
                    "Accept": "*/*"
                }
            })
            return res
        } catch (error) {
            console.log(error, "tele message");
        }
    },
    convertArrayCreated_at: (array, flag) => {
        for (item of array) {
            if (flag) {
                item.createTime = new Date(new Date(item.createTime).getTime() + 25200000)
                let day = item.createTime.getDate();
                let month = item.createTime.getMonth() + 1;
                let year = item.createTime.getFullYear();
                var hours = item.createTime.getHours();
                var minutes = item.createTime.getMinutes();
                var seconds = item.createTime.getSeconds();
                item.createTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
            } else {
                item.created_at = new Date(new Date(item.created_at).getTime() + 25200000)
                let day = item.created_at.getDate();
                let month = item.created_at.getMonth() + 1;
                let year = item.created_at.getFullYear();
                var hours = item.created_at.getHours();
                var minutes = item.created_at.getMinutes();
                var seconds = item.created_at.getSeconds();
                item.created_at = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
            }
        }
    },
    convertArrayCreated_atDDMMYY: (array, flag) => {
        for (item of array) {
            if (flag) {
                item.createTime = new Date(new Date(item.createTime).getTime() + 25200000)
                let day = item.createTime.getDate();
                let month = item.createTime.getMonth() + 1;
                let year = item.createTime.getFullYear();
                var hours = item.createTime.getHours();
                var minutes = item.createTime.getMinutes();
                var seconds = item.createTime.getSeconds();
                item.createTime = `${day}/${month}/${year}`
            } else {
                item.created_at = new Date(new Date(item.created_at).getTime() + 25200000)
                let day = item.created_at.getDate();
                let month = item.created_at.getMonth() + 1;
                let year = item.created_at.getFullYear();
                var hours = item.created_at.getHours();
                var minutes = item.created_at.getMinutes();
                var seconds = item.created_at.getSeconds();
                item.created_at = `${day}/${month}/${year}`
            }
        }
    },
    validationBody: (obj) => {
        const arrayKey = Object.keys(obj)
        let arrayError = []
        for (key of arrayKey)
            if (!obj[key]) arrayError.push(`${key} is not empty`)
        if (arrayError.length > 0) return arrayError
        return true
    },
    strWallet: (str) => {
        var strStart = str?.slice(0, 4)
        var strEnd = str?.slice(str?.length - 3, str?.length)
        return `${strStart}...${strEnd}`
    },
    objKeyValueToString: (obj) => {
        const arrayKey = Object.keys(obj)
        let str = ``
        for (key of arrayKey) {
            str += `${key}='${obj[key]}',`
        }
        return str.substring(0, str.length - 1)
    },
    getPriceSell: async (item) => {
        item.price = await getCurrentSellingPrice(item.dogeId)
        console.log(item);
    },
    getPriceSiring: async (item) => {
        item.price = await getCurrentSiringPrice(item.dogeId)
    },

    convertTimeToString: (time) => {
        time = new Date(time * 1000)
        let day = time.getDate();
        let month = time.getMonth() + 1;
        let year = time.getFullYear();
        var hours = time.getHours();
        var minutes = time.getMinutes();
        var seconds = time.getSeconds();
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    },
    getTokenUser: (cusObj) => {
        delete cusObj.password
        return jwt.sign({
            cusObj
        }, "app_steam", {
            expiresIn: 60 * 518400
        });
    },
    checkCommentPost: async (id) => {
        var flag = true
        const user = await customerQuery.getPostsToId(id)
        if (user.length > 0) {
            if (user[0].comment == 1) {
                flag = false
            }
        } else {
            flag = false
        }
        return flag
    },
    deleteProfileObj: (profile) => {
        delete profile.password
        delete profile.secret
    },
    getTokenLogin: async (profile) => {
        let cusObj = {
            id: profile.id
        }
        let token = jwt.sign({
            cusObj
        }, process.env.JWT, {
            expiresIn: parseInt(process.env.EXPRIRESINTOKEN)
        });
        let refreshToken = jwt.sign({
            cusObj
        }, process.env.JWTREFRESHTOKEN, {
            expiresIn: parseInt(process.env.EXPRIRESINREFRESHTOKEN)
        });
        profile.expiresIn = new Date().getTime() + parseInt(process.env.EXPRIRESINTOKEN) * 1000
        profile.expiresInRefreshToken = new Date().getTime() + parseInt(process.env.EXPRIRESINREFRESHTOKEN) * 1000
        profile.token = token
        profile.refreshToken = refreshToken
        const objAdd = {
            userid: profile.id,
            refreshToken
        }
        await addRowToTable(`tb_token`, objAdd)
    },
    checkBlock: async (id) => {
        var flag = true
        const user = await customerQuery.getUserToId(id)
        if (user.length > 0) {
            if (user[0].block == 1) {
                flag = false
            }
        } else {
            flag = false
        }
        return flag
    },
    checkRule: async (id) => {
        var flag = true
        const user = await customerQuery.getUserToId(id)
        if (user.length > 0) {
            if (user[0].rule != 1) {
                flag = false
            }
        } else {
            flag = false
        }
        return flag
    },
    validationUserName: (string) => {
        for (i = 0; i < specialChars.length; i++) {
            if (string.indexOf(specialChars[i]) > -1) {
                return true
            }
        }
        return false;
    },
    validationBody: (obj) => {
        const arrayKey = Object.keys(obj)
        let arrayError = []
        for (key of arrayKey)
            if (!obj[key]) arrayError.push(`${key} is not empty`)
        if (arrayError.length > 0) return arrayError
        return true
    },
    checkAdmin: async (id) => {
        var flag = true
        const user = await customerQuery.getUserToId(id)
        if (user.length > 0) {
            if (user[0].admin != 1) {
                flag = false
            }
        } else {
            flag = false
        }
        return flag
    },
    getHistory: async (id) => {
        var flag = true
        const user = await customerQuery.getUserToId(id)
        if (user.length > 0) {
            if (user[0].admin != 1) {
                flag = false
            }
        } else {
            flag = false
        }
        return flag
    },
    removeBalanceToken: async (userid, amount) => {
        try {
            const user = await customerQuery.getUserToId(userid)
            const balanceUpdate = user[0].token_balance - amount
            await customerQuery.updateBalance(userid, balanceUpdate)
        } catch (error) {
            console.log(error);
        }
    },
    addBalanceToken: async (userid, amount) => {
        try {
            const user = await customerQuery.getUserToId(userid)
            const balanceUpdate = user[0].token_balance + amount
            await customerQuery.updateBalance(userid, balanceUpdate)
        } catch (error) {
            console.log(error);
        }
    }
}