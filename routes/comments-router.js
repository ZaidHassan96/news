const commentsRouter = require("express").Router();

const {
  deleteCommentByCommentId,
} = require("../app-controllers/comments-controllers");

commentsRouter.delete("/:comment_id", deleteCommentByCommentId);

module.exports = commentsRouter;
