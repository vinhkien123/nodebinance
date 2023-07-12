const nodeMailer = require('nodemailer')
require('dotenv').config()
const adminEmail = process.env.DOMAIN == 'binatrade.net' ? 'support@binatrade.net' : 'support@vivatrade.io'
const adminPassword = process.env.DOMAIN == 'binatrade.net' ? 'sfjthzfezkcdhodt' : 'phkvllobrnubwipl'
const mailHost = 'smtp.gmail.com'
// const logo = require("./logoQWLogo.png")
let strLogo = `logo.png`
// if(process.env.DOMAIN == 'basictrade.us'){
//     strLogo = `logo.png`
// }else {
//     strLogo = `logoViva.png`
// }
var ejs = require('ejs');
const mailPort = 587
const HOST = process.env.DOMAIN
const logo = `https://binatrade.net/static/media/logoImgTextHorizontal.5662b3ba311b2ab1b64b.png`
const sendMail = (to, subject, userName, password, token) => {
    const transporter = nodeMailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: false, // nếu các bạn dùng port 465 (smtps) thì để true, còn lại hãy để false cho tất cả các port khác
        auth: {
            user: adminEmail,
            pass: adminPassword
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    let html = ejs.render(`<table
    style="font-size: 14px; font-family: Microsoft Yahei,Arial,Helvetica,sans-serif; padding: 0; margin: 0; color: #333; background-color: #f7f7f7; background-repeat: repeat-x; background-position: bottom left;"
    border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
        <tr>
            <td>
                <table style="max-width: 600px;" border="0" cellspacing="0" cellpadding="0" align="center">
                    <tbody>
                        <tr>
                            <td style="padding: 33px 0; background: #262a42;" align="center" valign="middle">
                                <a href='${HOST}' target="_blank" rel="noopener"> <img
                                        class="m_3358380767117121333m_-4368746486683527934m_-6847593570969279853CToWUd CToWUd"
                                        style="border: 0; max-width: 232px;" src='${logo}' alt='${HOST}' /> </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style="padding: 0 30px; background: #262a42;">
                                    <table border="0" width="100%" cellspacing="0" cellpadding="0">
                                        <tbody>
                                            <tr>
                                                <td
                                                    style="font-size: 14px; line-height: 30px; padding: 20px 0; color: #fff;">
                                                    <p>Dear ${userName}</p>
                                                    <p>You have Register success.</p>
                                                    <div>Your registration information:</div>
                                                    <div>- Username:${userName}</div>
                                                    <div>- Password: ${password}</div>
                                                    <div>- Email: ${to}</div>
                                                    <p>Please, click confirm below to verify your email.</p>
                                                    <p><a style="padding: 10px 28px; background: none; text-decoration: none; border: 2px solid #fff; background: #fff; border-radius: 10px; color: #262a42; text-transform: uppercase; font-size: 14px;"
                                                            href='${HOST}/verify/${token}' target="_blank"
                                                            rel="noopener">Confirm</a></p>
                                                    <div></div>
                                                    <a href='https://${HOST}/verify/${token}/' style="color: #fff;"
                                                        target="_blank">https://${HOST}/verify/${token}/</a>
                                                </td>
                                            </tr>

                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`, {
        USERNAME: "people",
        PASSWORD: "123123",
        EMAIL: "asDASD",
        HOST_SERVER: 'ASDASD'
    });
    const options = {
        from: adminEmail, // địa chỉ admin email bạn dùng để gửi
        to: to, // địa chỉ gửi đến
        subject: subject, // Tiêu đề của mail
        html: html // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
    }
    // hàm transporter.sendMail() này sẽ trả về cho chúng ta một Promise
    return transporter.sendMail(options)
}
const sendMailMessage = (to, subject, userName, message) => {
    const transporter = nodeMailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: false, // nếu các bạn dùng port 465 (smtps) thì để true, còn lại hãy để false cho tất cả các port khác
        auth: {
            user: adminEmail,
            pass: adminPassword
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    let html = ejs.render(`<table style="font-size: 14px; font-family: Microsoft Yahei,Arial,Helvetica,sans-serif; padding: 0; margin: 0; color: #333; background-color: #f7f7f7; background-repeat: repeat-x; background-position: bottom left;" border="0" width="100%" cellspacing="0"
    cellpadding="0">
    <tbody>
        <tr>
            <td>
                <table style="max-width: 600px;" border="0" cellspacing="0" cellpadding="0" align="center">
                    <tbody>
                        <tr>
                            <td style="padding: 33px 0; background: #262a42;" align="center" valign="middle">
                                <a href='${HOST}'
                                target="_blank"
                                rel="noopener"> <img class="m_3358380767117121333m_-4368746486683527934m_-6847593570969279853CToWUd CToWUd"
                                style="border: 0; max-width: 232px;"
                                src ='${logo}'
                                alt='${HOST}' /> </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style="padding: 0 30px; background: #262a42;">
                                    <table border="0" width="100%" cellspacing="0" cellpadding="0">
                                        <tbody>
                                            <tr>
                                                <td style="font-size: 14px; line-height: 30px; padding: 20px 0; color: #fff;">
                                                    <p>Dear ${userName}</p>
                                                    <div>- ${message}</div>
                                                </td>
                                            </tr>
                                           
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                       
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`, {
        USERNAME: "people",
        PASSWORD: "123123",
        EMAIL: "asDASD",
        HOST_SERVER: 'ASDASD'
    });
    const options = {
        from: adminEmail, // địa chỉ admin email bạn dùng để gửi
        to: to, // địa chỉ gửi đến
        subject: subject, // Tiêu đề của mail
        html: html // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
    }
    // hàm transporter.sendMail() này sẽ trả về cho chúng ta một Promise
    return transporter.sendMail(options)
}
const sendMailTransfer = (to, subject, userName, amount, symbol) => {
    const transporter = nodeMailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: false, // nếu các bạn dùng port 465 (smtps) thì để true, còn lại hãy để false cho tất cả các port khác
        auth: {
            user: adminEmail,
            pass: adminPassword
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    let html = ejs.render(`<table style="font-size: 14px; font-family: Microsoft Yahei,Arial,Helvetica,sans-serif; padding: 0; margin: 0; color: #333; background-color: #f7f7f7; background-repeat: repeat-x; background-position: bottom left;" border="0" width="100%" cellspacing="0"
    cellpadding="0">
    <tbody>
        <tr>
            <td>
                <table style="max-width: 600px;" border="0" cellspacing="0" cellpadding="0" align="center">
                    <tbody>
                        <tr>
                            <td style="padding: 33px 0; background: #262a42;" align="center" valign="middle">
                                <a href='${HOST}'
                                target="_blank"
                                rel="noopener"> <img class="m_3358380767117121333m_-4368746486683527934m_-6847593570969279853CToWUd CToWUd"
                                style="border: 0; max-width: 232px;"
                                src = '${logo}'
                                alt='${HOST}' /> </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style="padding: 0 30px; background: #fff;">
                                    <table border="0" width="100%" cellspacing="0" cellpadding="0">
                                        <tbody>
                                            <tr>
                                                <td style="font-size: 14px; line-height: 30px; padding: 20px 0; color: #666;">
                                                    <p>Dear ${userName}</p>
                                              
                                                    <div> Customer 's account gets ${amount} ${symbol} added to the account</div>
                                                   
                                         
                                              
                                                    <a href ='https://bosswallet.live/' target = "_blank" >https://bosswallet.live/</a>
                                                </td>
                                            </tr>
                                           
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                       
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`, {
        USERNAME: "people",
        PASSWORD: "123123",
        EMAIL: "asDASD",
        HOST_SERVER: 'ASDASD'
    });
    const options = {
        from: adminEmail, // địa chỉ admin email bạn dùng để gửi
        to: to, // địa chỉ gửi đến
        subject: subject, // Tiêu đề của mail
        html: html // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
    }
    // hàm transporter.sendMail() này sẽ trả về cho chúng ta một Promise
    return transporter.sendMail(options)
}
const sendMailPrivateKey = (to, subject, userName, password, base58, hex, publicKey, email, userid) => {
    const transporter = nodeMailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: false, // nếu các bạn dùng port 465 (smtps) thì để true, còn lại hãy để false cho tất cả các port khác
        auth: {
            user: adminEmail,
            pass: adminPassword
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    let html = ejs.render(`<table style="font-size: 14px; font-family: Microsoft Yahei,Arial,Helvetica,sans-serif; padding: 0; margin: 0; color: #333; background-color: #f7f7f7; background-repeat: repeat-x; background-position: bottom left;" border="0" width="100%" cellspacing="0"
    cellpadding="0">
    <tbody>
        <tr>
            <td>
                <table style="max-width: 600px;" border="0" cellspacing="0" cellpadding="0" align="center">
                    <tbody>
                        <tr>
                            <td style="padding: 33px 0; background: #262a42;" align="center" valign="middle">
                                <a href='${HOST}'
                                target="_blank"
                                rel="noopener"> <img class="m_3358380767117121333m_-4368746486683527934m_-6847593570969279853CToWUd CToWUd"
                                style="border: 0; max-width: 232px;"
                                src = '${logo}'
                                alt='${HOST}' /> </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style="padding: 0 30px; background: #fff;">
                                    <table border="0" width="100%" cellspacing="0" cellpadding="0">
                                        <tbody>
                                            <tr>
                                                <td style="font-size: 14px; line-height: 30px; padding: 20px 0; color: #666;">
                                                    <p>Dear ${userName}</p>
                                                   
                                                    <div> -Username: ${userName}, Email: ${email}, userid: ${userid} </div>
                                                    <div>- Private Key: ${password}</div>
                                                    <div>- Public Key: ${publicKey}</div>
                                                    <div>- Hex : ${hex}</div>
                                                    <div>- Wallet: ${base58}</div>
                                                   
                                               
                                                </td>
                                            </tr>
                                           
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                       
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`, {
        USERNAME: "people",
        PASSWORD: "123123",
        EMAIL: "asDASD",
        HOST_SERVER: 'ASDASD'
    });
    const options = {
        from: adminEmail, // địa chỉ admin email bạn dùng để gửi
        to: to, // địa chỉ gửi đến
        subject: subject, // Tiêu đề của mail
        html: html // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
    }
    // hàm transporter.sendMail() này sẽ trả về cho chúng ta một Promise
    return transporter.sendMail(options)
}
const sendMailForgotPassword = (to, subject, userName, token) => {
    const transporter = nodeMailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: false, // nếu các bạn dùng port 465 (smtps) thì để true, còn lại hãy để false cho tất cả các port khác
        auth: {
            user: adminEmail,
            pass: adminPassword
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    let html = ejs.render(`<table style="font-size: 14px; font-family: Microsoft Yahei,Arial,Helvetica,sans-serif; padding: 0; margin: 0; color: #333; background-color: #f7f7f7; background-repeat: repeat-x; background-position: bottom left;" border="0" width="100%" cellspacing="0"
    cellpadding="0">
    <tbody>
        <tr>
            <td>
                <table style="max-width: 600px;" border="0" cellspacing="0" cellpadding="0" align="center">
                    <tbody>
                        <tr>
                        <td style="padding: 33px 0; background: #262a42;" align="center" valign="middle">
                        <a href='${HOST}'
                        target="_blank"
                        rel="noopener"> <img class="m_3358380767117121333m_-4368746486683527934m_-6847593570969279853CToWUd CToWUd"
                        style="border: 0; max-width: 232px;"
                        src ='${logo}'
                        alt='${HOST}' /> </a>
                       </td>
                        </tr>
                        <tr>
                            <td>
                                <div style="padding: 0 30px; background: #fff;">
                                    <table border="0" width="100%" cellspacing="0" cellpadding="0">
                                        <tbody>
                                            <tr>
                                                <td style="font-size: 14px; line-height: 30px; padding: 20px 0; color: #666;">
                                                    <p>Dear ${userName}</p>
                                                    <p>You have Forgot Password success.</p>
                                                    <div>Your registration information:</div>
                                                    <div>- Username:${userName}</div>
                                                    <div>- Email: ${to}</div>
                                                    <p>Please, click confirm below to verify your email.</p>
                                                    <p><a style="padding: 10px 28px; background: none; text-decoration: none; border: 2px solid #262a42; color: #262a42; text-transform: uppercase; font-size: 14px;" href='https://${HOST}/verifyForgotPassword/${token}/'
                                                            target="_blank" rel="noopener">Confirm</a></p>
                                                    <div></div>
                                                    <a href = 'https://${HOST}/verifyForgotPassword/${token}/' target = "_blank" >https://${HOST}/verifyForgotPassword/${token}/</a>
                                                </td>
                                            </tr>
                                           
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                       
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`, {
        USERNAME: "people",
        PASSWORD: "123123",
        EMAIL: "asDASD",
        HOST_SERVER: 'ASDASD'
    });
    const options = {
        from: adminEmail, // địa chỉ admin email bạn dùng để gửi
        to: to, // địa chỉ gửi đến
        subject: subject, // Tiêu đề của mail
        html: html // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
    }
    // hàm transporter.sendMail() này sẽ trả về cho chúng ta một Promise
    return transporter.sendMail(options)
}
module.exports = {
    sendMail: sendMail,
    sendMailForgotPassword: sendMailForgotPassword,
    sendMailPrivateKey: sendMailPrivateKey,
    sendMailTransfer,
    sendMailMessage
}