const express = require("express");

const { getEndPoints } = require("./app-controllers/api-controllers");
const { getTopics } = require("./app-controllers/topics-controllers");
const { getArticleById } = require("./app-controllers/articles-controllers");
const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getEndPoints);

app.get("/api/articles/:article_id", getArticleById);

app.all("/*", (request, response, next) => {
  response.status(404).send({ msg: "path not found" });
});

app.use((err, request, response, next) => {
  if (err.status === 404 && err.msg === "id does not exist") {
    response.status(404).send({ msg: "id does not exist" });
  }
  if (err.code === "22P02") {
    response.status(400).send({ msg: "Bad request" });
  }
  else {
    response.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
