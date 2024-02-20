const fs = require("fs/promises");

exports.fetchAllEndpoints = () => {
  return fs
    .readFile(`./endpoints.json`, "utf8")
    .then((data) => {
      const dataParse = JSON.parse(data);

      return dataParse;
    })
    .catch((err) => {
      console.error("Error reading this file:", err);
      return err;
    });
};
