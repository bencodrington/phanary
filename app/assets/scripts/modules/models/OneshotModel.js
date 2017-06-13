var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* One-shots */

var oneshotSchema = new Schema({
  name: {type: String, required: true},
  filename: {type: String, required: true}
}, {collection: 'oneshots'});

var OneshotModel = mongoose.model('OneshotModel', oneshotSchema);

module.exports.OneshotModel = OneshotModel;