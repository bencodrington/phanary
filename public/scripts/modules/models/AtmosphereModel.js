var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var childTrackSchema = new Schema({
  id: {type: Schema.Types.ObjectId, required: true} // The database ID of a loop track
  // TODO: add volume configuration here
});

var childOneshotSchema = new Schema({
  id: {type: Schema.Types.ObjectId, required: true} // The database ID of a one-shot track
  // TODO: add volume configuration here
  // TODO: add one-shot timing configuration here
});

var atmosphereSchema = new Schema({
  name: {type: String, required: true},
  
  // The loop- and one-shot-style tracks that will be spawned along with this atmosphere
  tracks: [childTrackSchema],
  oneshots: [childOneshotSchema],

  tags: [String]
}, {collection: 'atmospheres'});

var AtmosphereModel = mongoose.model('AtmosphereModel', atmosphereSchema);

module.exports.AtmosphereModel = AtmosphereModel;