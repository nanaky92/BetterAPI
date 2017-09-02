'use strict';
module.exports = function(app) {
  var doctorController = require('../controllers/doctorController');

  // todoList Routes
  app.route('/api/v1/doctors/search')
    .get(doctorController.search);

};
