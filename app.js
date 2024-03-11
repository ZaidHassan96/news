const express = require("express");
const cors = require('cors');

const { getEndPoints } = require("./app-controllers/api-controllers");

const app = express();

const articlesRouter = require("./routes/articles-router");
const commentsRouter = require("./routes/comments-router");
const topicsRouter = require("./routes/topics-router");
const usersRouter = require("./routes/users-router");
app.use(cors());
app.use(express.json());

app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/users", usersRouter);
app.get("/api", getEndPoints);

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
  if (err.status && err.msg) {
    response.status(err.status).send({ msg: err.msg });
  } else {
    response.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
