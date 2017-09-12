import $ from 'jquery';
import { g } from "./GlobalVars.js";
require('./templates/track');

class Track {

    /*
        The data object behind loop and one-shot tracks.
    */

    constructor(trackData, atmosphere, volume, ignoreAutoplay) {
        if (trackData == undefined) {
            console.error('No accessible data for selected track.')
        }
        this.data = trackData;  // info like track title, filename, etc.

        this.id = trackData.id; // used for identifying this track to the containing atmosphere's AudioManager
        this.atmosphere = atmosphere;
        this.volume = volume;        // the volume modifier specific to this track

        this.createElement(trackData);
        this.createAudio(ignoreAutoplay);
        this.updateVolumeSlider(this.volume);   // update the volume slider to match the predefined volume from this atmosphere, if one exists
    }

    template(data) {
        return Handlebars.templates['track.hbs'](data);
    }

    createElement() {
        var trackHTML = this.template(this.data); // convert object to HTML
        // Add to tracklist
        var $trackHTML = $(trackHTML)
            .hide()
            .prependTo(g.trackManager.$list)
            .show('fast');

        // Play and Stop buttons
        this.$playBtn = $trackHTML.find(".btn--play");
        this.$stopBtn = $trackHTML.find(".btn--stop");
        this.$playBtn.on('click', function() {
            this.play();
        }.bind(this));
        this.$stopBtn.on('click', function() {
            this.stop();
        }.bind(this));
        this.$stopBtn.hide();   // only display 'play' button at first

        // Delete button
        $trackHTML.find(".btn--delete").on('click', function() {
            this.delete();
        }.bind(this));

        // Make volume controls affect the associated audio object
        this.$volumeSlider = 
        $trackHTML.find(".volume input[type=range]");    // volume slider
        this.$volumeSlider.on('input', function() {
            this.volume = this.$volumeSlider.val();
            this.updateVolume();
            g.pm.storeAtmospheres();
        }.bind(this))
        $trackHTML.find(".btn--mute")                   // mute button
        .on('click', function() {
            this.toggleMute();
        }.bind(this));

        // Make tags modify search bar on click
        $trackHTML.find(".tag").each( (index, element) => {
            var $element = $(element);
            $element.on('click', () => {
                g.searchBar.appendToSearchBar($element.text());
            });
        });

        this.$trackHTML = $trackHTML;   // cache jquery object
    }

    /* Handles the creation of the actual Howler audio object */
    createAudio(ignoreAutoplay) {
        // Prepend path and append track postfixes to the sample name
        var filenames = g.convertToFilenames(this.data.filename);

        // Create new audio source attached to the associated AudioManager
        this.atmosphere.am.addTrack(
            this.id,
            new Howl({
                src: filenames,
                volume: 0,          // required for fade-in
                buffer: true,
                autoplay: false,    // handled manually
                loop: true
            })
        );
        if (g.$autoplayCheckbox.is(":checked") && !ignoreAutoplay) {
            this.begin();
        }
    }

    /* Allows for overriding of the default 'begin' functionality of child classes (e.g. OneShot) */
    begin() {
        this.play();
    }

    play() {
        this.atmosphere.am.playTrack(this.id, this.volume);
        this.atmosphere.hidePlayButtons();

        // Disable/hide track play button
        this.$playBtn.hide();
        this.$stopBtn.show();
    }

    stop() {
        this.atmosphere.am.stopTrack(this.id);

        // Enable/show track play button
        this.$playBtn.show();
        this.$stopBtn.hide();
    }

    toggleMute() {
        this.atmosphere.am.toggleTrackMute(this.id);
    }

    hidePlayBtn() {
        this.$playBtn.hide();
    }

    /*
        retain: whether or not to avoid removing the track from the containing atmosphere
        If this were called in Atmosphere.tracks.forEach(), removing the track mid-loop
        would cause issues like one track being skipped.
    */
    delete(retain) {
        // Begin track stopping process, beginning with fade out
        this.atmosphere.am.stopTrack(this.id, function() {
            // On fade-out completion
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

    updateVolumeSlider(newVolume) {
        this.$volumeSlider.val(newVolume);
        this.volume = newVolume;
        this.updateVolume();
    }

    updateVolume() {
        this.atmosphere.am.setTrackVolume(this.id, this.volume);
    }

    getCollection() {
        return 'tracks';
    }

}

export default Track;