const { fetchUsers } = require("../app-models/users-model");

exports.getUsers = (request, response, next) => {
  fetchUsers()
    .then((result) => {
      const users = result;
      response.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};
