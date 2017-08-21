import $ from 'jquery';

import Track from './Track.js';
import OneShot from './OneShot.js';
import AudioManager from './AudioManager';
import { g } from "./GlobalVars.js";
require('./templates/atmosphere');

class Atmosphere {

    constructor(atmosphereData, id) {
        this.tracks = [];               // An array of all loops and one-shots contained in this atmosphere
        this.data = atmosphereData;     // Contains information like the atmosphere's name, currently only used upon instantiation
        this.id = id;                   // A unique integer used for accessing this atmosphere in the AtmosphereManager's array
        this.idCounter = 0;             // Used for assigning instantiated tracks a unique integer ID
        this.am = new AudioManager();   // Controls this atmosphere's list of audio sources

        this.createElement();
        this.instantiateTracks(atmosphereData.tracks, 'tracks', 'track');
        this.instantiateTracks(atmosphereData.oneshots, 'oneshots', 'oneshot');
        this.handleAutoplay(); // Only display relevant buttons based on whether or not atmosphere should autoplay
    }

    /* Creates and adds a corresponding atmosphere div element to the DOM */
    createElement() {
        // Convert object to HTML
        var atmosphereHTML = Handlebars.templates['atmosphere.hbs'](this.data);

        // Add to tracklist
        var $atmosphereHTML = $(atmosphereHTML).prependTo(g.atmosphereManager.$list).hide();
        
        // Hack that corrects the jQuery 'snapping' visual bug
        //  $atmosphereHTML.height() returns an unreliable result if called here, but it's fine 0ms later
        setTimeout(function() {
            $atmosphereHTML.show('fast');
        }, 0);

        this.rigAtmosphereControls($atmosphereHTML);

        this.rigTitleEditing($atmosphereHTML);

        this.rigVolumeControls($atmosphereHTML);
        
        var $delBtn = $atmosphereHTML.find(".btn--delete");
        var $stopBtn = this.$stopBtn = $atmosphereHTML.find(".btn--stop");
        
        var that = this;
        $delBtn.on('click', function(event) {
            that.delete();
            event.stopPropagation();
        });
        $stopBtn.on('click', function() {
            that.stop();
        })
        $stopBtn.hide();
        
        this.$atmosphereHTML = $atmosphereHTML; // Cache reference to the newly-added DOM element
    }

    /* Connect functionality to atmosphere-specific controls */
    rigAtmosphereControls($atmosphereHTML) {
        var that = this;
        var $addBtn = this.$addBtn = $atmosphereHTML.find(".atmosphere__add");
        var $replaceBtn = this.$replaceBtn = $atmosphereHTML.find(".atmosphere__replace");

        $addBtn.on('click', function() {
            that.play();
        });
        $replaceBtn.on('click', function() {
            g.atmosphereManager.switchTo(that);
        })
    }

    rigTitleEditing($atmosphereHTML) {
        var $heading = $atmosphereHTML.find(".section__heading");
        var $title = $heading.find(".section__heading__title");
        var $titleText = $title.find(".section__heading__title__text");
        var $rename = $title.find(".atmosphere__rename");

        var that = this;
        
        $atmosphereHTML.on('click', function(e) {
            e.stopPropagation();    // Don't deselect current atmosphere if it's DOM element is clicked
            g.atmosphereManager.stopEditingTitle();   // but still cancel title editing
        });

        // Click atmosphere heading to set the containing atmosphere as active
        $heading.on('click', function() {
            g.atmosphereManager.setActiveAtmosphere(that);
            g.sidebar.hide();
        });

        // Highlight current title text upon focus
        $titleText.focus(function() {
            g.selectElementContents($titleText[0]);
        });
        
        // Rig rename button to toggle whether or not the title is editable
        $rename.click(function(event) {
            that.toggleTitleEditable($titleText);
            event.stopPropagation(); // don't select atmosphere if trying to edit
        });

        // Exit edit mode when enter is pressed
        $titleText.on('keydown', function(e) {
            if (e.keyCode == "13") {
                // enter was pressed, so exit edit mode
                $titleText.prop('contenteditable', false).toggleClass('editable');
                g.atmosphereManager.$editingTitle = null;
            }
        });

        $titleText.on('click', function(e) {
            var isEditable = $titleText.is('.editable');
            if (isEditable) {
                e.stopPropagation(); // prevent atmosphere from being selected
            }
        });
    }

