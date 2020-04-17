import $ from 'jquery';

import Track from './Track.js';
import OneShot from './OneShot.js';
import AudioManager from './AudioManager';
import { g } from "./GlobalVars.js";
require('./templates/atmosphere');

class Atmosphere {

    constructor(atmosphereData, id, ignoreAutoplay) {
        this.tracks = [];               // An array of all loops and one-shots contained in this atmosphere
        this.data = atmosphereData;     // Contains information like the atmosphere's name, currently only used upon instantiation
        this.id = id;                   // A unique integer used for accessing this atmosphere in the AtmosphereManager's array
        this.idCounter = 0;             // Used for assigning instantiated tracks a unique integer ID
        this.am = new AudioManager();   // Controls this atmosphere's list of audio sources
        
        this.$volumeSlider;

        this.createElement();
        // combinedTracks only exists if the atmosphere is being loadec from localStrage, so that tracks can be regenerated in
        //  the order that they were saved
        //  NOTE: The order can't be guaranteed until track data is loaded asynchronously.
        //      Currently the tracks themselves won't be added to the DOM until after their data is loaded by g.dataManager.getData()
        if (atmosphereData.combinedTracks) {
            this.instantiateCombinedTracks(atmosphereData.combinedTracks);
        } else {
            this.instantiateTracks(atmosphereData.tracks, 'tracks', ignoreAutoplay);
            this.instantiateTracks(atmosphereData.oneshots, 'oneshots', ignoreAutoplay);
        }
        
        // Only display relevant buttons based on whether or not atmosphere should autoplay
        this.handleAutoplay(ignoreAutoplay);
        
        // If atmosphere has a predefined volume (e.g. loading from localStorage), set it
        if (atmosphereData.volume === 0 || atmosphereData.volume) {
            this.setVolumeSlider(atmosphereData.volume);
        }
    }

