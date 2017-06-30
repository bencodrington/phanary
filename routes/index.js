var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/phanary');
var TrackModel = require('../public/scripts/modules/models/TrackModel').TrackModel;
var AtmosphereModel = require('../public/scripts/modules/models/AtmosphereModel').AtmosphereModel;
var OneshotModel = require('../public/scripts/modules/models/OneshotModel').OneshotModel;

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', {
    title: 'Phanary'
  });
  
});

module.exports = router;
