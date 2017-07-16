var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
    user: {type: String, required: true},
    pass: {type: String, required: true}
}, {collection: 'admins'});

var AdminModel = mongoose.model('Admin', adminSchema);

module.exports.AdminModel = AdminModel;