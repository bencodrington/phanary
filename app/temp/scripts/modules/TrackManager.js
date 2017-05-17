import $ from 'jquery';
import Handlebars from 'handlebars';

import Track from './Track';
import DataReader from './DataReader';
import AudioManager from './AudioManager';
import { g } from "./GlobalVars.js";

class TrackManager {

    constructor(trackDataURL, atmosphereManager, searchBar) {
        
        this.tracks = [];        // The master array of track objects
        this.am = new AudioManager();         // Controls he master list of audio sources
        this.id_counter = 0;     // Used for giving each new track its own id
        this.trackPrefix = "assets/audio/tracks/"

        this.searchBar = searchBar;
        this.atmosphereManager = atmosphereManager;
        this.dataReader = new DataReader(trackDataURL, this.onDataReadComplete.bind(this));

        this.compileTemplate();
    }

    onDataReadComplete(trackData) {
        this.trackData = trackData;
        this.dataReader.populateSearchResults(trackData.tracks, "result--track");
    }

    compileTemplate() {
        var that = this;
        // TODO: move path to variable
        $.get("assets/templates/track.html", function(rawTemplate) {
            var template = Handlebars.compile(rawTemplate);
            that.trackTemplate = template;
        });
    }

    // Called when enter is pressed in the search bar, while a track is highlighted.
    addTrack(trackKey) {
        // TODO: add track to current atmosphere

        if (this.trackData == null) {
            console.error("Track Data failed to fetch from server. Cannot add track.");
            return;
        }

        console.log("addTrack(): trackKey: " + trackKey);

        // Create new Track data object and add it to the tracklist
        var newId = this.id_counter;
        this.tracks.push(new Track(newId, 1));

        // Convert object to HTML
        var trackObject = this.trackData.tracks[trackKey];
        trackObject.name = trackKey;
        trackObject.trackId = newId;
        // TODO: check if template is compiled or not
        var trackHTML = this.trackTemplate(trackObject);
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