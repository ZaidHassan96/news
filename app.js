const express = require("express");

const { getEndPoints } = require("./app-controllers/api-controllers");
const { getTopics } = require("./app-controllers/topics-controllers");
const {
  getArticleById,
  postCommentByArticleId,
  patchArticleByArticleId,
} = require("./app-controllers/articles-controllers");
const { getArticles } = require("./app-controllers/articles-controllers");
const {
  getCommentsByArticleId,
} = require("./app-controllers/articles-controllers");
const {
  deleteCommentByCommentId,
} = require("./app-controllers/comments-controllers");
const { getUsers } = require("./app-controllers/users-controllers");
const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getEndPoints);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.get("/api/users", getUsers)

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.patch("/api/articles/:article_id", patchArticleByArticleId);

app.delete("/api/comments/:comment_id", deleteCommentByCommentId);

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
  if (err.status === 400 && err.msg === "Invalid query") {
    response.status(400).send(err);
  }
  if (err.status === 404 && err.msg === "not found") {
    response.status(404).send({ msg: "not found" });
  }
  if (err.status === 400 && err.msg === "missing input") {
    response.status(400).send({ msg: "Bad request" });
  }
  if (err.code === "23503") {
    response.status(404).send({ msg: "not found" });
  } 
  if (err.status && err.msg){
    response.status(err.status).send({msg: err.msg})
  }
  else {
    response.status(500).send({ msg: "Internal Server Error" });
  }
});


module.exports = app;
