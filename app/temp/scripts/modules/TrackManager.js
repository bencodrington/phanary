import $ from 'jquery';
import Handlebars from 'handlebars';

import Track from './Track';
import DataReader from './DataReader';
import AudioManager from './AudioManager';
import SearchBar from './SearchBar';
import { g } from "./GlobalVars.js";

class TrackManager {

    constructor(trackDataURL) {
        
        this.tracks = [];        // The master array of track objects
        this.am = new AudioManager();         // Controls he master list of audio sources
        this.id_counter = 0;     // Used for giving each new track its own id
        this.trackPrefix = "assets/audio/tracks/"

        this.dataReader = new DataReader(trackDataURL, this.onDataReadComplete.bind(this));
        this.searchBar = new SearchBar(this);

    }

    onDataReadComplete(trackData) {
        this.trackData = trackData;
        this.dataReader.populateSearchResults(trackData);
    }

    // Called when the 'Add Track' button is clicked,
    //  and eventually when enter is pressed in the
    //  search bar.
    addTrack(trackKey) {

        if (this.trackData == null) {
            console.error("Track Data failed to fetch from server. Cannot add track.");
            return;
        }

        console.log("addTrack(): trackKey: " + trackKey);

        // Create new Track data object and add it to the tracklist
        var newId = this.id_counter;
        this.tracks.push(new Track(newId, 1));

        // Generate template
        var rawTemplate = $("#trackTemplate").html();
        var compiledTemplate = Handlebars.compile(rawTemplate);
        // Convert object to HTML
        var trackObject = this.trackData.tracks[trackKey];
        trackObject.name = trackKey;
        trackObject.trackId = newId;
        var trackHTML = compiledTemplate(trackObject);
        // Add to tracklist
        $(trackHTML).hide().prependTo(g.$trackList).show('fast')

        // Rig play and stop buttons to function
        var $playBtn = $("#playBtn" + newId); // cache element for use in Howl
        var that = this;
        $playBtn.click(function() {
            that.playTrack(newId);
        });
        $("#stopBtn"+newId).click(function() {
            that.stopTrack(newId);
        });
        $("#deleteBtn"+newId).click(function() {
            that.deleteTrack(newId);
        });

        console.log("addTrack(): Autoplay checked? " + g.$autoplayCheckbox.is(":checked"));

        // Append prefix to filenames
        var filenames = trackObject.filenames;
        var that = this;
        filenames = filenames.map(function(filename) {
            return that.trackPrefix + filename;
        });
        console.log(filenames);

        // Create new audio source
        // TODO: if audio already contains newId, just add another source
        this.am.audio[newId] = new Howl({
            src: filenames,
            buffer: true,
            autoplay: g.$autoplayCheckbox.is(":checked"),
            loop: trackObject.loop,                                 // TODO: button to change
            onload: function() {
                console.log("Loaded track #" + newId + ", " + trackKey);
                $playBtn.removeAttr("disabled");
            }
        });

        this.searchBar.clearSearchBar();

        this.id_counter++;
        document.getElementById("trackCounter").innerHTML = "Tracks created: " + this.id_counter;
    }

    playTrack(trackId) {
        console.log("Playing track #" + trackId);
        this.am.audio[trackId].play();
    }

    stopTrack(trackId) {
        console.log("Stopping track #" + trackId);
        this.am.audio[trackId].stop();
    }

    deleteTrack(trackId) {
        console.log("Deleting track #" + trackId);
        this.stopTrack(trackId); // TODO: fade out?
        $("#track"+trackId).hide('slow');
        // $("#track"+trackId).hide(900, function() { $(this).remove()});
        this.id_counter--;
    }

}

export default TrackManager;