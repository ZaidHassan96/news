const db = require("../db/connection");
const format = require("pg-format");

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics`);
};

exports.insertTopic = (topic) => {
  const { slug, description } = topic;
  if (typeof slug !== "string" || typeof description !== "string") {
    
    return Promise.reject({
      status: 400,
      msg: "Bad request missing input, or incorrect input value type",
    });
  }
  const formatInput = format(
    `INSERT INTO topics (slug, description) VALUES (%L, %L) RETURNING *;`,
    slug,
    description
  );
  return db.query(formatInput).then((result) => {
    return result.rows[0];
  });
};
