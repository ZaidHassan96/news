const commentsRouter = require("express").Router();

const {
  deleteCommentByCommentId, updateVoteByCommentId,
} = require("../app-controllers/comments-controllers");

commentsRouter.delete("/:comment_id", deleteCommentByCommentId);
commentsRouter.patch("/:comment_id" , updateVoteByCommentId)

module.exports = commentsRouter;
