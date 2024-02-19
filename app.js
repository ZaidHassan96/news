const express = require("express");
const { getTopics } = require("./app-controllers/controllers");
const app = express();
 
app.get("/api/topics" , getTopics)

app.all('/*', (request,response,next) => {
  response.status(404).send({msg: "path not found"})

})



module.exports = app