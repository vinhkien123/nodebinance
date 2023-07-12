const {
    convertArrayCreated_at, convertArrayWallet, convertTimeToString, strWallet, convertArrayCreated_atDDMMYY
} = require(".")
const customerQuery = require("../queries/customerQuery")

module.exports = {
    // getLimitPageToTableHistory
    getListLimitPageSreach: async (table, limit, page, where, flag) => {
        const listQuery = await customerQuery.getLimitPageToTable(table, limit, page, where)
        const lengthQuery = await customerQuery.getCountToTable(table, where)
        const [list, length] = await Promise.all([listQuery, lengthQuery])
        // if (list.length > 0) convertArrayCreated_at(list, flag) 
        const obj = {
            array: list,
            total: length[0][`COUNT(*)`]
        }
        return obj
    },
    getListLimitPageHistory: async (table, limit, page, where, flag) => {
        const listQuery = await customerQuery.getLimitPageToTableHistory(table, limit, page, where)
        const lengthQuery = await customerQuery.getCountToTable(table, where)
        const [list, length] = await Promise.all([listQuery, lengthQuery])
        if (list.length > 0) {
            for(let item of list){
                item.created_at = convertTimeToString(item.created_at)
                // item.strWallet = strWallet(item)
            }
        }
        const obj = {
            array: list,
            total: length[0][`COUNT(*)`]
        }
        return obj
    },
    getListLimitPage: async (table, limit, page, where, flag) => {
        const listQuery = await customerQuery.getLimitPageToTable(table, limit, page, where)
        const lengthQuery = await customerQuery.getCountToTable(table, where)
        const [list, length] = await Promise.all([listQuery, lengthQuery])
        if (list.length > 0) convertArrayCreated_at(list, flag)
        const obj = {
            array: list,
            total: length[0][`COUNT(*)`]
        }
        return obj
    },
    getListLimitPageDDMMYY: async (table, limit, page, where, flag) => {
        const listQuery = await customerQuery.getLimitPageToTable(table, limit, page, where)
        const lengthQuery = await customerQuery.getCountToTable(table, where)
        const [list, length] = await Promise.all([listQuery, lengthQuery])
        if (list.length > 0) convertArrayCreated_atDDMMYY(list, flag)
        const obj = {
            array: list,
            total: length[0][`COUNT(*)`]
        }
        return obj
    },
     getListLimitPageWallet: async (table, limit, page, where, flag) => {
         const listQuery = await customerQuery.getLimitPageToTableWallet(table, limit, page, where)
         const lengthQuery = await customerQuery.getCountToTable(table, where)
         const [list, length] = await Promise.all([listQuery, lengthQuery])
         
         if (list.length > 0) convertArrayWallet(list)
         const obj = {
             array: list,
             total: length[0][`COUNT(*)`]
         }
         return obj
     },
    getLimitPageToTableVideo: async (table, limit, page, where) => {
        const listQuery = await customerQuery.getLimitPageToTableVideo(table, limit, page, where)
        const lengthQuery = await customerQuery.getCountToTable(table, where)
        const [list, length] = await Promise.all([listQuery, lengthQuery])
        if (list.length > 0) convertArrayCreated_at(list)
        const obj = {
            array: list,
            total: length[0][`COUNT(*)`]
        }
        return obj
    },
}