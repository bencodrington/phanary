var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    // TODO: get from mongodb
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
