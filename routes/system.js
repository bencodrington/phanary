var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/phanary');

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

/* Used for getting specific information from a record given a pattern to match */

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

/* Used for getting a list of search results given a search bar input string */

router.get('/search', function(req, res, next) {
  var query = req.query['query'];
  var selectedInfo = req.query['selectedInfo'];
  if (!selectedInfo) {
    selectedInfo = {};
  }
  selectedInfo.score = { $meta: "textScore" };

  if (!query || query === "") {
    return res.end(JSON.stringify([]));
  }

  var queryRegex = query.
    split(/\s/g).       // Split query into words
    filter(value => {   // Remove empty words
      return value != ''; 
    }).
    join('|');          // Combine with regex OR

  var completed = 0;    // Number of collections which have been queried
  var queryResults = {
    nameResults: [],
    tagResults: []
  };
  // console.log('/search query: ' + query);
  models.forEach(function(model, index) {
    model.
      // Search to see if name contains search query
      find(
        { "name": { "$regex": queryRegex, "$options": "i" } },
        selectedInfo
      ).
      exec(function(err, results) {
        // TODO: error handling
        // console.log("/search results: ");
        // console.log(results);
        if (results) {
          // Append results from this operation
          queryResults.nameResults = queryResults.nameResults.concat(results);
        }
        completed++;
        // If this is the last 'find' operation to complete
        if (completed == 2 * models.length) {
          // Return the results
          return res.end(sortResults(queryResults));
        }
      });
    model.
      find(
        { $text: {$search: query} },
        selectedInfo
      ).
      sort(
        { score: { $meta: "textScore" } }
      ).
      exec(function(err, results) {
        if (err) {
          console.error('Search failed: ' + err);
          return res.end(JSON.stringify({}));
        }
        // console.log("/search results: ");
        // console.log(results);
        if (results) {
          // Append results from this operation
          queryResults.tagResults = queryResults.tagResults.concat(results);
        }
        completed++;
        // If this is the last 'find' operation to complete
        if (completed == 2 * models.length) {
          // Return the results
          return res.end(sortResults(queryResults));
        }
      });
  });
});

function sortResults(queryResults) {
  //TODO: If there are results common to both sets of results, display those
  // Else, return array with tag results first and name results second
  console.log('sortResults: queryResults:');
  console.log(queryResults);
  return JSON.stringify(queryResults.nameResults);
}

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
      break;
    default:
      console.log("system.js:/find: invalid collection: " + collection);
      return res.end(JSON.stringify({}));
  }
  doc.findById(id, function(err, result) {
    if (err || !result) {
      return res.json({error: "Error fetching the resource."});
    }
    return res.end(JSON.stringify(result));
  });

});

router.post('/insert', function(req, res, next) {
  var collection = req.body.collection;
  var item = {
    name: req.body.name,
    filenames: parseMultilineInput(req.body.filenames),
    tags: parseMultilineInput(req.body.tags),
    tracks: parseIDs(parseMultilineInput(req.body.tracks)),
    oneshots: parseIDs(parseMultilineInput(req.body.oneshots)),
    samples: parseSamples(parseMultilineInput(req.body.samples))
  };
  // console.log('item');
  // console.log(item);
  var doc;

  switch(collection) {
    case 'tracks':
      doc = new TrackModel(item);
      doc.save();
      break;
    case 'atmospheres':
      doc = new AtmosphereModel(item);
      doc.save();
      break;
    case 'oneshots':
      doc = new OneshotModel(item);
      doc.save();
      break;
    default:
      console.log("system.js:/insert: invalid collection: " + collection);
  }

  res.sendStatus(200);
});

router.post('/update', function(req, res, next) {
  var collection = req.body.collection;
  var id = req.body.id;

  switch(collection) {
    case 'tracks':
      TrackModel.findById(id, function(err, result) {
        if (err || result == null) {
          console.error('system.js:/update: error, no entry found for id: ' + id);
        } else {
          result.name = req.body.name;
          result.filenames = parseMultilineInput(req.body.filenames),
          result.tags = parseMultilineInput(req.body.tags)
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
          result.tags = parseMultilineInput(req.body.tags);
          result.tracks = parseIDs(parseMultilineInput(req.body.tracks));
          result.oneshots = parseIDs(parseMultilineInput(req.body.oneshots));
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
          result.tags = parseMultilineInput(req.body.tags);
          result.samples = parseSamples(parseMultilineInput(req.body.samples));
          result.save();
        }
        
      });
      break;
    default:
      console.log("system.js:/update: invalid collection: " + collection);
  }
  res.sendStatus(200);
  
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
  res.sendStatus(200);
});

function parseMultilineInput(textString) {
  return textString.replace(/\r\n/g,"\n").split('\n');
}

function parseIDs(idStringArray) {
  var idArray = [];
  var resourceObject;
  idStringArray.forEach(function(value) {

    // Skip if empty
    if (value != '') {

      try {
        newID = mongoose.Types.ObjectId(value);
      } catch (err) {
        console.log('error: ' + err);
        res.sendStatus(500);
      }
      resourceObject = {
        'id': newID
      };
      idArray.push(resourceObject);

    }
    
  });
  return idArray;
}

function parseSamples(filenameStrings) {
  var samples = []
  var resourceObject;
  filenameStrings.forEach(function(value) {
    // Skip if empty
    if (value != '') {
      resourceObject = {
        'filenames': value //TODO: replace with array of values w/ different file endings
      };
      samples.push(resourceObject);
    }
  });
  return samples;
}

module.exports = router;
