import $ from 'jquery';

import { g } from "./GlobalVars.js";


// Track object, contains all the data associated with a given track
class Track {

    constructor(trackData, atmosphere) {
        this.data = trackData;

        this.id = trackData.id;
        this.atmosphere = atmosphere;
        this.volume = 1;

        // console.log("Track constructor: trackData.atmosphereId: " + trackData.atmosphereId);
        this.createElement(trackData);
        this.createAudio(trackData);
    }

    createElement() {
        
        // TODO: check if template is compiled or not
        
        // Convert object to HTML
        var trackHTML = g.trackTemplate(this.data);

        // Add to tracklist
        var $trackHTML = $(trackHTML).hide().prependTo(g.$trackList).show('fast');

        var that = this;
        // Rig play, stop, and delete buttons to function
        var $playBtn = $trackHTML.find(".btn--play");
        var $stopBtn = $trackHTML.find(".btn--stop");
        var $delBtn = $trackHTML.find(".btn--delete");
        $playBtn.on('click', function() {
            that.play();
        });
        $stopBtn.on('click', function() {
            that.stop();
        });
        $delBtn.on('click', function() {
            that.delete();
        });

        // Rig volume slider to function
        var $volumeSlider = $trackHTML.find(".volume input[type=range]");
        $volumeSlider.on('input', function() {
            that.volume = $volumeSlider.val();
            that.updateVolume();
        })
        var $muteBtn = $trackHTML.find(".btn--mute");
        $muteBtn.on('click', function() {
            that.toggleMute();
        });

        this.$trackHTML = $trackHTML;

    }

    createAudio() {
        
        // console.log("Track:createAudio(): Autoplay checked? " + g.$autoplayCheckbox.is(":checked"));

        // Append prefix to filenames
        var filenames = this.data.filenames;
        filenames = filenames.map(function(filename) {
            return g.trackPrefix + filename;
        });
        // console.log(filenames);

        var $playBtn = this.$trackHTML.find(".btn--play");
        // Create new audio source
        // TODO: if audio already contains newId, just add another source
        var that = this;
        this.atmosphere.am.audio[this.id] = new Howl({
            src: filenames,
            buffer: true,
            autoplay: false,
            loop: that.data.loop,                                 // TODO: button to change
            onload: function() {
                // console.log("Loaded track '" + that.data.name + "'.");
                $playBtn.removeAttr("disabled");
            }
        });
        if (g.$autoplayCheckbox.is(":checked")) {
            this.play();
        }
    }

    play() {
        this.atmosphere.am.playTrack(this.id, this.volume);
        // TODO: disable/hide play button
    }

    stop() {
        this.atmosphere.am.stopTrack(this.id);
        // TODO: enable/show play button=
    }

    toggleMute() {
        this.atmosphere.am.toggleTrackMute(this.id);
    }

    setMute(muted) {
        this.atmosphere.am.setTrackMute(this.id, muted)
    }

    delete() {
        var that = this;
        this.atmosphere.am.stopTrack(this.id, function() {
            that.atmosphere.am.unloadTrack(that.id);
            // Unlink data object from containing atmosphere
            that.atmosphere.removeTrack(that.id);
        });
        
        // Remove DOM Element
        this.$trackHTML.slideUp('fast', function() {
            this.remove();
        });
    }

    updateVolume() {
        this.atmosphere.am.setTrackVolume(this.id, this.volume);
    }

}

export default Track;