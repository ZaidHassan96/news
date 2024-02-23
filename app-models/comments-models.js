const e = require("express");
const db = require("../db/connection");

exports.removeCommentByCommentId = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "id does not exist",
        });
      }
    });
};

exports.changeVoteByCommentId = (comment_id, inc_votes) => {
  if (!comment_id) {
    return Promise.reject({
      status: 400,
      msg: "missing comment_id",
    });
  }

  let query;
  let values;

  if (inc_votes !== undefined) {
    query = `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *;`;
    values = [inc_votes, comment_id];
  } else {
    query = `UPDATE comments SET comment_id = $1 WHERE comment_id = $2 RETURNING *;`;
    values = [comment_id, comment_id];
  }

  return db.query(query, values).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "comment not found" });
    }

    return result.rows[0];
  });
};
