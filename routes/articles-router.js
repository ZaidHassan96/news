const articlesRouter = require("express").Router();

const {
  getArticleById,
  postCommentByArticleId,
  patchArticleByArticleId,
  getArticles,
  getCommentsByArticleId,
  postArticles,
  deleteArticleByArticleId,
} = require("../app-controllers/articles-controllers");

articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postCommentByArticleId);
articlesRouter.patch("/:article_id", patchArticleByArticleId);
articlesRouter.post("/", postArticles);
articlesRouter.delete("/:article_id", deleteArticleByArticleId)

module.exports = articlesRouter;
