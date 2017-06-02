import $ from 'jquery';

import Track from './Track.js';
import OneShot from './OneShot.js';
import AudioManager from './AudioManager';
import { g } from "./GlobalVars.js";

class Atmosphere {

    // exAtmosphereData = {
    //     name: 'Example Atmosphere Data',
    //     tracks: [],
    //     color: 'default'
    // }

    constructor(atmosphereData, id) {
        this.tracks = [];
        this.data = atmosphereData;
        this.id = id;
        this.idCounter = 0;
        this.am = new AudioManager();         // Controls this atmosphere's list of audio sources
        this.muted = false;

        this.createElement();
        this.instantiateTracks(atmosphereData.tracks);
    }

    createElement() {
        
        // TODO: check if template is compiled or not
        
        // Convert object to HTML
        var atmosphereHTML = g.atmosphereTemplate(this.data);

        // Add to tracklist
        var $atmosphereHTML = $(atmosphereHTML).hide().prependTo(g.$atmosphereList).show('fast'); // TODO: only add to current atmosphere tracklist


        this.rigTitleEditing($atmosphereHTML);

        this.rigVolumeControls($atmosphereHTML);
        
        var $delBtn = $atmosphereHTML.find(".btn--delete");
        var $stopBtn = this.$stopBtn = $atmosphereHTML.find(".btn--stop");
        var $addBtn = this.$addBtn = $atmosphereHTML.find(".atmosphere__add");
        var $replaceBtn = this.$replaceBtn = $atmosphereHTML.find(".atmosphere__replace");
        var that = this;
        $delBtn.on('click', function(event) {
            that.delete();
            event.stopPropagation();
        });
        $addBtn.on('click', function() {
            that.play();
        });
        $replaceBtn.on('click', function() {
            g.atmosphereManager.switchTo(that);
        })
        $stopBtn.on('click', function() {
            that.stop();
        })
        $stopBtn.hide();
        

        this.$atmosphereHTML = $atmosphereHTML;

    }

    rigTitleEditing($atmosphereHTML) {
        var that = this;
        var $heading = $atmosphereHTML.find(".section__heading");
        var $title = $heading.find(".section__heading__title");
        var $titleText = $title.find(".section__heading__title__text");
        var $rename = $title.find(".atmosphere__rename");

        // Don't deselect current atmosphere if this is clicked
        $atmosphereHTML.on('click', function(e) {
            g.stopEditingTitle();
            e.stopPropagation();
        });

        // Rig heading to set atmosphere as active
        $heading.on('click', function() {
            g.atmosphereManager.setActiveAtmosphere(that);
            g.hideSidebar();
        });

        $titleText.focus(function() {
            g.selectElementContents($titleText[0]);
        });
        
        // Rig rename button to toggle title editability
        $rename.click(function(event) {
            var isEditable = $titleText.is('.editable');
            $titleText.prop('contenteditable', !isEditable);
            g.stopEditingTitle(); // Clear any title currently being edited
            if (!isEditable) {
                $titleText.addClass("editable")
                // If it's now editable,
                //  let GlobalVars know,
                g.$editingTitle = $titleText;
                //  and select it with the cursor.
                $titleText.focus()
                // .delay(100).select();
                // .select();
            } else {
                 $titleText.removeClass("editable")
            }
            // Don't select atmosphere if trying to edit
            event.stopPropagation();
        });
        // Exit edit mode when enter is pressed
        $titleText.on('keydown', function(e) {
            // Enter was pressed
            if (e.keyCode == "13") {
                // Exit edit mode
                $titleText.prop('contenteditable', false).toggleClass('editable');
            }
        });

        $titleText.on('click', function(e) {
            var isEditable = $titleText.is('.editable');
            if (isEditable) {
                e.stopPropagation();
            }
        });

        $titleText.on('select', function(event) {
            // console.log('ya');
            // event.preventDefault();
        })
    }

    rigVolumeControls($atmosphereHTML) {
        var that = this;
        var $volumeSlider = $atmosphereHTML.find('.volume input[type=range]');
        $volumeSlider.on('input', function() {
            that.updateTrackVolumes($volumeSlider.val());
            that.unmute();
        });
        var $muteBtn = $atmosphereHTML.find(".btn--mute");
        $muteBtn.on('click', function() {
            that.mute();
        });
    }

    instantiateTracks(tracks) {
        var track;
        var that = this;
        tracks.forEach(function(trackName) {
            that.addTrack(g.nameToTrackData(trackName));
            // TODO: instantiate them with their atmosphere-defined settings (volume, loop, delay etc.)
        }, this);
    }

    addTrack(trackObject) {
        // console.log("Adding track: " + trackObject.name);
        // Get track information
        trackObject.id = this.idCounter;
        trackObject.atmosphereId = this.id;
        this.idCounter++;
        
        // Create track data object
        var track;
        if (trackObject.type === "oneshot") {
            // OneShot
            track = new OneShot(trackObject, this);
        } else {
            // Default
            track = new Track(trackObject, this);
        }
        

        // Add track to array
        this.tracks.push(track);
    }

    removeTrack(trackId) {
        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i].id;
            if (track.id == trackId) {
                this.tracks.splice(i, 1);
            }
        }
    }

    hideTracks(callback) {
        // console.log('Hiding tracks');
        this.tracks.forEach(function(element) {
            $(element.$trackHTML).slideUp('fast');
        });
    }

    showTracks() {
        // console.log('Hiding tracks');
        this.tracks.forEach(function(element) {
            $(element.$trackHTML).slideDown('slow');
        });
    }

    updateTrackVolumes(newVolume) {
        this.am.volume = newVolume;
        // Loop through tracks and update them
        this.tracks.forEach(function(track) {
            track.updateVolume();
        });
    }

    mute() {
        this.updateTrackVolumes(0);
        // TODO: style mute button
    }

    unmute() {
        // TODO: style mute button;
    }

    play() {
        // console.log('playing tracks');
        this.tracks.forEach(function(element) {
            if (element != null) {
                element.play();
            }
        });

        this.$addBtn.hide();
        this.$replaceBtn.hide();
        this.$stopBtn.show();
    }

    stop() {
        // console.log('stopping tracks');
        this.tracks.forEach(function(element) {
            if (element != null) {
                element.stop();
            }
        });
        this.$addBtn.show();
        this.$replaceBtn.show();
        this.$stopBtn.hide();
    }

    delete() {
        // Loop through tracks and delete them
        this.tracks.forEach(function(track) {
            track.delete();
        });
        // Delete html element
        this.$atmosphereHTML.slideUp('fast', function() {
            this.remove();
        });
        // Remove from atmosphere manager array
        if (g.atmosphereManager.activeAtmosphere == this) {
            g.atmosphereManager.activeAtmosphere = null;
        }
        g.atmosphereManager.atmospheres[this.id] = null;
    }
}

export default Atmosphere;