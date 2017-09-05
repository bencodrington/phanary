var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/phanary', {
  useMongoClient: true
});

var TrackModel = require('../public/scripts/modules/models/TrackModel').TrackModel;
var AtmosphereModel = require('../public/scripts/modules/models/AtmosphereModel').AtmosphereModel;
var OneshotModel = require('../public/scripts/modules/models/OneshotModel').OneshotModel;
var models = [TrackModel, AtmosphereModel, OneshotModel];

var AdminModel = require('../public/scripts/modules/models/AdminModel').AdminModel;

/*
  Database management and backend interface.
*/


/* GET system page. */

router.get('/', function(req, res, next) {
  if (req.session && req.session.admin) {
    authenticateAdmin(req.session.admin.user, req.session.admin.pass, (admin) => {

      if (!admin) {
        // Stored admin data doesn't match any user in db
        req.session.reset();
        res.redirect('/system/login');
      } else {
        // Stored admin data is valid
        res.locals.admin = admin;
        res.render('system', {
          title: 'Phanary System'
        });
      }

    });
    
  } else {
    res.redirect('/system/login');
  }
  
});

/* GET login page. */

router.get('/login', function(req, res, next) {
  res.render('login', {
    title: 'Phanary System Login'
  });
});

router.post('/login', function(req, res, next) {
  authenticateAdmin(req.body.user, req.body.pass, (admin) => {

    if (admin != null) {
      // Login success
      req.session.admin = admin;
      res.redirect('/system');
    } else {
      res.render('login', {
        title: 'Phanary System Login',
        error: 'Invalid username or password.'
      });
    }

  });
});

/* Logout to dashboard. */

router.get('/logout', function(req, res, next) {
  req.session.reset();
  res.redirect('/system');
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
          console.log(queryResults.tagResults);
          // Return the results
          return res.end(sortResults(queryResults));
        }
      });
  });
});

function sortResults(queryResults) {
  // console.log('sortResults: queryResults:');
  // console.log(queryResults);

  // If there are results common to both sets of results, display those
  var returnResults = [];
  for (var i = 0; i < queryResults.tagResults.length; i++) {
    var result = queryResults.tagResults[i];
    for (var j = 0; j < queryResults.nameResults.length; j++) {
      // Can't compare the objects for equality, had to use toString
      if (queryResults.nameResults[j]._id.toString() == result._id.toString()) {
        returnResults.push(result);
      }
    }
  }
  if (returnResults.length > 0) {
    return JSON.stringify(returnResults);
  }

  // Else, return array with tag results first and name results second
  return JSON.stringify(queryResults.tagResults.concat(queryResults.nameResults));
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

  if (req.session && req.session.admin) {
    authenticateAdmin(req.session.admin.user, req.session.admin.pass, (admin) => {

      if (!admin) {
        // Stored admin data doesn't match any user in db
        req.session.reset();
        res.sendStatus(401);
      } else {
        // Stored admin data is valid
        insertItem(req.body);
        res.sendStatus(200);
      }

    });
    
  } else {
    // Not logged in
    res.sendStatus(401);
  }
});

function insertItem(body) {
  var collection = body.collection;
  var item = {
    name: body.name,
    filename: body.filename,
    tags: parseMultilineInput(body.tags),
    tracks: parseLoopArrayString(body.tracks),
    oneshots: parseOneshotArrayString(body.oneshots),
    samples: parseSamples(parseMultilineInput(body.samples)),
    source: body.source
  };
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
}

router.post('/update', function(req, res, next) {

  if (req.session && req.session.admin) {
    authenticateAdmin(req.session.admin.user, req.session.admin.pass, (admin) => {

      if (!admin) {
        // Stored admin data doesn't match any user in db
        req.session.reset();
        res.sendStatus(401);
      } else {
        // Stored admin data is valid
        updateItem(req.body, res);
      }

    });
    
  } else {
    // Not logged in
    res.sendStatus(401);
  }
  
});

