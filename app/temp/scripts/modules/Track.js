import $ from 'jquery';

import { g } from "./GlobalVars.js";


// Track object, contains all the data associated with a given track
class Track {

    constructor(trackData, atmosphere) {
        this.data = trackData;

        this.id = trackData.id;
        this.atmosphere = atmosphere;


        this.createElement(trackData);
        this.createAudio(trackData);
    }

    createElement() {
        
        // TODO: check if template is compiled or not
        
        // Convert object to HTML
        var trackHTML = g.trackTemplate(this.data);

        // Add to tracklist
        var $trackHTML = $(trackHTML).hide().prependTo(g.$trackList).show('fast'); // TODO: only add to current atmosphere tracklist

        // Rig play, stop, and delete buttons to function
        var $playBtn = $trackHTML.find(".btn--play-track");
        var $stopBtn = $trackHTML.find(".btn--stop-track");
        var $delBtn = $trackHTML.find(".btn--delete");
        var that = this;
        $playBtn.on('click', function() {
            that.play();
        });
        $stopBtn.on('click', function() {
            that.stop();
        });
        $delBtn.on('click', function() {
            that.delete();
        });

        this.$trackHTML = $trackHTML;

    }

    createAudio() {
        
        console.log("Track:createAudio(): Autoplay checked? " + g.$autoplayCheckbox.is(":checked"));

        // Append prefix to filenames
        var filenames = this.data.filenames;
        filenames = filenames.map(function(filename) {
            return g.trackPrefix + filename;
        });
        console.log(filenames);

        var $playBtn = this.$trackHTML.find(".btn--play-track");
        // Create new audio source
        // TODO: if audio already contains newId, just add another source
        var that = this;
        this.atmosphere.am.audio[this.id] = new Howl({
            src: filenames,
            buffer: true,
            autoplay: false,
            loop: that.data.loop,                                 // TODO: button to change
            onload: function() {
                console.log("Loaded track '" + that.data.name + "'.");
                $playBtn.removeAttr("disabled");
            }
        });
        if (g.$autoplayCheckbox.is(":checked")) {
            this.play();
        }
    }

    play() {
        this.atmosphere.am.playTrack(this.id);
        // TODO: disable/hide play button
    }

    stop() {
        this.atmosphere.am.stopTrack(this.id);
        // TODO: enable/show play button=
    }

    delete() {
        this.atmosphere.am.stopTrack(this.id);
        // Remove DOM Element
        this.$trackHTML.hide('slow', function() {
            this.remove();
        });
        // Unlink data object from containing atmosphere
        this.atmosphere.removeTrack(this.id);
    }

}

export default Track;