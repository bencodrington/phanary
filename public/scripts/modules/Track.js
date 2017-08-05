'use strict';
import $ from 'jquery';

import { g } from "./GlobalVars.js";
require('./templates/track');


class Track {

    constructor(trackData, atmosphere) {

        if (trackData == undefined) {
            console.error('No accessible data for selected track.')
        }

        this.data = trackData;

        this.id = trackData.id;
        this.atmosphere = atmosphere;
        this.volume = 1;

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
        var $trackHTML = $(trackHTML).hide().prependTo(g.trackManager.$list).show('fast');

        // Rig play, stop, and delete buttons to function
        var $playBtn = this.$playBtn = $trackHTML.find(".btn--play");
        var $stopBtn = this.$stopBtn = $trackHTML.find(".btn--stop");
        var $delBtn = $trackHTML.find(".btn--delete");
        var $tags = $trackHTML.find(".tag");
        $playBtn.on('click', function() {
            this.play();
        }.bind(this));
        $stopBtn.on('click', function() {
            this.stop();
        }.bind(this));
        $stopBtn.hide();
        $delBtn.on('click', function() {
            this.delete();
        }.bind(this));

        // Rig volume slider to function
        var $volumeSlider = $trackHTML.find(".volume input[type=range]");
        $volumeSlider.on('input', function() {
            this.volume = $volumeSlider.val();
            this.updateVolume();
        }.bind(this))
        var $muteBtn = $trackHTML.find(".btn--mute");
        $muteBtn.on('click', function() {
            this.toggleMute();
        }.bind(this));

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
        // Create new audio source
        this.atmosphere.am.addTrack(
            this.id,
            new Howl({
                src: filenames,
                volume: 0,
                buffer: true,
                autoplay: false,
                loop: true
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
        this.atmosphere.hidePlayButtons();
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

    hidePlayBtn() {
        this.$playBtn.hide();
    }

    delete(retain) {
        this.atmosphere.am.stopTrack(this.id, function() {
            this.atmosphere.am.unloadTrack(this.id);
            if (!retain) {
                // Unlink data object from containing atmosphere
                this.atmosphere.removeTrack(this.id);
            }
            
        }.bind(this));
        
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