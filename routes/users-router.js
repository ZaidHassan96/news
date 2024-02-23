const usersRouter = require("express").Router();

const { getUsers, getUsersByUsername } = require("../app-controllers/users-controllers");


usersRouter.get("/", getUsers)
usersRouter.get("/:username", getUsersByUsername)

module.exports = usersRouter