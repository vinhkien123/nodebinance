const connect = require('../database/database')

module.exports = {
    getChartOneLimitLast : async function (symbol) {
        var query = `SELECT * FROM tb_chart_candlestick  WHERE symbol='${symbol}' ORDER BY id DESC LIMIT 1 `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getChartOneLimitLastToTime : async function (symbol,time) {
        var query = `SELECT * FROM tb_chart_candlestick  WHERE symbol='${symbol}' AND time=${time} ORDER BY id DESC LIMIT 1 `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getChartOneLimitLastOrder : async function (symbol) {
        var query = `SELECT * FROM tb_chart_candlestick  WHERE symbol='${symbol}' AND orderAuto = 1 ORDER BY id DESC LIMIT 1 `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },  
    getChartOneLimitLastLast : async function (symbol) {
        var query = `SELECT * FROM tb_chart_candlestick  WHERE symbol='${symbol}' ORDER BY id DESC LIMIT  1,1 `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }, 
    getChartToSymbolAndLimitLastNoClose : async function (symbol, limit, page,) {
        var query = `SELECT * FROM tb_chart_candlestick  WHERE symbol='${symbol}' AND closeCandlestick=0  ORDER BY id DESC LIMIT ${limit * (page-1 )},${limit}`
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getChartToDelete : async function (limit, page,) {
        var query = `SELECT * FROM tb_chart_candlestick  ORDER BY id DESC LIMIT ${limit * (page-1 )},${limit}`
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getChartToSymbolAndLimitLastToTime : async function (symbol,time, limit, page) {
        var query = `SELECT * FROM tb_chart_candlestick  WHERE symbol='${symbol}' AND time=${time}  ORDER BY id DESC LIMIT ${limit * (page-1 )},${limit}`
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }, 
    getChartToSymbolAndLimitLast : async function (symbol, limit, page,) {
        var query = `SELECT * FROM tb_chart_candlestick  WHERE symbol='${symbol}' AND closeCandlestick=1  ORDER BY id DESC LIMIT ${limit * (page-1 )},${limit}`
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }, 
    getAllRowToTable : async function (table, where) {
        var query = `SELECT *  FROM ${table} ${where?`WHERE ${where}`:""} `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }, 
    getDataParentToUserid : async function (id) {
        var query = `SELECT *  FROM tb_user WHERE id=${id} AND id!=1 `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }, 
    // POSITION('${keyWord}' IN userName)
    getDataToUserNameCusNetworkQuery : async function (id,keyWord) {
        var query = `SELECT *  FROM tb_user WHERE parentId=${id} AND id!=1 `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }, 
    getDataParentToUseridBottomNetworkQuery : async function (id) {
        var query = `SELECT *  FROM tb_user WHERE parentId=${id} AND id!=1 `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }, 
    getDataParentToUseridToTimeAndLevel : async function (id,level,timeStart,timeEnd) {
        var query = `SELECT *  FROM tb_user WHERE parentId=${id} AND id!=1 AND level=${level} AND UNIX_TIMESTAMP(updateLevel_at)>${timeStart} AND UNIX_TIMESTAMP(updateLevel_at)<${timeEnd} `
        console.log(query);
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }, 
    
    getLimitPageToTableWallet: async function (table, limit, page, where) {
        var query = `SELECT *  FROM ${table} ${where?`WHERE ${where}`:""} ORDER by amount DESC LIMIT ${limit * (page-1 )},${limit} `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getLimitPageToTable: async function (table, limit, page, where,oder) {
        var query = `SELECT *  FROM ${table} ${where?`WHERE ${where}`:""} ORDER BY id DESC LIMIT ${limit * (page-1 )},${limit} `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getLimitPageToTableHistory: async function (table, limit, page, where,oder) {
        var query = `SELECT *  FROM ${table} ${where?`WHERE ${where}`:""} ORDER BY created_at ${oder?`ASC`:`DESC`}  LIMIT ${limit * (page-1 )},${limit} `
        console.log(query);
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getLimitPageToTableVideo: async function (table, limit, page, where) {
        var query = `SELECT *  FROM ${table} ${where?`WHERE ${where}`:""} ORDER by type,id ASC LIMIT ${limit * (page-1 )},${limit} `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    addRowToTableBalance: async function (userid,userName,email,beforeBalance,afterBalance) {
        const sqlNotification = `INSERT INTO tb_balance_user (beforeBalance,afterBalance, userid, userName, email, created_at) VALUES (${beforeBalance},${afterBalance}, ${userid}, '${userName}', '${email}', UTC_DATE())`
        return new Promise((resolve, reject) => {
            connect.connect.query(sqlNotification, (err, rows) => {
                if (err)
                    return reject({
                        status: false,
                        message: ` error :' '`,
                        err
                    });
                resolve({
                    status: 200,
                    message: "Success !",
                    rows
                });
            });
        })
    },
    addRowToTableBalanceDemo: async function (userid,userName,email,beforeBalance,afterBalance) {
        const sqlNotification = `INSERT INTO tb_balance_user_demo (beforeBalance,afterBalance, userid, userName, email, created_at) VALUES (${beforeBalance},${afterBalance}, ${userid}, '${userName}', '${email}', UTC_DATE())`
        return new Promise((resolve, reject) => {
            connect.connect.query(sqlNotification, (err, rows) => {
                if (err)
                    return reject({
                        status: false,
                        message: ` error :' '`,
                        err
                    });
                resolve({
                    status: 200,
                    message: "Success !",
                    rows
                });
            });
        })
    },
    addRowToTable: async function (table, obj) {
        const sqlNotification = `INSERT INTO ${table} set ?`
        return new Promise((resolve, reject) => {
            connect.connect.query(sqlNotification, obj, (err, rows) => {
                if (err)
                    return reject({
                        status: false,
                        message: `${table} error :' '`,
                        err
                    });
                resolve({
                    status: 200,
                    message: "Success !",
                    rows
                });
            });
        })
    },
    addWalletCode: async function (userid, username, address, code, label) {
        const sqlNotification = `INSERT INTO tb_wallet_code set ?`
        // var oneYearFromNow = new Date();
        // oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        // 31104000000 360 day
        const cusObj = {
            userid,
            created_at: new Date().getTime() / 1000,
            username,
            address,
            code,
            label


            // verified : 0
        }
        //console.log(cusObj);
        return new Promise((resolve, reject) => {
            connect.connect.query(sqlNotification, cusObj, (err, rows) => {
                if (err)
                    return reject({
                        status: 7,
                        message: "Người dùng đã tồn tại !",
                        err
                    });
                return resolve({
                    status: 200,
                    message: "Đăng ký thành công !",
                    resolve: rows

                });
            });
        })
    },
    getRowToTable: async function (table, where) {
        var query = `SELECT * FROM ${table} ${where?`WHERE ${where}`:""} `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getCountToTable: async function (table, where) {
        var query = `SELECT COUNT(*) FROM ${table} ${where?`WHERE ${where}`:""} `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    updateRowToTable: async function (table, set, where) {
        const sql = `UPDATE ${table} SET ${set} WHERE ${where} ;`
        return new Promise((resolve, reject) => {
            connect.connect.query(sql, (err, rows) => {
                if (err) return reject({
                    message: "Lỗi hệ thống !",
                    status: false,
                    err
                });
                resolve({
                    message: "Thay đổi secret thành công ! ",
                    status: true
                });
            });

        });
    },
    deleteRowToTable: async function (table, where) {
        var sql = `DELETE FROM ${table} WHERE ${where}`
        return new Promise((resolve, reject) => {
            connect.connect.query(sql, (err, rows) => {
                if (err) return reject({
                    status: false,
                    message: "Lỗi hệ thống ",
                    err
                });
                resolve({
                    message: "Xóa nông trại thành công thành công !",
                    status: true
                });
            });

        });
    },
}