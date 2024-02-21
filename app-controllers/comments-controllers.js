const { response } = require("../app");
const { removeCommentByCommentId } = require("../app-models/comments-models");

exports.deleteCommentByCommentId = (request, response, next) => {
  const { comment_id } = request.params;
  removeCommentByCommentId(comment_id)
    .then(() => {
      response.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};
