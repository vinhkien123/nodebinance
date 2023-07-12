const { convertTimeToString, validationBody, getPriceSell, getPriceSiring, messageTelegram } = require("../commons");
const { getListLimitPage, getListLimitPageHistory } = require("../commons/request");
const { dogeWarInstance } = require("../contract");
const { success, error_400, error_500 } = require("../message");
const { getRowToTable, updateRowToTable, addRowToTable, deleteRowToTable, getLimitPageToTable } = require("../queries/customerQuery");
const crypto = require("crypto");
const { checkBalanceStr, updateStatusBalance } = require("../commons/crypto");
require('dotenv').config()

module.exports = {
    checkTransactionDepositVnd: async (req, res, next) => {
        try {

            const idUser = req.user
            if (idUser) {
                //console.log(idUser);
                const transaction = await getRowToTable(`tb_banking_transaction`, `userid=${idUser} AND type_user=0`)
                if (transaction.length > 0) {
                    const getBankingAdmin = await getRowToTable(`tb_banking_admin`, `id=${transaction[0].id_banking_admin}`)
                    if (getBankingAdmin.length > 0) {
                        transaction[0].name_banking_admin = getBankingAdmin[0].name_banking
                        transaction[0].number_banking_admin = getBankingAdmin[0].number_banking
                        transaction[0].owner_banking_admin = getBankingAdmin[0].owner_banking
                        success(res, "Get transaction deposit success", transaction[0])
                    } else {
                        error_400(res, "Transaction delete to admin", 2)
                    }
                } else {
                    error_400(res, "User is not transaction", 1)
                }
            }
            next()
        } catch (error) {
            //console.log(error, "abc");
            error_500(res)
            next()
        }
    },
    cancelTransactionDepositVnd: async function (req, res, next) {
        try {
            const {
                idTransaction
            } = req.body
            const flag = validationBody({
                idTransaction
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const idUser = req.user
            if (idUser) {
                //console.log(idUser);
                const transaction = await getRowToTable(`tb_banking_transaction`, ` userid=${idUser} AND id=${idTransaction}`)
                if (transaction.length > 0) {
                    await updateRowToTable(`tb_banking_transaction`, `type_user=2`, `id=${idTransaction} AND userid=${idUser}`)
                    success(res, "Cancel transaction success")
                } else {
                    error_400(res, "User is not transaction", 1)
                }
            }
            next()
        } catch (error) {
            console.log(error, "abc");
            error_500(res)
            next()
        }
    },
    activeDepositVNDAdmin: async function (req, res, next) {
        try {
            const {
                id
            } = req.body
            var data = await getRowToTable(`tb_banking_transaction`, `id=${id}`)
            if (data.length > 0) {
                if (data[0].type_admin != 1) {
                    await updateRowToTable(`tb_banking_transaction`, `type_admin=1,type_user=1`, `id=${id}`)
                    // const getVNDToUSD = await getRowToTable(`tb_config`, `name='USD'`)
                    const amount = data[0].amount / data[0].percent
                    await updateRowToTable(`tb_user`, `balance=balance+${amount}`, `id=${data[0].userid}`)
                    success(res, "Active success !")
                } else {
                    error_400(res, "This order has been confirmed!")
                }
            } else {
                error_400(res, "Transaction is not exit")
            }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }

    },
    cancelDepositVNDAdmin: async function (req, res, next) {
        try {
            const {
                id, note
            } = req.body
            var data = await getRowToTable(`tb_banking_transaction`, `id=${id}`)
            if (data.length > 0) {
                if (data[0].type_admin != 1) {
                    await updateRowToTable(`tb_banking_transaction`, `type_admin=3,type_user=3,note='${note}'`, `id=${id}`)
                    success(res, "Rejected deposit order successfully !")
                } else {
                    error_400(res, "This order has been confirmed!")
                }
            } else {
                error_400(res, "Transaction is not exit")
            }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }

    },

    // if(type_admin ==0 && type_user==0){
    //     /// user vừa tạo lệnh nạp tiền đang chờ user xác nhận nạp thành công hoặc hủy
    // }else if (type_admin ==0 && type_user==2){
    /// user hủy lệnh rút tiền
    // }else if (type_admin ==2 && type_user==0){
    /// user xác nhận đã chuyển tiền, Chờ admin xét duyệt
    // }else if (type_admin ==3){
    /// admin cancel lệnh nạp tiền
    // }else if (type_admin ==1){
    /// admin đã xét duyệt lệnh nạp tiền thành công
    // }

    verifyTransactionDepositVnd: async function (req, res, next) {
        try {
            const {
                idTransaction
            } = req.body
            const flag = validationBody({
                idTransaction
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const idUser = req.user
            if (idUser) {
                const transaction = await getRowToTable(`tb_banking_transaction`, `userid=${idUser} AND id=${idTransaction}`)
                if (transaction.length > 0) {
                    await updateRowToTable(`tb_banking_transaction`, `type_admin=2`, `id=${idTransaction} AND userid=${idUser}`)
                    success(res, "Confirmation of successful transfer")
                } else {
                    error_400(res, "User is not transaction", 1)
                }
            }
        } catch (error) {
            //console.log(error, "abc");
            error_500(res)
        }
    },
    historyDepositVnd: async function (req, res, next) {
        try {
            const {
                limit,
                page
            } = req.body
            const flag = validationBody({
                limit,
                page
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const idUser = req.user
            if (idUser) {
                const package = await getRowToTable(`tb_banking_transaction`, `userid=${idUser} ORDER by created_at DESC  LIMIT ${limit * (page - 1)},${limit}`)
                const allPackage = await getRowToTable(`tb_banking_transaction`, `userid=${idUser}`)
                if (package.length > 0) {
                    for await (pack of package) {
                        // console.log(pack.createTime.getDate(), i);
                        pack.created_at = new Date(pack.created_at)
                        let day = pack.created_at.getDate();
                        let month = pack.created_at.getMonth() + 1;
                        let year = pack.created_at.getFullYear();
                        var hours = pack.created_at.getHours();
                        var minutes = pack.created_at.getMinutes();
                        var seconds = pack.created_at.getSeconds();
                        pack.created_at = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
                    }
                }

                const obj = {
                    array: package,
                    total: allPackage.length
                }
                success(res, "get list history deposit vnd success!", obj)
            }
        } catch (error) {
            //console.log(error, "abc");
            error_500(res)
        }
    },
    historyDepositVndAdmin: async function (req, res, next) {
        try {
            const {
                limit,
                page
            } = req.body
            const flag = validationBody({
                limit,
                page
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const idUser = req.user
            if (idUser) {
                const package = await getRowToTable(`tb_banking_transaction`, `userid!=-2 ORDER by created_at DESC  LIMIT ${limit * (page - 1)},${limit}`)
                const allPackage = await getRowToTable(`tb_banking_transaction`)
                if (package.length > 0) {
                    for await (pack of package) {
                        // console.log(pack.createTime.getDate(), i);
                        pack.created_at = new Date(pack.created_at)
                        let day = pack.created_at.getDate();
                        let month = pack.created_at.getMonth() + 1;
                        let year = pack.created_at.getFullYear();
                        var hours = pack.created_at.getHours();
                        var minutes = pack.created_at.getMinutes();
                        var seconds = pack.created_at.getSeconds();
                        pack.created_at = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
                    }
                }

                const obj = {
                    array: package,
                    total: allPackage.length
                }
                success(res, "get list history deposit vnd success!", obj)
            }
        } catch (error) {
            //console.log(error, "abc");
            error_500(res)
        }
    },
    createDepositVND: async function (req, res, next) {
        try {
            const {
                idBanking,
                amount,
                message
            } = req.body
            const flag = validationBody({
                idBanking,
                amount,
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const idUser = req.user
            if (idUser) {
                const transaction = await getRowToTable(`tb_banking_transaction`, `userid=${idUser} AND type_user=0`)
                if (transaction.length == 0) {
                    if (amount >= 100000) {
                        const banking = await getRowToTable(`tb_banking_admin`, `id=${idBanking}`)
                        if (banking.length > 0) {
                            const bankingList = await getRowToTable(`tb_banking_admin`, `name_banking = '${banking[0].name_banking}'`)
                            if (bankingList.length > 0) {
                                var i = Math.floor(Math.random() * bankingList.length);
                                // const id = crypto.randomBytes(6).toString("hex");
                                var strId = message
                                const user = await getRowToTable(`tb_user`, `id=${idUser}`)
                                const percent = await getRowToTable(`tb_config`, `name="USD"`)
                                const obj = {
                                    bank_name: bankingList[i].name_banking,
                                    amount: parseFloat(amount),
                                    percent: percent[0].value,
                                    id_banking_admin: bankingList[i].id,
                                    userid: idUser,
                                    code_unique: strId
                                }
                                await addRowToTable(`tb_banking_transaction`, obj)
                                await messageTelegram(`[DEPOSIT VND] [${strId}] User ${user[0].userName} deposit ${parseFloat(amount)} VND [PENDING]!`)
                                await messageTelegram(`=============================================`)
                                success(res, "Create Deposit VNĐ success!")
                            } else {
                                error_400(res, "Banking Name is not define", 5)
                            }
                        } else {
                            error_400(res, "Banking is not define", 4)
                        }
                    } else {
                        error_400(res, "cannot deposit less than 100000 VND", 6)
                    }
                } else {
                    error_400(res, "You have a pending transaction can't add a transaction", 9)
                }

            } else {
                error_400(res, "User is not define 1", 3)


            }
            next()
        } catch (error) {
            console.log(error, "abc");
            error_500(res)
            next()
        }
    },
    uploadImageDeposiVND: async (req, res) => {
        try {
            const {
                userid,
                idTransaction
            } = req.body
            if (userid) {
                //console.log(req.file);
                if (req.file != undefined) {
                    const transaction = await getRowToTable(`tb_banking_transaction`, `id=${idTransaction}`)
                    if (transaction.length > 0) {
                        var front = `images/${req.file.filename}`
                        await updateRowToTable(`tb_banking_transaction`, `images='${front}'`, `id=${idTransaction}`)
                        success(res, "Post proof of success!")
                    } else {
                        error_400(res, "transaction is not define", 1)
                    }

                } else {
                    error_400(res, "Images cannot be left blank", 2)

                }
            } else {
                error_400(res, "userid is not define!", 1)
            }
            // else if (flag[0].verified == 4) { }




        } catch (error) {
            console.log(error, "zxc");
            error_500(res, error)
        }
    },
    getBanking: async (req, res) => {
        const banking = await getRowToTable(`tb_banking_admin`)
        let array = []
        for await (bank of banking) {
            //console.log(bank);
            let flag = false
            array.forEach(e => {
                if (e.name_banking == bank.name_banking) {
                    flag = true
                }
            })
            if (!flag) {
                array.push(bank)
            }
        }
        success(res, "Get list banking to success!", array)
    },
    getAllBanking: async (req, res) => {
        const banking = await getRowToTable(`tb_banking_admin`)
        success(res, "Get list banking to success!", banking)
    },
    addBankingAdmin: async (req, res) => {
        try {
            const { name_banking, number_banking, owner_banking } = req.body
            const obj = { name_banking, number_banking, owner_banking }
            await addRowToTable(`tb_banking_admin`, obj)
            success(res, "Successfully added bank account!")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    editBankingAdmin: async (req, res) => {
        try {
            const { name_banking, number_banking, owner_banking, id } = req.body
            await updateRowToTable(`tb_banking_admin`, `name_banking='${name_banking}',number_banking='${number_banking}',owner_banking='${owner_banking}'`, `id=${id}`)
            success(res, "Successfully update bank account!")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    deleteBankingAdmin: async (req, res) => {
        try {
            const { id } = req.body
            await deleteRowToTable(`tb_banking_admin`, `id=${id}`)
            success(res, "Successfully delete bank account!")
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },

    ///// widthdraw
    deleteBankingUser: async function (req, res, next) {
        //console.log(req.body);
        //console.log(req.user);
        try {
            const {
                id,
            } = req.body
            // database :  user_id, package_id, created_at,
            // amount
            const idUser = req.user
            if (idUser) {
                await customerQuery.deleteBankingUserToIdUser(id, idUser)
                success(res, "Account number deleted successfully")

            }
            next()
        } catch (error) {
            console.log(error);


            error_500(res, error)
            next()
        }
    },
    addListBanking: async function (req, res, next) {
        //console.log(req.body);
        //console.log(req.user);
        try {
            const {
                owner_banking,
                name_banking,
                number_banking
            } = req.body
            const flag = validationBody({
                owner_banking,
                name_banking,
                number_banking
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            // database :  user_id, package_id, created_at,
            // amount
            const idUser = req.user
            if (idUser) {
                // tb_banking_user WHERE userid= ${id}
                const bankingUser = await getRowToTable(`tb_banking_user`, `userid=${idUser}`)
                if (bankingUser.length <= 0) {
                    const obj = {
                        owner_banking,
                        name_banking,
                        number_banking,
                        userid: idUser
                    }
                    await addRowToTable(`tb_banking_user`, obj)
                    success(res, "Successfully added account number!")
                } else {
                    error_400(res, "You can only add a bank account once", 1)
                }

            }
            next()
        } catch (error) {
            console.log(error);

            error_500(res, error)
            next()
        }
    },
    getBankingUser: async function (req, res, next) {
        //console.log(req.body);
        //console.log(req.user);
        try {
            const idUser = req.user
            const bankingUser = await getRowToTable(`tb_banking_user`, `userid=${idUser}`)
            if (bankingUser.length <= 0) error_400(res, "user is not update banking")
            success(res, "get list banking success", bankingUser[0])
        } catch (error) {
            console.log(error);


            error_500(res, error)
            next()
        }
    },
    getAllBankingUserAdmin: async function (req, res, next) {
        //console.log(req.body);
        //console.log(req.user);
        try {
            const { limit, page } = req.body
            const bankingUser = await getListLimitPage(`tb_banking_user`, limit, page)
            success(res, "get list banking success", bankingUser)
        } catch (error) {
            console.log(error);


            error_500(res, error)
            next()
        }
    },
    updateBankingUserAdmin: async function (req, res, next) {
        //console.log(req.body);
        //console.log(req.user);
        try {
            const {
                owner_banking,
                name_banking,
                number_banking,
                idBanking
            } = req.body
            const flag = validationBody({
                owner_banking,
                name_banking,
                number_banking,
                idBanking
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            // database :  user_id, package_id, created_at,
            // amount
            const idUser = req.user
            if (idUser) {
                // tb_banking_user WHERE userid= ${id}
                await updateRowToTable(`tb_banking_user`, `owner_banking='${owner_banking}',name_banking='${name_banking}',number_banking='${number_banking}'`, `id=${idBanking}`)
                success(res, "Successfully update account number!")
            }
            next()
        } catch (error) {
            console.log(error);

            error_500(res, error)
            next()
        }
    },
    updateBankingUser: async function (req, res, next) {
        //console.log(req.body);
        //console.log(req.user);
        try {
            const {
                owner_banking,
                name_banking,
                number_banking,
                idBanking
            } = req.body
            const flag = validationBody({
                owner_banking,
                name_banking,
                number_banking,
                idBanking
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            // database :  user_id, package_id, created_at,
            // amount
            const idUser = req.user
            if (idUser) {
                const banking = await getRowToTable(`tb_banking_user`, `id=${idBanking}`)
                if (banking.length <= 0) return error_400(res, "banking is not define")
                if (banking[0].userid != idUser) return error_400(res, "user is not define")
                await updateRowToTable(`tb_banking_user`, `owner_banking='${owner_banking}',name_banking='${name_banking}',number_banking='${number_banking}'`, `id=${idBanking}`)

                // tb_banking_user WHERE userid= ${id}
                success(res, "Successfully update account number!")
            }
            next()
        } catch (error) {
            console.log(error);

            error_500(res, error)
            next()
        }
    },
    deleteBankingUserAdmin: async function (req, res, next) {
        //console.log(req.body);
        //console.log(req.user);
        try {
            const {
                id
            } = req.body

            // database :  user_id, package_id, created_at,
            // amount
            const idUser = req.user
            if (idUser) {
                // tb_banking_user WHERE userid= ${id}
                await deleteRowToTable(`tb_banking_user`, `id=${id}`)
                success(res, "Successfully update account number!")
            }
            next()
        } catch (error) {
            console.log(error);

            error_500(res, error)
            next()
        }
    },
    widthdrawVND: async function (req, res, next) {
        //console.log(req.body);
        //console.log(req.user);
        try {
            const {
                amount,
            } = req.body


            // database :  user_id, package_id, created_at,
            // amount
            const userid = req.user
            if (userid) {
                // tb_banking_user WHERE userid= ${id}
                const bankingUser = await getRowToTable(`tb_banking_user`, `userid=${userid}`)
                if (bankingUser.length > 0) {

                    const vndToUsdQuery = await getRowToTable(`tb_config`, `name='USD'`)
                    const user = await getRowToTable(`tb_user`, `id=${userid}`)
                    const vndToUsd = vndToUsdQuery[0].value
                    const amountBalance = parseFloat(amount) / (vndToUsd * 0.75)
                    const flagBalance = await checkBalanceStr(amountBalance, userid, `balance`)
                    if (!flagBalance.status) {
                        return error_400(res, "Insufficient balance")
                    }
                    const feeWidthDraw = 0.2 /// 20%
                    const obj = {
                        userid,
                        userName: user[0].userName,
                        email: user[0].email,
                        amount,
                        cost: vndToUsd,
                        feeWidthdraw: feeWidthDraw,
                        ownerBanking: bankingUser[0].owner_banking,
                        nameBanking: bankingUser[0].name_banking,
                        numberBanking: bankingUser[0].number_banking,
                    }
                    await addRowToTable(`tb_widthdraw_vnd`, obj)
                    await updateRowToTable(`tb_user`, `balance=balance-${amountBalance}`, `id=${userid}`)

                    success(res, "Successful withdrawal order, please wait for admin to censor")
                } else {
                    error_400(res, "You must add a bank account", 1)
                }

            }
            next()
        } catch (error) {
            console.log(error);

            error_500(res, error)
            next()
        }
    },
    getHistoryWidthdraw: async function (req, res, next) {
        //console.log(req.body);
        //console.log(req.user);
        try {
            const { limit, page } = req.body
            const userid = req.user
            const bankingUser = await getListLimitPage(`tb_widthdraw_vnd`, limit, page, `userid=${userid}`)
            success(res, "get list history success", bankingUser)
        } catch (error) {
            console.log(error);


            error_500(res, error)
            next()
        }
    },
    getHistoryWidthdrawAdmin: async function (req, res, next) {
        //console.log(req.body);
        //console.log(req.user);
        try {
            const { limit, page } = req.body
            const userid = req.user
            const bankingUser = await getListLimitPage(`tb_widthdraw_vnd`, limit, page)
            success(res, "get list history success", bankingUser)
        } catch (error) {
            console.log(error);


            error_500(res, error)
            next()
        }
    },
    comfirmWidthdrawVnd: async function (req, res, next) {
        //console.log(req.body);
        //console.log(req.user);
        try {
            const { id } = req.body
            const dataWidthdraw = await getRowToTable(`tb_widthdraw_vnd`, `id=${id} AND type=2`)
            if (dataWidthdraw.length <= 0) return error_400(res, "widthdraw is not define")
            const amountUSD = parseFloat(dataWidthdraw[0].amount) / parseFloat(dataWidthdraw[0].cost)
            await updateRowToTable(`tb_widthdraw_vnd`, `type=1`, `id=${id}`)
            await updateStatusBalance(dataWidthdraw[0].userid, `widthdraw`, amountUSD, `-`)
            success(res, "Successful withdrawal confirmation")
        } catch (error) {
            console.log(error);
            error_500(res, error)
            next()
        }
    },
    cancelWidthdrawVnd: async function (req, res, next) {
        try {
            const { id } = req.body
            const dataWidthdraw = await getRowToTable(`tb_widthdraw_vnd`, `id=${id} AND type=2`)
            if (dataWidthdraw.length <= 0) return error_400(res, "widthdraw is not define")
            const amountUSD = parseFloat(dataWidthdraw[0].amount) / parseFloat(dataWidthdraw[0].cost * 0.75)
            await updateRowToTable(`tb_user`, `balance=balance+${amountUSD}`, `id=${dataWidthdraw[0].userid}`)
            await updateRowToTable(`tb_widthdraw_vnd`, `type=0`, `id=${id}`)
            success(res, "Refused to withdraw successfully")
        } catch (error) {
            error_500(res, error)
        }
    }
    // widthdrawVND: async function (req, res, next) {
    //     try {
    //         const {
    //             idBanking,
    //             amount
    //         } = req.body
    //         const flag = validationBody({
    //             idBanking,
    //             amount
    //         })
    //         if (flag.length > 0) return error_400(res, 'Not be empty', flag)
    //         const idUser = req.user
    //         if (idUser) {
    //             //console.log(idUser);
    //             const wallet = await getRowToTable(`tb_user`,`id=${idUser}`)
    //             if (wallet.length > 0) {
    //                 if (amount > 0) {
    //                     if (amount <= wallet[0].amount) {
    //                         const banking = await getRowToTable(`tb_banking_user`,`userid= ${idUser} AND id=${idBanking}`)
    //                         if (banking.length > 0) {
    //                             const amountUser = wallet[0].amount - amount
    //                             //////////////////////// endddd widthdraw //////////////////////////////////////////////
    //                             await customerQuery.updateBalance(idUser, amountUser, `VND`)
    //                             //////////////////////// feeeeee 0
    //                             var withdraw_pay_percent = 50
    //                             var amount_pay_by_coin_key = amount * 0.5
    //                             const id = crypto.randomBytes(6).toString("hex");
    //                             const user = await customerQuery.getUserToId(idUser)
    //                             await customerQuery.addWidthDrawvnd(idUser, `vnd`, `vnd_balance`, amount, banking[0].number_banking, withdraw_pay_percent, amount_pay_by_coin_key, amount_pay_by_coin_key, 0, amount, 0.1, 0.1, 0, banking[0].name_banking, banking[0].owner_banking, banking[0].number_banking, banking[0].name_banking, id)
    //                             // console.log(`[WITHDRAWAL VND] User ${user[0].username} withdraw ${amount} VNĐ [PENDING]`);
    //                             // await messageTelegram(`User ${user[0].username} withdraw ${amount} VND `)
    //                             await messageTelegram(`=============================================`)
    //                             await messageTelegram(`[WITHDRAWAL VND] User ${user[0].username} withdraw ${amount} VND [PENDING]`)
    //                             await messageTelegram(`[WITHDRAWAL VND] Account number : ${banking[0].number_banking} `)
    //                             await messageTelegram(`[WITHDRAWAL VND] Bank name : ${banking[0].name_banking} `)
    //                             await messageTelegram(`[WITHDRAWAL VND] Account holder : ${banking[0].owner_banking} `)
    //                             // banking[0].name_banking, banking[0].owner_banking,
    //                             await messageTelegram(`=============================================`)
    //                             success(res, "Withdrawal successful")
    //                         } else {
    //                             error_400(res, "Banking is not define!")
    //                         }


    //                     } else {
    //                         error_400(res, "Invalid balance", 6)
    //                     }
    //                 } else {
    //                     error_400(res, "Invalid quantity", 5)
    //                 }
    //             } else {
    //                 error_400(res, "Wallet is not define", 4)


    //             }
    //         } else {
    //             error_400(res, "User is not define 1", 3)


    //         }
    //     } catch (error) {
    //         console.log(error, "EROR");
    //         error_500(res)
    //     }
    // }

}