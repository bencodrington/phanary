var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//TODO: refactor 'track' as 'loop'. The name 'track' is left over from before one-shots were added.

var trackSchema = new Schema({
  name: {type: String, required: true},
  filename: {type: String, required: true}, // does not include extensions (e.g. 'phanary1' instead of 'phanary1.mp3')
  tags: [String],
  source: String
}, {collection: 'tracks'});

trackSchema.index({tags: 'text'});

var TrackModel = mongoose.model('TrackModel', trackSchema);

module.exports.TrackModel = TrackModel;