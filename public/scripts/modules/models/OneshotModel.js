var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* One-shots */

var sampleSchema = new Schema({
  filenames: {type: String, required: true} //TODO: replace with [String], one for each of the file endings
});

var oneshotSchema = new Schema({
  name: {type: String, required: true},
  samples: [sampleSchema],
  tags: [String]
}, {collection: 'oneshots'});

var OneshotModel = mongoose.model('OneshotModel', oneshotSchema);

module.exports.OneshotModel = OneshotModel;