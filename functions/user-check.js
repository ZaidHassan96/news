const db = require("../db/connection");

exports.checkUserExists = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1;`, [username])
    .then((result) => {
      return result.rows.length > 0;
    });
};