function updateItem(body, res) {
  // console.log('body:', body); //TODO: remove
  var collection = body.collection;
  var id = body.id;

  switch(collection) {
    case 'tracks':
      TrackModel.findById(id, function(err, result) {
        if (err || result == null) {
          console.error('system.js:/update: error, no entry found for id: ' + id);
          res.sendStatus(500);
        } else {
          result.name = body.name;
          result.filename = body.filename,
          result.tags = parseMultilineInput(body.tags)
          result.source = body.source;
          result.save();
          res.sendStatus(200);
        }
        
      });
      break;
    case 'atmospheres':
      AtmosphereModel.findById(id, function(err, result) {
        if (err) {
          console.error('system.js:/update: error, no entry found');
          res.sendStatus(500);
        } else {
          result.name = body.name;
          result.tags = parseMultilineInput(body.tags);
          result.tracks = parseLoopArrayString(body.tracks);
          result.oneshots = parseOneshotArrayString(body.oneshots);
          result.save();
          res.sendStatus(200);
        }
        
      });
      break;
    case 'oneshots':
      OneshotModel.findById(id, function(err, result) {
        if (err) {
          console.error('system.js:/update: error, no entry found');
          res.sendStatus(500);
        } else {
          result.name = body.name;
          result.tags = parseMultilineInput(body.tags);
          result.samples = parseSamples(parseMultilineInput(body.samples));
          result.source = body.source;
          result.save();
          res.sendStatus(200);
        }
        
      });
      break;
    default:
      console.log("system.js:/update: invalid collection: " + collection);
  }
}

router.post('/delete', function(req, res, next) {

  if (req.session && req.session.admin) {
    authenticateAdmin(req.session.admin.user, req.session.admin.pass, (admin) => {

      if (!admin) {
        // Stored admin data doesn't match any user in db
        req.session.reset();
        res.sendStatus(401);
      } else {
        // Stored admin data is valid
        deleteItem(req.body, res);
        res.sendStatus(200);
      }

    });
    
  } else {
    // Not logged in
    res.sendStatus(401);
  }
  
});

function deleteItem(body) {
  var collection = body.collection;
  var id = body.id;

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
}

function parseMultilineInput(textString) {
  if (textString) {
    return textString.replace(/\r\n/g,"\n").split('\n');
  } else {
    return null;
  }
  
}

function parseLoopArrayString(loopArrayString) {
  if (!loopArrayString) {
    return;
  }
  var loopArray = JSON.parse(loopArrayString);
  loopArray.forEach(function(loop) {
    try {
      loop.id = mongoose.Types.ObjectId(loop.id); // Convert to a mongoose ObjectId
    } catch (err) {
      console.log('error: ' + err);
      res.sendStatus(500);
    }
  });
  return loopArray;
}

function parseOneshotArrayString(oneshotArrayString) {
  if (!oneshotArrayString) {
    return;
  }
  var oneshotArray = JSON.parse(oneshotArrayString);
  oneshotArray.forEach(function(oneshot) {
    try {
      oneshot.id = mongoose.Types.ObjectId(oneshot.id); // Convert to a mongoose ObjectId
    } catch (err) {
      console.log('error: ' + err);
      res.sendStatus(500);
    }
  });
  return oneshotArray;
}

function parseSamples(filenameStrings) {
  if (!filenameStrings) {
    return null;
  }
  var samples = []
  var resourceObject;
  filenameStrings.forEach(function(value) {
    // Skip if empty
    if (value != '') {
      resourceObject = {
        'filename': value 
      };
      samples.push(resourceObject);
    }
  });
  return samples;
}

/* Validates admin given a username and password
    runs the onComplete function after querying the database
    for a match. admin will be null if no match is found. */

function authenticateAdmin(user, pass, onComplete) {
  AdminModel.findOne({ user: user }, function(err, admin) {

      if (admin && (admin.pass === pass)) {
        onComplete(admin);
      } else {
        onComplete(null);
      }

  });
}

module.exports = router;
