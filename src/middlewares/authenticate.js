const {
    getPriceCoin
} = require("../commons")
const {
    error_500,
    error_400
} = require("../message")
const { getRowToTable } = require("../queries/customerQuery")
const otplib = require('otplib')
const {
    authenticator
} = otplib
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { createWallet } = require("../controller/user")
const { existsRedis, setnxRedis, getRedis, incrbyRedis } = require("../model/model.redis")
module.exports = {
    check2fa: async (req, res, next) => {
        try {
            next()
            // const {
            //     otp
            // } = req.body
            // const userid = req.user
            // const profileUser = await getRowToTable(`tb_user`, `id=${userid}`)
            // if (profileUser.length > 0) {
            //     if (!profileUser[0].secret) {
            //         error_400(res, "The user has not enabled 2FA", 25)
            //     } else {
            //         if (otp) {
            //             const secret = profileUser[0].secret
            //             var token = otp
            //             let a = authenticator.verify({
            //                 token,
            //                 secret
            //             })
            //             if (a) {
            //                 next()
            //             } else {
            //                 error_400(res, "Incorrect code! ", 11)
            //             }
            //         } else {
            //             error_400(res, "Code Emty! ", 2)
            //         }
            //     }
            // } else {
            //     error_400(res, "User is not define", 1)
            // }
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    authenticateWallet: async (req, res, next) => {
        try {
            const userid = req.user
            const profileUser = await customerQuery.getUserToId(userid)
            if (profileUser.length > 0)
                profileUser[0].twofa == 1 ? check2fa(req, res, next) : checkRecaptcha(req, res, next)
        } catch (error) {
            error_500(res, error)
        }
    },
    spinRedis: async (req, res, next) => {
        const userid = req.user
        const { api } = req.body
        const keyName = `${userid}${process.env.DOMAIN}${api}`
        const getKey = await existsRedis(keyName)
        if (!getKey) await setnxRedis(keyName, 0)
        let flagWallet = await getRedis(keyName)
        flagWallet = await incrbyRedis(keyName, 1)
        ///// end redis ///
        if (flagWallet > 1) {
            console.log("The system is processing, please wait for a moment");
            return error_400(res, "The system is processing, please wait for a moment")
        }
        next()
    },
    authenticateBlock: async (req, res, next) => {
        try {
            const userid = req.user
            const profileUser = await getRowToTable(`tb_user`, `id=${userid}`)
            if (profileUser.length > 0)
                profileUser[0].block == 0 ? next() : error_400(res, "You have locked this function", 21)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    authenticateKyc: async (req, res, next) => {
        try {
            const userid = req.user
            const profileUser = await getRowToTable(`tb_user_kyc`, `userid=${userid}`)
            if (profileUser.length > 0)
                profileUser[0].kyc_status == "APPROVED" ? next() : error_400(res, "User has not verified KYC", 21)
        } catch (error) {
            console.log(error);
            error_500(res, error)
        }
    },
    authenticateAdmin: async (req, res, next) => {
        try {
            const userid = req.user
            const user = await getRowToTable(`tb_user`,`id=${userid}`)
            // let flag = false
            // arrayAdmin.forEach(e => {
            //     if (userid == e) flag = true
            // })
            if (user[0].type!=1) return error_400(res, `User does not have permission to use this function`)
            next()
        } catch (error) {
            error_500(res, error)
        }
    },
    authenticateAdminSocket: async (userid) => {
        try {
            const arrayAdmin = [1, 28295, 30429, 28292]
            let flag = false
            arrayAdmin.forEach(e => {
                if (userid == e) flag = true
            })
            return flag
        } catch (error) {
            error_500(res, error)
        }
    },
    isToken: async (req, res, next) => {
        try {
            let { refreshToken } = req.body;
            await jwt.verify(refreshToken, process.env.JWTREFRESHTOKEN);
            const validationToken = await getRowToTable('tb_token', `refreshToken='${refreshToken}'`)
            if (validationToken.length <= 0) return res.status(401).send('Token is not DB')
            req.user = validationToken[0].userid
            next()
        } catch (error) {
            console.log(error);
            res.status(401).send('Token is not define')
        }
    },
    checkWalletToSymbol: async (req, res, next) => {
        await createWallet(req, res, next)
        next()
    }
}