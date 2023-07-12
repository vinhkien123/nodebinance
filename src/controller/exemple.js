const { convertTimeToString, validationBody, getPriceSell, getPriceSiring } = require("../commons");
const { getListLimitPage, getListLimitPageHistory } = require("../commons/request");
const { dogeWarInstance } = require("../contract");
const { success, error_400, error_500 } = require("../message");
const { getRowToTable } = require("../queries/customerQuery");
require('dotenv').config()

module.exports = {
    getHistory: async (req, res, next) => {
        try {
            const { limit, page, where } = req.body
            const flag = validationBody({ limit, page })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const list = await getListLimitPageHistory(`tb_attack`, limit, page, where)

            success(res, "Get My doge success", list)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    

}