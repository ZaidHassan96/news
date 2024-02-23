const {
  fetchUsers,
  fetchUserByUsername,
} = require("../app-models/users-model");

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

exports.getUsersByUsername = (request, response, next) => {
  const { username } = request.params;
  fetchUserByUsername(username).then((result) => {
    const user = result;
    response.status(200).send(user);
  }).catch((err) => {
    next(err)
  })
};
