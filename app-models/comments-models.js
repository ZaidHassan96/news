const db = require("../db/connection");

exports.removeCommentByCommentId = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
    .then((result) => {
      if (result.rowCount === 0){
        return Promise.reject({
          status: 404,
          msg: "id does not exist"
        })
      }
    });
};