    toggleTitleEditable($titleText) {
        var isEditable = $titleText.is('.editable');
        $titleText.prop('contenteditable', !isEditable); // toggle contenteditable property
        g.atmosphereManager.stopEditingTitle(); // clear any title currently being edited

        if (!isEditable) {
            $titleText.addClass("editable");
            // If it's now editable,
            //  let GlobalVars know,
            g.atmosphereManager.$editingTitle = $titleText;
            //  and select it with the cursor.
            $titleText.focus();
            // .delay(100).select();
            // .select();
        } else {
            $titleText.removeClass("editable")
        }
    }

    rigVolumeControls($atmosphereHTML) {
        var that = this;
        var $volumeSlider = $atmosphereHTML.find('.volume input[type=range]');
        $volumeSlider.on('input', function() {
            that.setVolume($volumeSlider.val());
        });
        var $muteBtn = $atmosphereHTML.find(".btn--mute");
        $muteBtn.on('click', function() {
            that.toggleMute();
        });
    }

    instantiateTracks(tracks, collection, type) {
        if (!tracks) { // empty atmosphere
            return;
        }
        tracks.forEach(function(trackObject) {
            g.dataManager.getData(collection, trackObject.id, function(result) {
                this.addTrack(result, type);
            }.bind(this));
            // TODO: instantiate them with their atmosphere-defined settings (volume, loop, delay etc.)
        }, this);
    }

    addTrack(trackObject, type) {
        // Prepare track data for template injection
        trackObject.id = this.idCounter;
        trackObject.atmosphereId = this.id;
        this.idCounter++;
        
        // Create track data object
        var track;
        if (type === "oneshot") {
            // OneShot
            track = new OneShot(trackObject, this);
        } else {
            // Default
            track = new Track(trackObject, this);
        }

        // Add track to array
        this.tracks.push(track);
    }

    /* 
    Removes reference to a track with a given ID from this atmosphere's track array.
    Doing so allows the track's object to be garbage collected.
    */
    removeTrack(trackId) {
        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i];
            if (track.id == trackId) {
                this.tracks.splice(i, 1);
            }
        }
    }

    hideTracks(callback) {
        this.tracks.forEach(function(element) {
            $(element.$trackHTML).slideUp('fast');
        });
    }

    showTracks() {
        this.tracks.forEach(function(element) {
            $(element.$trackHTML).slideDown('slow');
        });
    }

    toggleMute() {
        this.am.toggleMuteMultiplier();
        this.updateTrackVolumes();
    }

    setVolume(newVolume) {
        this.am.volume = g.clamp(0, newVolume, 1);
        this.updateTrackVolumes();
    }

    updateTrackVolumes() {
        // Loop through tracks and update them
        this.tracks.forEach(function(track) {
            track.updateVolume();
        });
    }

    play() {
        this.tracks.forEach(function(element) {
            element.begin();
        });

        this.hidePlayButtons();
    }

    stop() {
        this.tracks.forEach(function(element) {
            element.stop();
        });
        this.showPlayButtons();
    }

    hidePlayButtons() {
        this.$addBtn.hide();
        this.$replaceBtn.hide();
        this.$stopBtn.show();
    }

    showPlayButtons() {
        this.$addBtn.show();
        this.$replaceBtn.show();
        this.$stopBtn.hide();
    }

    delete() {
        // Loop through tracks and delete them
        this.tracks.forEach((track) => {
            // Don't remove tracks from array mid-loop, as that causes tracks to be skipped
            track.delete(true);
        });
        // Delete html element
        this.$atmosphereHTML.slideUp('fast', function() {
            this.remove();
        });
        // Remove from atmosphere manager array
        if (g.atmosphereManager.activeAtmosphere == this) {
            g.atmosphereManager.activeAtmosphere = null;
        }
        g.atmosphereManager.atmospheres[this.id] = null; //TODO: replace with splicing to avoid wasted array spaces
    }

    handleAutoplay() {
        if (g.$autoplayCheckbox.is(":checked")) {
            this.hidePlayButtons();
        }
        
    }
}

export default Atmosphere;