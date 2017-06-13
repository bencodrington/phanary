var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/phanary');
var Schema = mongoose.Schema;

var TrackModel = require('../public/scripts/modules/models/TrackModel').TrackModel;
var AtmosphereModel = require('../public/scripts/modules/models/AtmosphereModel').AtmosphereModel;
var OneshotModel = require('../public/scripts/modules/models/OneshotModel').OneshotModel;
var models = [TrackModel, AtmosphereModel, OneshotModel];

/* GET system page. */

router.get('/', function(req, res, next) {
  res.render('system', {
    title: 'Phanary System'
  });
});

router.get('/read', function(req, res, next) {
  var collection = req.query['collection'];
  switch (collection) {
    case 'tracks':
      TrackModel.find().then(function(results) {
        displayReadResults(results, res);
      });
      break;
    case 'atmospheres':
      AtmosphereModel.find().then(function(results) {
        displayReadResults(results, res);
      });
      break;
    case 'oneshots':
      OneshotModel.find().then(function(results) {
        displayReadResults(results, res);
      });
      break;
    default:
      console.log("system.js:/read: invalid collection: " + collection);
  }
});

router.get('/get', function(req, res, next) {
  var collection = req.query['collection'];
  var selectedInfo = req.query['selectedInfo'];
  if (!selectedInfo) {
    selectedInfo = {};
  }
  //TODO: error check
  switch (collection) {
    case 'tracks':
      TrackModel.find({}, selectedInfo).lean().then(function(results) {
        return res.end(JSON.stringify(results));
      });
      break;
    case 'atmospheres':
      AtmosphereModel.find({}, selectedInfo).lean().then(function(results) {
        return res.end(JSON.stringify(results));
      });
      break;
    case 'oneshots':
      OneshotModel.find({}, selectedInfo).lean().then(function(results) {
        return res.end(JSON.stringify(results));
      });
      break;
    default:
      console.log("system.js:/read: invalid collection: " + collection);
  }
});

function displayReadResults(results, res) {
  res.render(
    'system',
    {
      title: 'Phanary System',
      items: results
    }
  );
}

router.get('/search', function(req, res, next) {
  var query = req.query['query'];
  var selectedInfo = req.query['selectedInfo'];
  if (!selectedInfo) {
    selectedInfo = {};
  }

  if (!query || query === "") {
    return res.end(JSON.stringify([]));
  }

  var queryRegex = query.
    split(/\s/g).       // Split query into words
    filter(value => {   // Remove empty words
      return value != ''; 
    }).
    join('|');          // Combine with regex OR

  var completed = 0; // Number of collections which have been queried
  var allResults = [];
  // console.log('/search query: ' + query);
  models.forEach(function(model, index) {
    model.
      // Search to see if name contains search query
      find(
        {$or: [
          { "name": { "$regex": queryRegex, "$options": "i" } },
          { $text: {$search: query} }
        ]},
        selectedInfo
      ).
      exec(function(err, results) {
        // TODO: error handling
        console.log("/search results: ");
        console.log(results);
        if (results) {
          // Append results from this operation
          allResults = allResults.concat(results);
        }
        completed++;
        // If this is the last 'find' operation to complete
        if (completed == models.length) {
          // Return the results
          return res.end(JSON.stringify(allResults));
        }
      });
  });
});

/* Used for getting a specific record given the id and collection */

router.get('/find', function(req, res, next) {
  var collection = req.query['collection'];
  var id = req.query['id'];
  var doc;
  switch(collection) {
    case 'tracks':
      doc = TrackModel;
      break;
    case 'atmospheres':
      doc = AtmosphereModel;
      break;
    case 'oneshots':
      doc = OneshotModel;
    default:
      console.log("system.js:/find: invalid collection: " + collection);
      return res.end(JSON.stringify({}));
  }
  doc.findById(id, function(err, result) {
    //TODO: error handling
    return res.end(JSON.stringify(result));
  });

});

router.post('/insert', function(req, res, next) {
  var collection = req.body.collection;
  var item = {
    name: req.body.name,
    filenames: parseMultilineInput(req.body.filenames),
    tags: parseMultilineInput(req.body.tags)
  };
  console.log(item);
  var doc;

  switch(collection) {
    case 'tracks':
      doc = new TrackModel(item);
      doc.save();
      break;
    case 'atmospheres':
      doc = new AtmosphereModel(item);
      doc.save();
    case 'oneshots':
      doc = new OneshotModel(item);
      doc.save();
    default:
      console.log("system.js:/insert: invalid collection: " + collection);
  }

  res.redirect('/system');
});

router.post('/update', function(req, res, next) {
  var collection = req.body.collection;
  var id = req.body.id;

  switch(collection) {
    case 'tracks':
      TrackModel.findById(id, function(err, result) {
        if (err) {
          console.error('system.js:/update: error, no entry found');
        } else {
          result.name = req.body.name;
          result.filenames = req.body.filenames;
          result.save();
        }
        
      });
      break;
    case 'atmospheres':
      AtmosphereModel.findById(id, function(err, result) {
        if (err) {
          console.error('system.js:/update: error, no entry found');
        } else {
          result.name = req.body.name;
          result.filenames = req.body.filenames;
          result.save();
        }
        
      });
      break;
    case 'oneshots':
      OneshotModel.findById(id, function(err, result) {
        if (err) {
          console.error('system.js:/update: error, no entry found');
        } else {
          result.name = req.body.name;
          result.filenames = req.body.filenames;
          result.save();
        }
        
      });
      break;
    default:
      console.log("system.js:/update: invalid collection: " + collection);
  }

  res.redirect('/system');
  
});

router.post('/delete', function(req, res, next) {
  var collection = req.body.collection;
  var id = req.body.id;

  switch(collection) {
    case 'tracks':
      TrackModel.findByIdAndRemove(id).exec();
      break;
    case 'atmospheres':
      AtmosphereModel.findByIdAndRemove(id).exec();
      break;
    case 'oneshots':
      OneshotModel.findByIdAndRemove(id).exec();
      break;
    default:
      console.log("system.js:/delete: invalid collection: " + collection);
  }
  res.redirect('/system');
});

function parseMultilineInput(textString) {
  return textString.replace(/\r\n/g,"\n").split('\n');
}

module.exports = router;
