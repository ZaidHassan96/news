const { checkArticleIdExists } = require("../app-models/articles-models");
const { fetchCommentsByArticleId } = require("../app-models/articles-models");
const {
  fetchArticleById,
  fetchArticles,
} = require("../app-models/articles-models");

exports.getArticleById = (request, response, next) => {
  const article_id = request.params.article_id;
  fetchArticleById(article_id)
    .then((result) => {
      const article = result;
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (request, response, next) => {
  const { query } = request;

  fetchArticles(query)
    .then((result) => {
      const articles = result.rows;
      response.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByArticleId = (request, response, next) => {
  const article_id = request.params.article_id;
  fetchArticleById(article_id)
    .then(() => fetchCommentsByArticleId(article_id))
    .then((result) => {
      if (result.length === 0) {
        response.status(200).send(result);
      } else {
        const comments = result;
        response.status(200).send({ comments });
      }
    })
    .catch((err) => {
      next(err);
    });
};
