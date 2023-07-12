const Coinpayments = require('coinpayments')
const {
  verify
} = require('coinpayments-ipn');



// const autoIpn = false //default
// const ipnTime = true //default
// const options = {key,secret}
///// basictrade
// 6762810f7114c363a7f0567b8303c3162e002998d5bbb82a41e66e869cfd59ca
// b8019c48f381fc62aeb79C186B2798e56f306C4Fc1cDec6CbB75bD1a09f259B3
///// vivatrade
// 213c5971a2135f1d52680af122ded3e165b80d2003a027e5a61c2786995d6984
// Fa12185155d4Fb19479245A0AE7276F3b59d33b2bd591919970d844d6D78c1bc 
require('dotenv').config()
let key, secret
if (process.env.DOMAIN == 'bigmon.co') {
  key = "97fcf7347e87d2e301f0cefb8317d774563cc23d9afce20a414f69a9f8a0d7d3"
  secret = "65c2ca9540b11693bA359E92208080ba5690Dc426217D83090DA145711e5C599"
} else if (process.env.DOMAIN == 'vivatrade.io') {
  key = "213c5971a2135f1d52680af122ded3e165b80d2003a027e5a61c2786995d6984"
  secret = "Fa12185155d4Fb19479245A0AE7276F3b59d33b2bd591919970d844d6D78c1bc"
}else {
  key = "b4f33ddac2826ab21ca7a53cabfd3f7bfe1d160d5ebc2e0e3b7d6ee6dbe415b9"
  secret = "742aE4943763aeD670afee66Df9FED6c8Cb1161c3282D56221632E977bBaaf95"
  
}

var client = new Coinpayments({
  key,
  secret,
  autoIpn: true
});
const IPN_SECRET = "131197"

const createWallet = (wallet) => {

  return client.getCallbackAddress({
    'currency': wallet,
  })
}

const verifyDeposit = (hmac, payload, cb) => {
  let isValid;

  try {
    console.log("DEPOSIT TEST DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
    isValid = verify(hmac, IPN_SECRET, payload);
    console.log("DEPOSIT TEST DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
  } catch (e) {
    //console.log(e)
    return
  }

  if (isValid) {
    cb(true)
  } else {
    cb(false)
  }
}

module.exports = {
  createWallet,
  verifyDeposit,
}
