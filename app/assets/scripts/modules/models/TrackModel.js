var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* Tracks */

var trackSchema = new Schema({
  name: {type: String, required: true},
  filenames: {type: [String], required: true}
}, {collection: 'tracks'});

var TrackModel = mongoose.model('TrackModel', trackSchema);

module.exports.TrackModel = TrackModel;