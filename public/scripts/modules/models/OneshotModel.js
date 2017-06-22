var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* One-shots */

var sampleSchema = new Schema({
  filename: {type: String, required: true}
});

var oneshotSchema = new Schema({
  name: {type: String, required: true},
  samples: [sampleSchema],
  tags: [String],
  source: String
}, {collection: 'oneshots'});

var OneshotModel = mongoose.model('OneshotModel', oneshotSchema);

module.exports.OneshotModel = OneshotModel;