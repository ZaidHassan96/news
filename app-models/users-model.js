const db = require("../db/connection");
exports.fetchUsers = () => {
  return db.query("SELECT * FROM users;").then((result) => {
    return result.rows
  })
}