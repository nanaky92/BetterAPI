const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
  

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// app.use(function(req, res) {
//   res.status(404).send({url: req.originalUrl + ' not found'})
// });

const routes = require('./api/routes/doctorRoutes'); //importing route
routes(app); //register the route


app.listen(port);


console.log('doctor RESTful API server started on: ' + port);
