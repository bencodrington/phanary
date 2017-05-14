// var example = require('example.js');
import TrackManager from './modules/TrackManager';
import SearchBar from './modules/SearchBar';


var trackDataURL = "https://api.myjson.com/bins/15eiip";

var trackManager = new TrackManager(trackDataURL);
new SearchBar(trackManager);

// $(document).ready(function() {
//     var tracks = [];        // The master array of track objects
//     var audio = [];         // The master list of audio sources
//     var glob_volume = 1;    // The global volume multiplier applied to all tracks
//     var glob_muted = 0;     // Whether or not all tracks are currently muted
//     var id_counter = 0;     // Used for giving each new track its own id
//     var $trackList = $("#trackList"); // The div containing all tracks
//     var $searchResults = $("#searchResults"); // The ul containing all search results
//     var $searchBarInput = $("#searchBarInput");
//     var $autoplayCheckbox = $("#autoplayCheckbox");
//     var trackData;          // Object containing the parsed tracks.json file
//     var trackPrefix = "Tracks/"

//     function initialize() {
//         
//         // Rig 'Add Track' button to function
//         $("#addTrackBtn").on("click", function() {
//             addTrack("Cafeteria Ambience");
//         });
        
//     }

//     function playTrack(trackId) {
//         console.log("Playing track #" + trackId);
//         audio[trackId].play();
//     }

//     function stopTrack(trackId) {
//         console.log("Stopping track #" + trackId);
//         audio[trackId].stop();
//     }

//     function deleteTrack(trackId) {
//         console.log("Deleting track #" + trackId);
//         $("#track"+trackId).fadeTo('slow', 0);
//         // $("#track"+trackId).hide(900, function() { $(this).remove()});
//         id_counter;
//     }

//     initialize();
// });