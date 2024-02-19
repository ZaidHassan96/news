const express = require("express");

const { getEndPoints } = require("./app-controllers/api-controllers");
const { getTopics } = require("./app-controllers/topics-controllers");
const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getEndPoints);

app.all("/*", (request, response, next) => {
  response.status(404).send({ msg: "path not found" });
});

module.exports = app;
