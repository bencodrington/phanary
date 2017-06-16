var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* Atmospheres */

var childTrackSchema = new Schema({
  id: {type: Schema.Types.ObjectId, required: true}// TODO: add volumes and other settings here
  //volume
});

var childOneshotSchema = new Schema({
  id: {type: Schema.Types.ObjectId, required: true}// TODO: add volumes and other settings here
  //volume
  //loop length
});

var atmosphereSchema = new Schema({
  name: {type: String, required: true},
  tracks: [childTrackSchema],
  oneshots: [childOneshotSchema],
  tags: [String]
}, {collection: 'atmospheres'});

var AtmosphereModel = mongoose.model('AtmosphereModel', atmosphereSchema);

module.exports.AtmosphereModel = AtmosphereModel;