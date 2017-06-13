var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/phanary');
var TrackModel = require('../public/scripts/modules/models/TrackModel').TrackModel;
var AtmosphereModel = require('../public/scripts/modules/models/AtmosphereModel').AtmosphereModel;
var OneshotModel = require('../public/scripts/modules/models/OneshotModel').OneshotModel;

/* GET home page. */
router.get('/', function(req, res, next) {
  // var tracks, atmospheres, oneshots;
  // // Fetch tracks
  // TrackModel.find().then(results => {
  //   tracks = results;
  //   console.log(tracks);
  //   res.locals.searchResults = res.locals.searchResults.concat(tracks);
  // });
  // // Fetch atmospheres
  // AtmosphereModel.find().then(results => {
  //   atmospheres = results;
  // });
  // // Fetch oneshots
  // OneshotModel.find().then(results => {
  //   oneshots = results;
  // });
  res.render('index', {
    searchResults: [
      {
        name: 'name1',
        type: 'type1'
      },
      {
        name: 'name2',
        type: 'type2'
      },
      {
        name: 'name3',
        type: 'type3'
      },
    ],
    title: 'Phanary'
  });
});

module.exports = router;
