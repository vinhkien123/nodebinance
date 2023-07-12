require('dotenv').config()
const Web3 = require('web3');
const Tx = require("ethereumjs-tx").Transaction
const { getStartWeekAndLastDay, messageTelegram } = require("../commons");
const { getRowToTable, updateRowToTable, addRowToTable } = require("../queries/customerQuery");
const { sendMailMessage } = require("../sockets/functions/verifyEmail");
const RPC = process.env.START == 'MAINNET' ? `https://smart-capable-pallet.bsc.discover.quiknode.pro/59f691dace13174c585574cca37f22f74a6570ad/` : `https://data-seed-prebsc-1-s1.binance.org:8545/`
const web3 = new Web3(RPC);
const contractUSDT = process.env.START == 'MAINNET' ? '0x55d398326f99059fF775485246999027B3197955' : '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
const abiUSDT = process.env.START == 'MAINNET' ? [{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [], "name": "_decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burn", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }] : [{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [], "name": "_decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }]


async function depositCoinUSDTBEP20(result) {
    try {
        const walletUser = await getRowToTable(`tb_wallet_code`, `address='${result.returnValues.to}'`)
        if (walletUser.length > 0) {
            // console.log(walletUser, "walletUser");
            // console.log(result, "result");
            const data = {
                amount: parseFloat(result.returnValues.value) / 1e18,
                currency: 'USDT.BEP20',
                txn_id: result.transactionHash,
                userid: walletUser[0].userid
            }
            // console.log(data);
            if (data.amount < 5) return
            let address = result.returnValues.to
            let quantity = data.amount
            let code = data.currency
            let txhash = data.txn_id
            let userid = walletUser[0].userid
            const transaction = await getRowToTable(`blockchain_log`, `hash='${txhash}'`)
            // const flag = await validationDepositCoin(code, quantity)
            // if (!flag) return error_400(res, `error amount`)
            if (transaction.length > 0) {
                //console.log("coinpayment  hoat dong nhung ton tai txhash ssssssssss")
                let message = `- Sàn: *BEEMARKET*\n- *Tracking coinpayments webhook deposit*\nCó một giao dịch bị trùng txhash lúc deposit\n=>Txhash: ${txhash}`;
                // return error_400(res, message, 2)
                console.log(message);
                return
                //   botTelegram.sendMessage(message);
            }
            let USD = parseFloat(quantity).toFixed(2)
            const user = await getRowToTable(`tb_user`, `id=${userid}`)
            let amountBefore = user[0].balance
            let amountAfter = parseFloat(amountBefore) + parseFloat(USD)
            const cusObj = {
                userName: user[0].userName,
                email: user[0].email,
                hash: txhash,
                user_id: userid,
                from_id: userid,
                coin_key: code,
                usd_amount: parseFloat(quantity).toFixed(6),
                amount: parseFloat(quantity).toFixed(6),
                category: "receive",
                address: address,
                to_address: address,
                status: 1,
                message: `${code} Deposit`,
                before_amount: amountBefore,
                after_amount: amountAfter
            }
            await updateRowToTable(`tb_user`, `balance=balance+${USD}`, `id=${userid}`)
            await addRowToTable(`blockchain_log`, cusObj)
            const time = getStartWeekAndLastDay()
            await updateRowToTable(`tb_balance_user`, `deposit=deposit+${parseFloat(quantity).toFixed(6)},afterBalance=afterBalance+${parseFloat(quantity).toFixed(6)}`, `userid=${userid} AND UNIX_TIMESTAMP(created_at)>=${time.start} AND UNIX_TIMESTAMP(created_at)<${time.end}`)
            const objNotification = {
                title: `Recharge successful`,
                detail: `You have deposited ${USD} USDT`,
                amountDeposit: USD,
                userid: userid,
                userName: user[0].userName,
                email: user[0].email,
                type: 6
            }
            await addRowToTable(`tb_notification`, objNotification)
            let message = `You have successfully deposited ${USD} USDT`
            try {
                await sendMailMessage(user[0].email, `${process.env.SERVICENAME} | Transfer`, `${user[0].userName}`, message)
            } catch (error) {
                console.log(error);
            }
            await messageTelegram(`[DEPOSIT] User ${user[0].userName} deposit ${parseFloat(quantity).toFixed(6)} ${code} success. Txhash: ${txhash}`)

            // try {
            //     await sendMailDepositCoinpayment(user[0].email, '[SWAPTOBE DEPOSIT] ' + user[0].username + ': ' + quantity + ' ' + code, user[0].username, quantity, code, txhash)
            // } catch { }
            console.log("success");
            ////////////////////////// success /////
            const fromAddressBNBQuery = getRowToTable(`tb_config`, `name='addressBNB'`)
            const privateKeyBNBQuery = getRowToTable(`tb_config`, `name='privateKeyBNB'`)
            const addressUSDTQuery = getRowToTable(`tb_config`, `name='addressUSDT'`)
            const [fromAddressBNB, privateKeyBNB, addressUSDT] = await Promise.all([fromAddressBNBQuery, privateKeyBNBQuery, addressUSDTQuery])
            const amount = 0.003
            await transferBNB(fromAddressBNB[0].data, address, amount, privateKeyBNB[0].data)
            const usdtInstance = new web3.eth.Contract(abiUSDT, contractUSDT)
            await transferToken(usdtInstance, contractUSDT, address, addressUSDT[0].data, result.returnValues.value.toLocaleString('fullwide', { useGrouping: false }), walletUser[0].privateKey)
        }
    } catch (error) {
        console.log(error, "depsoit");
    }
}
async function transferBNB(fromAddress, toAddress, transferAmount, my_privkey) {
    try {
        console.log(
            `Attempting to make transaction from ${fromAddress} to ${toAddress}`
        );

        const createTransaction = await web3.eth.accounts.signTransaction(
            {
                from: fromAddress,
                to: toAddress,
                value: web3.utils.toWei(`${transferAmount}`, 'ether'),
                gas: '54154',
            },
            my_privkey
        );

        // Deploy transaction
        const createReceipt = await web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction
        );
        console.log(
            `Transaction successful with hash: ${createReceipt.transactionHash}`
        );
    } catch (error) {
        console.log(error, "transferBNB")
    }
}
async function transferToken(contract, contractAddress, myAddress, destAddress, transferAmount, my_privkey) {
    try {
        var count = await web3.eth.getTransactionCount(myAddress);
        var rawTransaction = {
            "from": myAddress,
            "nonce": "0x" + count.toString(16),
            "gasPrice": web3.utils.toHex(5000000000),
            "gasLimit": web3.utils.toHex(210000),
            "to": contractAddress,
            "value": "0x0",
            "data": contract.methods.transfer(destAddress, transferAmount).encodeABI(),
            "chainId": 56
        };
        var privKey = Buffer.from(my_privkey, 'hex');
        var Common = require('ethereumjs-common').default;
        var BSC_FORK = Common.forCustomChain(
            'mainnet',
            {
                name: 'Binance Smart Chain Mainnet',
                networkId: 56,
                chainId: 56,
                url: RPC
            },
            'istanbul',
        );
        var tx = new Tx(rawTransaction, { 'common': BSC_FORK });

        tx.sign(privKey);
        var serializedTx = tx.serialize();
        console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);
        var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
        console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
        const balance = await contract.methods.balanceOf(myAddress).call();
        console.log(`Balance after send: ${balance}`);
    } catch (error) {
        console.log(error, "transferToken");
    }

}
module.exports = {
    depositCoinUSDTBEP20,
}