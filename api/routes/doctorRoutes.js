'use strict'
module.exports = function (app) {
  var doctorController = require('../controllers/doctorController')

  app.route('/api/v1/doctors/search')
    .get((request, response, next) => {
      if (!request.query.name) {
        return next({'statusCode': 400,
          'error': {'error': 'No name parameter'}})
      } else {
        doctorController.search(request, response, next)
        .then((documentResponse) => {
          response.setHeader('Content-Type', 'application/json')
          return response.send(documentResponse)
        })
      }
    })

  app.use(function (err, req, res, next) {
    console.error(err.stack)
    if (err && err.statusCode) {
      return res.status(err.statusCode).json(err.error)
    }
    if (err) {
      return res.status(500).json({'statusCode': 400,
        'error': {'error': 'Invalid request'}})
    }
  })
}
