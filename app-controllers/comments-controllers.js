const { response } = require("../app");
const { removeCommentByCommentId, changeVoteByCommentId } = require("../app-models/comments-models");

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

exports.updateVoteByCommentId = (request, response, next) => {
  const { comment_id } = request.params;
  const { inc_votes } = request.body;
  changeVoteByCommentId(comment_id,inc_votes).then((result) => {
    const comment = result
    response.status(200).send({comment})
  }).catch((err) => {
    next(err)
  })

}
