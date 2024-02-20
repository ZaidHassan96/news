const { fetchTopics } = require("../app-models/topics-models");

exports.getTopics = (request, response, next) => {
  fetchTopics()
    .then((result) => {
      const resultRows = result.rows;

      response.status(200).send({ topics: resultRows });
    })
    .catch((err) => {
      next(err);
    });
};
