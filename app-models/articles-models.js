const db = require("../db/connection");
const format = require("pg-format");
const { checkUserExists } = require("../functions/user-check");


exports.fetchArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "id does not exist",
        });
      }
      return result.rows[0];
    });
};

exports.fetchArticles = (query) => {
  const { topic } = query;
  if (topic && typeof topic !== "string") {
    return Promise.reject({ status: 400, msg: "Invalid topic query" });
  }
  let sqlQuery = `SELECT articles.article_id,articles.title,articles.topic,articles.author,articles.created_at,articles.votes,articles.article_img_url, COUNT(comments.comment_id)::INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id`;

  if (topic) {
    sqlQuery += ` WHERE articles.topic = $1`;
  }

  sqlQuery += ` GROUP BY 
    articles.article_id,
    articles.title,
    articles.topic,
    articles.author,
    articles.created_at,
    articles.votes,
    articles.article_img_url`;

  const orderBy = ` ORDER BY articles.created_at DESC`;

  sqlQuery += orderBy;

  const values = topic ? [topic] : [];

  return db.query(sqlQuery, values).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }

    return result;
  });
};

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at desc;`,
      [article_id]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.insertCommentByArticleId = (article_id, username, body) => {
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "missing input",
    });
  }
const doesUserExist = checkUserExists(username)
if (doesUserExist === false){
  return Promise.reject({
    status: 404,
    msg: "not found"
  })
}


  const formatInput = format(
    "INSERT INTO comments (body, votes, author, article_id) VALUES (%L, %L, %L, %L) RETURNING *;",
    body,
    0,
    username,
    article_id
  );

  return db.query(formatInput).then((result) => {
    return result.rows[0];
  });
};

exports.changeVoteOnArticleId = (ariticle_id, inc_votes) => {
  if (!ariticle_id || !inc_votes) {
    return Promise.reject({
      status: 400,
      msg: "missing input",
    });
  }
  return db
    .query(
      `UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *;`,
      [inc_votes, ariticle_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }

      return result.rows[0];
    });
};
