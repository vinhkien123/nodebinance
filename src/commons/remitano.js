const remitanoQuery = require("../queries/remitanoQuery")

module.exports = {
    getWallet: async (idUser) => {
        const walletUser = await remitanoQuery.getWalletToIdUserAPI(idUser)
        var arrayObj = {}
        walletUser.forEach(e => {
            arrayObj[`${e.code.toLowerCase()}_balance`] = e.amount
        })
        return arrayObj
    },
}