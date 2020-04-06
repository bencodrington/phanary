var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/phanary', { useNewUrlParser: true, useUnifiedTopology: true });
var TrackModel = require('../public/scripts/modules/models/TrackModel').TrackModel;
var AtmosphereModel = require('../public/scripts/modules/models/AtmosphereModel').AtmosphereModel;
var OneshotModel = require('../public/scripts/modules/models/OneshotModel').OneshotModel;

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', {
    title: 'Phanary'
  });
  
});

console.log('readyState');
console.log(mongoose.connection.readyState);

module.exports = router;
