const { convertTimeToString, validationBody, getPriceSell, getPriceSiring, validationUserName, deleteProfileObj, getTokenLogin, messageTelegram, getStartWeekAndLastDay } = require("../commons");
const { getListLimitPage, getListLimitPageHistory } = require("../commons/request");
const { dogeWarInstance } = require("../contract");
const { success, error_400, error_500 } = require("../message");
const { getRowToTable, addRowToTable, updateRowToTable, addRowToTableBalance, addRowToTableBalanceDemo } = require("../queries/customerQuery");
const md5 = require('md5')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const otplib = require('otplib')
const {
    authenticator
} = otplib
const crypto = require("crypto");
const { balance, createWallet } = require("../lib/coinpayment");
const { existsRedis, getRedis, setnxRedis, incrbyRedis, delRedis } = require("../model/model.redis");
const customerQuery = require("../queries/customerQuery");
const { sendMail, sendMailForgotPassword, sendMailMessage } = require("../sockets/functions/verifyEmail");
const { getWallet } = require("../commons/remitano");
const { getDataOfUserId, totalMemberRef } = require("../commons/binaryOption");
const { createWalletBEP20 } = require("../middlewares/web3");
async function getParentToIdUser(arrayUser, number) {
    // number = số tầng
    if (arrayUser.length > 0) {
        let array = []
        for await (user of arrayUser) {
            deleteProfileObj(user)
            user.array = []
            const arrayF1 = await getRowToTable(`tb_user`, `parentId=${user.id}`)
            number++;
            user.array = await getParentToIdUser(arrayF1, number)
        }
        return arrayUser
    }
}
async function getParentToIdUserList(arrayUser, arrayList, arrayPromise) {
    // / = số tầng
    try {
        if (arrayUser.length > 0) {
            let array = []
            for await (user of arrayUser) {
                deleteProfileObj(user)
                user.array = []
                const arrayF1 = await getRowToTable(`tb_user`, `parentId=${user.id}`)
                if (arrayF1.length > 0) {
                    for (let userF of arrayF1) {
                        arrayPromise.push(getDataOfUserId(userF.id, userF))
                    }
                }
                await getParentToIdUserList(arrayF1, arrayList, arrayPromise)
                arrayList.push(...arrayF1)
            }
        }
    } catch (error) {
        console.log(error, "getParentToIdUserList");
    }
}
const opts = {
    errorEventName: 'error',
    logDirectory: `${__dirname}/log`,
    fileNamePattern: 'log.txt',
    dateFormat: 'YYYY.MM.DD'
};
const log = require('simple-node-logger').createRollingFileLogger(opts);

