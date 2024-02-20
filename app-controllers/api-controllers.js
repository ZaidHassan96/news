const { fetchAllEndpoints } = require("../app-models/api-models")


exports.getEndPoints = (request,response,next) => {
  fetchAllEndpoints().then((result) => {
    response.status(200).send(result)
    
  })

}