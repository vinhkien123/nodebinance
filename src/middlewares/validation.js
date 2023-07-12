const jwt = require('jsonwebtoken')
const {
    check,
    body
} = require('express-validator');

let validateRegisterUser = () => {
    return [
        body('username', 'User Name does not Empty').not().isEmpty(),

        body('username', 'UserName must be Alphanumeric').isAlphanumeric(),
        body('username', 'UserName more than 3 degits').isLength({
            min: 3
        }),
        body('email', 'Invalid does not Empty').not().isEmpty(),
        body('email', 'Invalid email').isEmail(),
        body('password', 'password more than 6 degits').isLength({
            min: 6
        }),
    ];
}
let validatePage = () => {
    return [
        body('limit', 'Limit is not number').not().isEmpty().isNumeric(),
            body('symbol', 'Symbol does not Empty').not().isEmpty(),
        body('page', 'Page is not number').not().isEmpty().isNumeric()
    ];
}
let validateLogin = () => {
    return [
               body('userName', 'UserName more than 3 degits').isLength({
                   min: 3
               }),
        body('password', 'password more than 5 degits').isLength({
            min: 6
        })
    ];
}


module.exports = {
    // token_user_name
    // token_vinawallet
    validatePage,
    validateLogin,
    validateRegisterUser,
    tokenUser: (token, flag) => {
        var decodeToken = jwt.verify(token, 'bossWallet')
        if (flag) {
            return decodeToken.cusObj.id
        }
        if (decodeToken.cusObj.email) {
            return decodeToken.cusObj.email
        } else {
            return false
        }
    },
    tokenAdmin: (token) => {
        var decodeToken = jwt.verify(token, 'token_user_name')
        if (decodeToken.cusObj.type == "admin") {
            return true
        } else {
            return false
        }
    }
}