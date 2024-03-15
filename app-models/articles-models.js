const db = require("../db/connection");
const format = require("pg-format");
const { checkUserExists } = require("../functions/user-check");
const { checkTopicExists } = require("../functions/topic-check");
const { parse } = require("dotenv");

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.*,
    
      COUNT(comments.comment_id)::INT AS comment_count
    FROM
      articles
    LEFT JOIN
      comments ON articles.article_id = comments.article_id
    WHERE
      articles.article_id = $1
    GROUP BY
      articles.article_id
    ORDER BY
      articles.created_at DESC;
    `,
      [article_id]
    )
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
  let { topic, sort_by, order, limit, p } = query;

  if (sort_by !== undefined && sort_by.trim().length === 0) {
    sort_by = "created_at";
  }
  if (order !== undefined && order.trim().length === 0) {
    order = "desc";
  }

  if (limit !== undefined && limit.trim().length === 0) {
    limit = 10;
  }
  const allowedParameters = ["topic", "sort_by", "order", "limit", "p"];
  const unexpectedParameters = Object.keys(query).filter(
    (param) => !allowedParameters.includes(param)
  );

  if (unexpectedParameters.length > 0) {
    return Promise.reject({
      status: 400,
      msg: `Unexpected query parameters`,
    });
  }

  if (topic && typeof topic !== "string") {
    return Promise.reject({ status: 400, msg: "Invalid topic query" });
  }

  const validSortColumns = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "article_img_url",
  ];
  const validOrders = ["asc", "desc"];

  if (sort_by && !validSortColumns.includes(sort_by)) {
    return Promise.reject({ status: 404, msg: "Invalid sort_by query" });
  }

  if (order && !validOrders.includes(order)) {
    return Promise.reject({ status: 404, msg: "Invalid order query" });
  }

  if (limit && isNaN(parseInt(limit, 10))) {
    return Promise.reject({ status: 400, msg: "Invalid limit query" });
  }

  if (p && isNaN(parseInt(p, 10))) {
    return Promise.reject({ status: 400, msg: "Invalid page query" });
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

  if (sort_by) {
    sqlQuery += ` ORDER BY ${sort_by}`;
    if (order) {
      sqlQuery += ` ${order.toUpperCase()}`;
    } else {
      sqlQuery += ` DESC`;
    }
  } else if (order) {
    sqlQuery += ` ORDER BY articles.created_at ${order}`;
  } else {
    sqlQuery += ` ORDER BY articles.created_at DESC`;
  }
  const values = topic ? [topic] : [];

  if (limit && p) {
    const offset = (parseInt(p, 10) - 1) * parseInt(limit, 10) || 0;
    sqlQuery += ` LIMIT $${values.length + 1 || 1} OFFSET $${
      values.length + 2 || 2
    }`;
    values.push(parseInt(limit, 10));
    values.push(offset);
  } else if (limit) {
    sqlQuery += ` LIMIT $${values.length + 1 || 1}`;
    values.push(parseInt(limit, 10));
  }

  return db.query(sqlQuery, values).then((result) => {
    if (result.rows.length === 0) {
      return checkTopicExists(topic).then((doesTopicExist) => {
        if (doesTopicExist) {
          return result.rows;
        } else {
          return Promise.reject({ status: 404, msg: "not found" });
        }
      });
    }

    return result.rows;
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

  return checkUserExists(username).then((doesUserExist) => {
    if (!doesUserExist) {
      return Promise.reject({
        status: 404,
        msg: "user not found",
      });
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
  });
};

exports.changeVoteOnArticleId = (article_id, inc_votes) => {
  if (!article_id) {
    return Promise.reject({
      status: 400,
      msg: "missing input",
    });
  }

  let query;
  let values;

  if (inc_votes !== undefined) {
    query = `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`;
    values = [inc_votes, article_id];
  } else {
    query = `UPDATE articles SET article_id = $1 WHERE article_id = $2 RETURNING *;`;
    values = [article_id, article_id];
  }

  return db.query(query, values).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }

    return result.rows[0];
  });
};

exports.insertArticle = (articleData) => {
  const { title, topic, author, body, article_img_url } = articleData;

  if (
    typeof title !== "string" ||
    typeof topic !== "string" ||
    typeof author !== "string" ||
    typeof body !== "string"
  ) {
    return Promise.reject({
      status: 400,
      msg: "Bad request missing input, or incorrect input value type",
    });
  }

  return checkUserExists(author).then((doesUserExist) => {
    if (!doesUserExist) {
      return Promise.reject({
        status: 404,
        msg: "user not found",
      });
    }

    return db
      .query(
        `ALTER TABLE articles ADD COLUMN comment_count INT DEFAULT 0 NOT NULL`
      )
      .then(() => {
        if (!article_img_url) {
          const formatInput = format(
            `INSERT INTO articles (title, topic ,author, body) VALUES (%L, %L, %L, %L) RETURNING *;`,
            title,
            topic,
            author,
            body
          );

          return db.query(formatInput).then((result) => {
            return result.rows[0];
          });
        }
        const formatInput = format(
          `INSERT INTO articles (title, topic ,author, body, article_img_url) VALUES ( %L, %L, %L, %L, %L) RETURNING *;`,
          title,
          topic,
          author,
          body,
          article_img_url
        );

        return db.query(formatInput).then((result) => {
          return result.rows[0];
        });
      });
  });
};
exports.removeArticleByArticleId = (article_id) => {
  return db
    .query(`DELETE FROM articles WHERE article_id = $1`, [article_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "id does not exist",
        });
      }
    });
};
