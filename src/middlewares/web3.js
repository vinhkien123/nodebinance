const Web3 = require('web3');
const { getRowToTable, addRowToTable } = require('../queries/customerQuery');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
module.exports = {
    createWalletBEP20: async (userid, symbol) => {
        try {
            const wallet = await getRowToTable(`tb_wallet_code`, `code='USDT.BEP20' AND userid=${userid}`)
            if (wallet.length > 0) return {flag : false, address : wallet[0].address}
            const user = await getRowToTable(`tb_user`,`id=${userid}`)
            const data = web3.eth.accounts.create();
            const obj = {
                userid,
                username : user[0].userName,
                address :data.address,
                code : `${symbol}`,
                privateKey : data.privateKey.slice(2, data.privateKey.length)
            }
            await addRowToTable(`tb_wallet_code`,obj)
            return {flag : true, address :data.address}
        } catch (error) {
            console.log(error);

        }
    }
}