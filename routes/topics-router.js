const topicsRouter = require("express").Router();

const { getTopics, postTopic } = require("../app-controllers/topics-controllers");

topicsRouter.get("/", getTopics)
topicsRouter.post("/", postTopic)

module.exports = topicsRouter