module.exports = {
   
    signUp: async function (req, res, next) {
        try {
            const {
                referral,
                email,
                password,
                userName
            } = req.body
            const flag = validationBody({
                referral,
                email,
                password,
                userName
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            // check mã giới thiệu
            const ref = await getRowToTable(`tb_user`, `referral='${referral}'`)
            if (ref.length <= 0) return error_400(res, "Referral code does not exist!", 19)
            // check username
            if (validationUserName(userName)) return error_400(res, "User Name cannot contain special characters!", 18)
            const user = await getRowToTable(`tb_user`, `userName='${userName}'`)
            /// kiểm tra userName tồn tại hay chưa
            if (user.length > 0) return error_400(res, "Username already exists !", 2)
            const emailAccount = await getRowToTable(`tb_user`, `email='${email}'`)

            if (ref[0].active != 1) return error_400(res, "User is not activated yet !", 9)
            /// kiểm tra country có tồn tại hay không
            // const getCountry = await customerQuery.getCountryToUserName(country)
            // if (getCountry.length > 0) return error_400(res, "Country already exists !", 13)

            /// kiểm tra email tồn tại hay chưa
            if (emailAccount.length > 0) return error_400(res, "Email already exists !", 7)
            const idReferral = crypto.randomBytes(3).toString("hex");
            const passwordMd5 = md5(password)

            const data = {
                userName,
                email,
                password: passwordMd5,
                userNameParent: ref[0].userName,
                parentId: ref[0].id,
                referral: idReferral,
                // active: 1
            }

            const dataAdd = await addRowToTable(`tb_user`, data)
            const userSusscess = await getRowToTable(`tb_user`, `id=${dataAdd.rows.insertId}`)
            /// thống kê sàn BO
            await addRowToTableBalance(dataAdd.rows.insertId, userName, email, 0, 0)
            await addRowToTableBalanceDemo(dataAdd.rows.insertId, userName, email, 0, 0)
            //// user
            let cusObj = userSusscess[0]
            let token = jwt.sign({
                cusObj
            }, process.env.JWT, {
                expiresIn: 60 * 518400
            });
            // userSusscess[0].token = token
            delete userSusscess[0].password
            // const dataWalletUSDT = {
            //     code : 'USDT',
            //     username :  userSusscess[0].userName,
            //     userid : userSusscess[0].id
            // }
            // const dataWalletBUSD = {
            //     code : 'BUSD',
            //     username :  userSusscess[0].userName,
            //     userid : userSusscess[0].id
            // }
            // await addRowToTable(`tb_wallet_code`,dataWalletBUSD)
            // await addRowToTable(`tb_wallet_code`,dataWalletUSDT)
            // await updateRowToTable(`tb_user`, `totalMember=totalMember+1`, `id=${ref[0].id}`)

            // ref
            await sendMail(email, `ACTIVATION CONFIRMATION | ${process.env.SERVICENAME}`, userName, password, token)
            success(res, "Please check your email !", userSusscess)


        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    checkUser2fa: async function (req, res, next) {
        try {
            const {
                email
            } = req.body
            if (email) {
                const user = await getRowToTable(`tb_user`, `email='${email}'`)
                if (user.length > 0) {
                    if (user[0].twofa == 1) {
                        success(res, "Please verify 2fa")
                    } else {
                        error_400(res, "No need to verify yourself 2fa")
                    }
                } else {
                    error_400(res, "No need to verify yourself 2fa")
                }
            } else {
                error_400(res, "UserName is not emty!", 1)
            }

        } catch (error) {
            console.log(error);
            error_500(res, error)
        }

    },
    login: async function (req, res, next) {
        try {
            const { email, password, otp } = req.body
            const io = req.io
            const flag = validationBody({
                email, password
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const passwordMd5 = md5(password)
            const data = await getRowToTable(`tb_user`, `email='${email}' AND password='${passwordMd5}'`)
            if (data.length <= 0) return error_400(res, "Incorrect account or password!")

            if (data[0].active != 1) return error_400(res, "This account is not activated yet", 3)
            ////check2fa
            if (data[0].twofa == 1) {
                const secret = data[0].secret
                var token = otp
                let a = authenticator.verify({
                    token,
                    secret
                })
                if (a) {
                    await getTokenLogin(data[0])
                    deleteProfileObj(data[0])
                    io.to(`${data[0].id}`).emit('logout', "obj");
                    success(res, 'Logged in successfully', data[0])
                } else {
                    error_400(res, "Incorrect code! ", 11)
                }
            } else {
                await getTokenLogin(data[0])
                deleteProfileObj(data[0])
                io.to(`${data[0].id}`).emit('logout', "obj");
                success(res, 'Logged in successfully', data[0])
            }

            //end check2fa


        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getReferral: async function (req, res, next) {
        try {
            const data = await getRowToTable(`tb_user`, `id=1`)
            success(res, "Get Referral success", data[0].referral)
        } catch (error) {
            error_500(res, error)
        }
    },
    getCountry: async (req, res, next) => {
        try {
            const data = await getRowToTable(`country`)
            success(res, "get country success", data)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sendmailforgetpassword: async (req, res) => {
        const {
            email
        } = req.body
        const user = await getRowToTable(`tb_user`, `email='${email}'`)
        if (user.length > 0) {
            let token = await getTokenLogin(user[0])

            await sendMailForgotPassword(user[0].email, `Forget Password ${process.env.HOST}`, user[0].userName, user[0].token)
            success(res, "Please check your email!")
        } else {
            error_400(res, "Email is not define", 1)
        }
    },
    forgetPassword: async (req, res, next) => {
        try {
            const userid = req.user
            const { newPassword } = req.body
            const flag = validationBody({
                newPassword
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            await updateRowToTable(`tb_user`, `password='${md5(newPassword)}'`, `id=${userid}`)
            success(res, 'Change password successfully')

        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    // getParentToIdUserList
    getParentList: async (req, res, next) => {
        try {
            const { userid } = req.body
            const flag = validationBody({
                userid
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const arrayList = []
            const listUserF1 = await getRowToTable(`tb_user`, `parentId=${userid}`)
            const arrayPromise = []
            for (let user of listUserF1) {
                arrayPromise.push(getDataOfUserId(user.id, user))
            }
            arrayList.push(...listUserF1)
            await getParentToIdUserList(listUserF1, arrayList, arrayPromise)
            await Promise.all(arrayPromise)
            success(res, 'Get parent success', arrayList)

        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getParent: async (req, res, next) => {
        try {
            const { userid } = req.body
            const flag = validationBody({
                userid
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)

            const profileUser = await getRowToTable(`tb_user`, `id=${userid}`)
            const listUserF1 = await getRowToTable(`tb_user`, `parentId=${userid}`)
            const array = await getParentToIdUser(listUserF1, 0)
            const data = {
                data: array,
                profile: {
                    userName: profileUser[0].userName,
                    email: profileUser[0].email
                },
            }
            success(res, 'Get parent success', data)

        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    changePassword: async (req, res, next) => {
        try {
            const userid = req.user
            const { password, newPassword } = req.body
            const flag = validationBody({
                password, newPassword
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const passwordMd5 = md5(password)
            console.log("ok");

            const profileUser = await getRowToTable(`tb_user`, `id=${userid} AND password='${passwordMd5}'`)
            if (profileUser.length <= 0) return error_400(res, "Incorrect password!")

            await updateRowToTable(`tb_user`, `password='${md5(newPassword)}'`, `id=${userid}`)
            success(res, 'Change password successfully')

        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getProfile: async (req, res, next) => {
        try {
            const userid = req.user
            const profileUser = await getRowToTable(`tb_user`, `id=${userid}`)
            if (profileUser.length <= 0) return error_400(res, "Incorrect password!")
            deleteProfileObj(profileUser[0])
            success(res, 'get Profile success', profileUser[0])

        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getProfileToId: async (req, res, next) => {
        try {
            const { userid } = req.body
            const profileUser = await getRowToTable(`tb_user`, `id=${userid}`)
            if (profileUser.length <= 0) return error_400(res, "Incorrect password!")
            deleteProfileObj(profileUser[0])
            success(res, 'get Profile success', profileUser[0])

        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    kycUser: async function (req, res, next) {
        try {
            const {
                userid,
                firstname,
                lastname,
                gender,
                passport,
                country,
                phone
            } = req.body
            const flag = validationBody({
                userid,
                firstname,
                lastname,
                gender,
                passport,
                country,
                phone
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const flagKyc = await getRowToTable(`tb_user_kyc`, `userid=${userid} `)

            if (flagKyc.length > 0) return error_400(res, "users who have updated KYC please wait for admin to approve", "error")
            const flagPassport = await getRowToTable(`tb_user_kyc`, `passport=${passport}`)

            if (flagPassport > 0) return error_400(res, "This ID Card is being used for verification", "error")

            const user = await getRowToTable(`tb_user`, `id=${userid}`)
            var front = `/images/${req.files[0].filename}`
            var back = `/images/${req.files[1].filename}`
            var sefie = `/images/${req.files[2].filename}`
            const data = {
                userid,
                firstname,
                lastname,
                gender,
                country,
                passport,
                front_image: front,
                back_image: back,
                selfie_image: sefie,
                phone,
                userName: user[0].userName,
                email: user[0].email,
            }
            await addRowToTable(`tb_user_kyc`, data)
            const objNotification = {
                title: `Verify your KYC is successful!`,
                detail: `Your identity verification has been sent. Please wait at least 7 working days`,
                type: 13,
                userid
            }
            await addRowToTable(`tb_notification`, objNotification)
            success(res, "Verify your KYC is successful!", {
                ok: "yes"
            })
        } catch (error) {
            console.log(error, "zxc");
            error_500(res, error)
        }
    },

    uploadAvatar: async function (req, res, next) {
        try {
            const {
                userid,
            } = req.body
            const flag = validationBody({
                userid
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            if (!req.file) return error_400(res, "Please update the image")
            var front = `/images/${req.file.filename}`
            await updateRowToTable(`tb_user`, `avatar='${front}'`, `id=${userid}`)
            success(res, "Avatar update successful", {
                ok: "yes"
            })
        } catch (error) {
            console.log(error, "zxc");
            error_500(res, error)
        }
    },
    checkKycUser: async function (req, res, next) {
        try {
            const userid = req.user
            const flagKyc = await getRowToTable(`tb_user_kyc`, `userid=${userid}`)
            if (flagKyc.length <= 0) return error_400(res, "user is not kyc", "error")
            success(res, 'get data success', flagKyc[0].kyc_status)
            // APPROVED
            // PENDING
            // CANCEL

        } catch (error) {
            error_500(res, error)
        }
    },
    generateOTPToken: async function (req, res, next) {
        try {
            const idUser = req.user
            const profileUser = await getRowToTable(`tb_user`, `id=${idUser}`)
            if (profileUser.length <= 0) return error_400(res, "Retrieving OTP Auth failed ! ", 2)

            if (profileUser[0].twofa == 1) return error_400(res, "The user has turned on 2fa", 10)
            const secret = authenticator.generateSecret()
            const username = profileUser[0].userName
            const flag = await updateRowToTable(`tb_user`, `secret='${secret}'`, `id=${idUser}`)
            const otpAuth = authenticator.keyuri(username, process.env.SERVICENAME, secret)
            success(res, "Get OTP Auth successfully ! ", {
                otpAuth,
                secret
            })
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    depositCoin: async function (req, res, next) {
        try {
            const data = req.body
            const hmac = req.headers.hmac
            //console.log("Headers hmac: ", hmac)
            //console.log("Body request: ", data)
            const ipn_type = data.ipn_type
            const status_response = +data.status
            if (status_response >= 100 && ipn_type == 'deposit') {
                var address = data.address;
                // var currency = data.currency;
                let walletRaws
                if (data.dest_tag) {
                    walletRaws = await getRowToTable(`tb_wallet_code`, `address='${address}' AND label='${data.dest_tag}'`)
                } else {
                    walletRaws = await getRowToTable(`tb_wallet_code`, `address='${address}'`)
                }
                if (walletRaws.length > 0) {
                    let quantity = data.amount
                    let code = data.currency
                    let txhash = data.txn_id
                    let symbol = code + "USDT";
                    let userid = walletRaws[0].userid
                    const transaction = await getRowToTable(`blockchain_log`, `hash='${txhash}'`)
                    // const flag = await validationDepositCoin(code, quantity)
                    // if (!flag) return error_400(res, `error amount`)
                    if (transaction.length > 0) {
                        //console.log("coinpayment  hoat dong nhung ton tai txhash ssssssssss")
                        var message = `- Sàn: *BEEMARKET*\n- *Tracking coinpayments webhook deposit*\nCó một giao dịch bị trùng txhash lúc deposit\n=>Txhash: ${txhash}`;
                        return error_400(res, message, 2)
                        //   botTelegram.sendMessage(message);
                    }
                    if (code == 'USDT.ERC20' || code == 'USDT.TRC20' || code == "USDT.BEP20" || code == "BUSD" || code == "BUSD.BEP20") {
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
                        await messageTelegram(`[DEPOSIT] User ${user[0].userName} deposit ${parseFloat(quantity).toFixed(6)} ${code} success. Txhash: ${txhash}`)
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

                        // try {
                        //     await sendMailDepositCoinpayment(user[0].email, '[SWAPTOBE DEPOSIT] ' + user[0].username + ': ' + quantity + ' ' + code, user[0].username, quantity, code, txhash)
                        // } catch { }
                        success(res, "update wallet success !!")
                    }
                } else {
                    error_400(res, "Cannot find wallet " + address, 1)
                }
                // coinpayment.verifyDeposit(async (hmac, data, isVerify) => {
                //   //console.log("coinpayment  hoat dong xxxxxxxxxxxxxx")
                //     if (isVerify) {

                //         ///////////////////////

                //     } else {
                //       //console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - BEEMARKET - Coinpayments send deposit IsValid")
                //     }
                // })
            } else {
                error_400(res, "Data is not define")
            }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    turn2FA: async function (req, res, next) {
        try {
            const idUser = req.user
            const profileUser = await getRowToTable(`tb_user`, `id=${idUser}`)
            if (profileUser.length <= 0) return error_400(res, "Retrieving OTP Auth failed ! ", 2)
            const flag2FA = profileUser[0].twofa == 1 ? 0 : 1
            const message = profileUser[0].twofa == 1 ? 'Turn off 2FA successfully' : "Successfully enabled 2FA ! "
            const objNotification = {
                title: message,
                detail: message,
                type: flag2FA == 0 ? 9 : 10,
                userid: idUser
            }
            await addRowToTable(`tb_notification`, objNotification)
            await updateRowToTable(`tb_user`, `${flag2FA == 0 ? `twofa=${flag2FA}, secret=NULL` : `twofa=${flag2FA}`}`, `id=${idUser}`)
            success(res, message)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    createWallet: async function (req, res, next) {
        try {
            const {
                symbol,
            } = req.body
            const flag = validationBody({
                symbol
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const userid = req.user
            if (symbol) {
                if (symbol == "USDT_TRC20") {
                    symbol == "USDT.TRC20"
                }
                ////redis///
                // const 
                const keyName = `${userid}${process.env.DOMAIN}${symbol}`
                const getKey = await existsRedis(keyName)
                if (!getKey) {
                    await setnxRedis(keyName, 0)
                }
                let flagWallet = await getRedis(keyName)
                flagWallet = await incrbyRedis(keyName, 1)
                ///// end redis ///
                const getDataCoinpayment = await getRowToTable(`tb_config`, `name='coinpayment'`)
                const coinpayment = getDataCoinpayment[0].value
                if (coinpayment == 1) {
                    const wallet = await getRowToTable(`tb_wallet_code`, `userid=${userid} AND code="${symbol}"`)
                    if (wallet.length > 0 || flagWallet > 1) {
                        success(res, "Wallet already exists !", wallet[0])
                    } else {
                        const resWallet = await createWallet(symbol)
                        const user = await getRowToTable(`tb_user`, `id=${userid}`)
                        const walletRaws = await getRowToTable(`tb_wallet_code`, `address='${resWallet.address}'`)
                        if (walletRaws.length <= 0) {
                            await customerQuery.addWalletCode(userid, user[0].userName, resWallet.address, symbol, `${resWallet.dest_tag ? resWallet.dest_tag : null}`)
                        }
                        resWallet.label = resWallet.dest_tag
                        await delRedis(keyName)
                        success(res, "Successful wallet creation", resWallet)
                    }
                } else if (symbol == 'USDT.BEP20') {
                    const result = await createWalletBEP20(req.user, symbol)
                    if (!result.flag) {
                        await delRedis(keyName)
                        return success(res, `Wallet not exit`, result)
                    }
                    await delRedis(keyName)
                    success(res, "Successful wallet creation", result)
                }

            } else {
                error_400(res, "Symbol emty!")
            }
            next()
        } catch (error) {
            console.log(error);
            next()
            error_500(res, error)
        }
    },
    getWallet: async function (req, res, next) {
        try {
            const idUser = req.user
            if (idUser) {
                const obj = await getWallet(idUser)
                success(res, "Successfully retrieved wallet information!", obj)
            }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    sendEmail: async (req, res) => {
        try {
            const {
                email
            } = req.body
            const flag = validationBody({
                email,
            })
            if (flag.length > 0) return error_400(res, 'Not be empty', flag)
            const user = await customerQuery.getUserToEmail(email)
            if (user.length > 0) {
                if (user[0].status != 1) {
                    let cusObj = user[0]
                    let token = jwt.sign({
                        cusObj
                    }, "swaptobe", {
                        expiresIn: 60 * 518400
                    });
                    //console.log("ok");
                    await sendMail(email, "ACTIVATION CONFIRMATION | SWAPTOBE", user[0].username, "**********", token)
                    success(res, " Email sent successfully ")
                } else {
                    error_400(res, "User has been activated", 1)
                }
            } else {
                error_400(res, "User is not exit", 2)
            }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    verifyEmail: async (req, res) => {
        try {
            const userid = req.user
            const user = await getRowToTable(`tb_user`, `id=${userid}`)
            if (user[0].active == 1) return error_400(res, `This user is verified`)
            await updateRowToTable(`tb_user`, `active=1`, `id=${userid}`)
            await getTokenLogin(user[0])
            user[0].active = 1
            delete user[0].password
            await totalMemberRef(user[0])
            success(res, "Verify yourself successfully", user[0])
        } catch (error) {
            log.info(error)
            console.log(error);
            error_500(res, error)
        }
    },
    refreshToken: async (req, res) => {
        try {
            const userid = req.user
            let cusObj = {
                id: userid
            }
            let token = jwt.sign({
                cusObj
            }, process.env.JWT, {
                expiresIn: parseInt(process.env.EXPRIRESINTOKEN)
            });
            const obj = {
                expiresIn: new Date().getTime() + parseInt(process.env.EXPRIRESINTOKEN) * 1000,
                token
            }
            success(res, "Get Token success", obj)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    getValueConfig: async function (req, res, next) {
        try {
            const { name } = req.body
            const data = await getRowToTable(`tb_config`, `name="${name}"`)
            success(res, "get success", data)
        } catch (error) {

        }
    }

}