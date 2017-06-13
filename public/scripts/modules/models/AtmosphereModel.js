var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* Atmospheres */

var atmosphereSchema = new Schema({
  name: {type: String, required: true},
  filename: {type: String, required: true}
}, {collection: 'atmospheres'});

var AtmosphereModel = mongoose.model('AtmosphereModel', atmosphereSchema);

module.exports.AtmosphereModel = AtmosphereModel;