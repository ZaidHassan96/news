const db = require("../db/connection");
exports.checkTopicExists = (topic) => {
  return db
    .query(`SELECT * FROM topics WHERE slug = $1;`, [topic])
    .then((result) => {
      return result.rows.length > 0;
    });
};
