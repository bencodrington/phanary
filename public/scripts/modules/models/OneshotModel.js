var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sampleSchema = new Schema({
  filename: {type: String, required: true} // does not include extensions (e.g. 'phanary1' instead of 'phanary1.mp3')
});

var oneshotSchema = new Schema({
  name: {type: String, required: true},
  samples: [sampleSchema],
  tags: [String],
  source: String
}, {collection: 'oneshots'});

var OneshotModel = mongoose.model('OneshotModel', oneshotSchema);

module.exports.OneshotModel = OneshotModel;