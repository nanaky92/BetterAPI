const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const routes = require('./api/routes/doctorRoutes') // importing route
routes(app) // register the route

app.listen(port)

console.log('doctor RESTful API server started on: ' + port)
