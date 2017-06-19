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

    template(data) {
        return g.trackTemplate(data);
    }

    createElement() {
        
        // TODO: check if template is compiled or not
        
        // Convert object to HTML
        var trackHTML = this.template(this.data);

        // Add to tracklist
        var $trackHTML = $(trackHTML).hide().prependTo(g.$trackList).show('fast');

        var that = this;
        // Rig play, stop, and delete buttons to function
        var $playBtn = this.$playBtn = $trackHTML.find(".btn--play");
        var $stopBtn = this.$stopBtn = $trackHTML.find(".btn--stop");
        var $delBtn = $trackHTML.find(".btn--delete");
        $playBtn.on('click', function() {
            that.play();
        });
        $stopBtn.on('click', function() {
            that.stop();
        });
        $stopBtn.hide();
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
        var filenames = g.appendTrackPrefixes(this.data.filenames);
        // console.log(filenames);

        var $playBtn = this.$playBtn;
        // Create new audio source
        var that = this;
        this.atmosphere.am.addTrack(
            this.id,
            new Howl({
                src: filenames,
                buffer: true,
                autoplay: false,
                loop: true,
                onload: function() {
                    // console.log("Loaded track '" + that.data.name + "'.");
                    $playBtn.removeAttr("disabled");
                }
            })
        );
        if (g.$autoplayCheckbox.is(":checked")) {
            this.play();
        }
    }

    begin() {
        this.play();
    }

    play() {
        this.atmosphere.am.playTrack(this.id, this.volume);
        // Disable/hide play button
        this.$playBtn.toggle();
        this.$stopBtn.toggle();
    }

    stop() {
        this.atmosphere.am.stopTrack(this.id);
        // TODO: enable/show play button=
        this.$playBtn.toggle();
        this.$stopBtn.toggle();
    }

    toggleMute() {
        this.atmosphere.am.toggleTrackMute(this.id);
    }

    setMute(muted) {
        this.atmosphere.am.setTrackMute(this.id, muted)
    }

    hidePlayBtn() {
        this.$playBtn.hide();
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