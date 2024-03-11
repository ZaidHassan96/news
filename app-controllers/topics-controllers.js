const { response } = require("../app");
const { fetchTopics, insertTopic } = require("../app-models/topics-models");

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

exports.postTopic = (request, response, next) => {
  const topic = request.body
  insertTopic(topic)
  .then((result) => {
    const topic = result
    response.status(201).send({topic})
  }).catch((err) => {
    next(err)
  })
}