    /* Creates and adds a corresponding atmosphere div element to the DOM */
    createElement() {
        // Convert object to HTML
        var atmosphereHTML = Handlebars.templates['atmosphere.hbs'](this.data);

        // Add to tracklist
        var $atmosphereHTML = $(atmosphereHTML).appendTo(g.atmosphereManager.$list).hide();
        
        // Hack that corrects the jQuery 'snapping' visual bug
        //  $atmosphereHTML.height() returns an unreliable result if called here, but it's fine 0ms later
        setTimeout(function() {
            $atmosphereHTML.show('fast');
        }, 0);

        this.rigAtmosphereControls($atmosphereHTML);

        this.rigTitleEditing($atmosphereHTML);

        this.rigVolumeControls($atmosphereHTML);
        
        var $delBtn = $atmosphereHTML.find(".btn--delete");
        var $stopBtn = this.$stopBtn = $atmosphereHTML.find(".atmosphere__stop");
        
        var that = this;
        $delBtn.on('click', function(event) {
            that.delete();
            event.stopPropagation();
        });
        $stopBtn.on('click', function() {
            that.stop();
        })
        $stopBtn.hide();

        // TODO:

        // TODO: mousedown touchstart
        $atmosphereHTML.find(".btn--drag").on("pointerdown", function(e) {
            g.dragManager.startDraggingAtmosphere(this, e);
        }.bind(this));

        $atmosphereHTML.hover(
            function() {
                if (g.dragManager.draggingAtmosphere && g.dragManager.draggingAtmosphere != this) {
                    this.$atmosphereHTML.addClass('section--show-drop-zone');
                }
            }.bind(this),

            function() {
                this.$atmosphereHTML.removeClass('section--show-drop-zone');
            }.bind(this)
        );

        // TODO: mouseup
        $atmosphereHTML.on("pointerup", function() {
            if (g.dragManager.draggingAtmosphere) {
                // TODO: move draggingAtmosphere's position in the g.am's array
                g.atmosphereManager.insertDraggingAtmosphereAtPosition(g.atmosphereManager.getPositionInArray(this));
                this.$atmosphereHTML.after(g.dragManager.draggingAtmosphere.$atmosphereHTML);
                this.$atmosphereHTML.removeClass('section--show-drop-zone');
            }
        }.bind(this));

        // Reorder buttons
        $atmosphereHTML.find('.btn--reorder-up').click(function(e) {
            g.dragManager.moveSection(this, 'up', true);
            e.stopPropagation();
        }.bind(this));
        $atmosphereHTML.find('.btn--reorder-down').click(function(e) {
            g.dragManager.moveSection(this, 'down', true);
            e.stopPropagation();
        }.bind(this));
        
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
        var $heading = $atmosphereHTML.find(".card__header");
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
                // enter was pressed, must be in edit mode, so exit edit mode
                that.toggleTitleEditable($titleText);
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
        } else {
            $titleText.removeClass("editable");
        }
    }

    rigVolumeControls($atmosphereHTML) {
        var that = this;
        this.$volumeSlider = $atmosphereHTML.find('.volume input[type=range]');
        this.$volumeSlider.on('input', function() {
            that.setVolume(that.$volumeSlider.val());
            if (g.pm) {
                g.pm.storeAtmospheres();
            }
        });
        var $muteBtn = $atmosphereHTML.find(".btn--mute");
        $muteBtn.on('click', function() {
            that.toggleMute();
        });
    }

    instantiateTracks(tracks, collection, ignoreAutoplay) {
        if (!tracks) {  // Atmosphere contains no loops, no one-shots, or neither
            return;
        }
        tracks.forEach(function(trackData) {
            g.dataManager.getData(collection, trackData.id, function(result) {
                this.addTrack(result, collection, trackData, ignoreAutoplay);
            }.bind(this));
        }, this);
    }

    instantiateCombinedTracks(tracks) {
        if (!tracks) {  // Atmosphere contains no loops, no one-shots, or neither
            return;
        }
        tracks.forEach(function(track) {
            g.dataManager.getData(track.collection, track.id, function(result) {
                this.addTrack(result, track.collection, track, true);
            }.bind(this));
        }, this);
    }

    /*
        trackObject: contains track-specific information pulled from the database (filename, resource ID, etc.)
        collection: "oneshots" or "tracks"
        trackData: contains track-specific information as specified by the containing atmosphere, such as:
            volume: the volume at which to start the track, as specified by the containing atmosphere, if one exists
            min- and
            maxIndex: the indices that specify how often a one-shot is played
    */
    addTrack(trackObject, collection, trackData, ignoreAutoplay) {
        var volume = 1; // Assume full volume by default
        if (trackData && trackData.volume) {  // Track included in the preconfigured atmosphere
            volume = trackData.volume; 
        }
        // Prepare track data for template injection
        trackObject.id = this.idCounter;
        trackObject.atmosphereId = this.id;
        this.idCounter++;
        
        // Create track data object
        var track;
        if (collection === "oneshots") {
            // OneShot
            if (trackData && trackData.minIndex && trackData.maxIndex) { // One-shot included in the preconfigured atmosphere
                track = new OneShot(trackObject, this, volume, trackData.minIndex, trackData.maxIndex, ignoreAutoplay);
            } else {
                track = new OneShot(trackObject, this, volume, OneShot.startMinIndex, OneShot.startMaxIndex, ignoreAutoplay); // Resort to timestep defaults
            }
            
        } else {
            // Default
            track = new Track(trackObject, this, volume, ignoreAutoplay);
        }

        // Add track to array
        this.tracks.push(track);

        // Update localStorage
        g.pm.storeAtmospheres();
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
        g.pm.storeAtmospheres();
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
    
    setVolumeSlider(newVolume) {
        this.$volumeSlider.val(newVolume);
        this.setVolume(newVolume);
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
        g.atmosphereManager.removeAtmosphereFromArray(this);
        // Update localStorage
        g.pm.storeAtmospheres();
    }

    handleAutoplay(ignoreAutoplay) {
        if (g.$autoplayCheckbox.is(":checked") && !ignoreAutoplay) {
            this.hidePlayButtons();
        }
        
    }

    getTitle() {
        var $titleText = this.$atmosphereHTML.find(".card__header__title");
        return $titleText.text();
    }
}

export default Atmosphere;