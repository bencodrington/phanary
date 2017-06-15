var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* Atmospheres */

var atmosphereSchema = new Schema({
  name: {type: String, required: true},
  tracks: {type: Schema.Types.ObjectId, required: true}, // TODO: add volumes and other settings here
  tags: [String]
}, {collection: 'atmospheres'});

var AtmosphereModel = mongoose.model('AtmosphereModel', atmosphereSchema);

module.exports.AtmosphereModel = AtmosphereModel;