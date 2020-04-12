var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
  Note that each of the child schemas have an '_id' field in addition to the 'id' field.
  The former is the identifier for the child schema instance itself, and the latter is the id of the
  track that it represents, used for finding the relevant track in the database.
*/

var childTrackSchema = new Schema({
    id: { type: Schema.Types.ObjectId, required: true }, // The database ID of a loop track
    volume: { type: Number, default: 1 }
});

var childOneshotSchema = new Schema({
    id: { type: Schema.Types.ObjectId, required: true }, // The database ID of a one-shot track
    volume: { type: Number, default: 1 },
    minIndex: { type: Number, default: 0 }, // Used for specifying how often a one-shot should play
    maxIndex: { type: Number, default: 0 }
});

var atmosphereSchema = new Schema({
    name: { type: String, required: true },

    // The loop- and one-shot-style tracks that will be spawned along with this atmosphere
    tracks: [childTrackSchema],
    oneshots: [childOneshotSchema],

    tags: [String]
}, { collection: 'atmospheres' });

atmosphereSchema.index({ tags: 'text' });
atmosphereSchema.index({ name: 1 });

var AtmosphereModel = mongoose.model('AtmosphereModel', atmosphereSchema);

module.exports.AtmosphereModel = AtmosphereModel;