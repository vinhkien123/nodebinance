const Web3 = require('web3');
const customerQuery = require('../sockets/queries/customerQuery');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
module.exports = {
    createWalletBEP20: async (userid, symbol) => {
        try {
            const wallet = await customerQuery.getWalletToIdUser(userid, `${symbol}`)
            if (wallet.length > 0) return {flag : false, address : wallet[0].address}
            const user = await customerQuery.getUserToId(userid)
            const data = web3.eth.accounts.create();
            await customerQuery.addWalletCodeBEP20(userid, user[0].username, data.address, `${symbol}`, data.privateKey)
            return {flag : true, address :data.address}
        } catch (error) {
            console.log(error);
        }
    }
}