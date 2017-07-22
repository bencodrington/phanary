import $ from 'jquery';

import { g } from "./GlobalVars.js";
require('./templates/track');


// Track object, contains all the data associated with a given track
class Track {

    constructor(trackData, atmosphere) {

        if (trackData == undefined) {
            console.error('No accessible data for selected track.')
        }

        this.data = trackData;

        this.id = trackData.id;
        this.atmosphere = atmosphere;
        this.volume = 1;

        // console.log("Track constructor: trackData.atmosphereId: " + trackData.atmosphereId);
        this.createElement(trackData);
        this.createAudio(trackData);
    }

    template(data) {
        return Handlebars.templates['track.hbs'](data);
    }

    createElement() {
        
        // Convert object to HTML
        var trackHTML = this.template(this.data);

        // Add to tracklist
        var $trackHTML = $(trackHTML).hide().prependTo(g.$trackList).show('fast');

        var that = this;
        // Rig play, stop, and delete buttons to function
        var $playBtn = this.$playBtn = $trackHTML.find(".btn--play");
        var $stopBtn = this.$stopBtn = $trackHTML.find(".btn--stop");
        var $delBtn = $trackHTML.find(".btn--delete");
        var $tags = $trackHTML.find(".tag");
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

        // Rig tags to modify search bar
        $tags.each( (index, element) => {
            // console.log('ELEMENT: ');
            // console.log(element);
            var $element = $(element);
            $element.on('click', () => {
                g.searchBar.appendToSearchBar($element.text());
            });
        });

        this.$trackHTML = $trackHTML;

    }

    createAudio() {
        
        // console.log("Track:createAudio(): Autoplay checked? " + g.$autoplayCheckbox.is(":checked"));

        // Append prefix to filenames
        var filenames = g.convertToFilenames(this.data.filename);
        // console.log(filenames);

        var $playBtn = this.$playBtn;
        // Create new audio source
        var that = this;
        this.atmosphere.am.addTrack(
            this.id,
            new Howl({
                src: filenames,
                volume: 0,
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
            this.begin();
        }
    }

    begin() {
        this.play();
    }

    play() {
        this.atmosphere.am.playTrack(this.id, this.volume);
        // Disable/hide play button
        this.$playBtn.hide();
        this.$stopBtn.show();
    }

    stop() {
        this.atmosphere.am.stopTrack(this.id);
        // Enable/show play button
        this.$playBtn.show();
        this.$stopBtn.hide();
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