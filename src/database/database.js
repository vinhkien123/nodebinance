const mysql = require('mysql');

// const connected = mysql.createPool({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'Sseeaways1',
//     database: "db_remiteno",
//     connectionLimit: 20,
// });

//// db_binatrade
const connected = mysql.createPool({
    host: '127.0.0.1',
    user: 'root_binance',
    password: '89y16dgG!',
    database: "admin_binance",
    connectionLimit : 30
});
//// test
// const connected = mysql.createPool({
//     host: '127.0.0.1',
//     user: 'root_vivatrade',
//     password: '89y16dgG!',
//     database: "admin_test_binance",
//     connectionLimit: 30
// });

module.exports = {
    connect: connected,
}