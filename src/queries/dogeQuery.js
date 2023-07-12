const connect = require('../database/database')

module.exports = {
    add_posts: async function (title, desc, content, cateId, authId) {
        var query = `INSERT INTO posts set ?`
        const posts = {
            title,
            desc,
            content,
            cateId,
            authId
        }
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getMyDogeDepositPagination: async function (owner) {
        // ORDER BY id DESC
        var query = `SELECT *
        FROM tb_deposits
        INNER JOIN tb_doges ON tb_doges.dogeId=tb_deposits.dogeId  AND  tb_deposits.owner = '${owner}' `
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getMyDogeDeposit: async function (owner, limit, page) {
        // ORDER BY id DESC
        var query = `SELECT *
        FROM tb_deposits
        INNER JOIN tb_doges ON tb_doges.dogeId=tb_deposits.dogeId  AND  tb_deposits.owner = '${owner}'   LIMIT ${limit * (page - 1)},${limit}`
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getMyDogeDepositFrist: async function (owner) {
        // ORDER BY id DESC
        var query = `SELECT *
        FROM tb_deposits
        INNER JOIN tb_doges ON tb_doges.dogeId=tb_deposits.dogeId  AND  tb_deposits.owner = '${owner}'   ORDER BY 1`
        console.log(query);
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getAllDogeWhere: async function (Where) {
        var query = `SELECT * FROM tb_doges ${where}`
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getAllDoge: async function () {
        var query = `SELECT * FROM tb_doges`
        return new Promise((resolve, reject) => {
            connect.connect.query(query, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    updateAvatar: async function (id, avatar) {
        const sql = `UPDATE users SET avatar="${avatar}" WHERE id=${id}`
        return new Promise((resolve, reject) => {
            connect.connect.query(sql, (err, rows) => {
                if (err) return reject({
                    message: "Lỗi Front End !",
                    status: false,
                    err
                });
                resolve({
                    message: "Cập nhật phone token app ! ",
                    status: true
                });
            });

        });
    },
}
