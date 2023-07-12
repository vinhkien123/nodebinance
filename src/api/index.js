var express = require('express');
const multiparty = require('connect-multiparty')
const MultipartyMiddleware = multiparty({uploadDir:"./images"})
const path = require('path')
const fs = require('fs');
const { success } = require('../message');
const { port } = require('../commons/port');
const { authenticateAdmin } = require('../middlewares/authenticate');
var router = express.Router();
// router.use('/test', require("./test"));
router.use('/user',require('./user'))
router.use('/crypto',require('./crypto'))
router.use('/admin',require('./admin'))
router.use('/binance',require('./binance'))
router.use('/p2p',require('./p2p'))
router.use('/binaryOption',require('./binaryOption'))
router.use('/depositVND',require('./depositVND'))
module.exports = router;