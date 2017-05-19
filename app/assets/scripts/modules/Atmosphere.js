import $ from 'jquery';

import Track from './Track.js';
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
        

        this.$atmosphereHTML = $atmosphereHTML;

    }

    rigTitleEditing($atmosphereHTML) {
        var that = this;
        var $heading = $atmosphereHTML.find(".section__heading");
        var $title = $heading.find(".section__heading__title");
        var $titleText = $title.find(".section__heading__title__text");
        var $rename = $title.find(".atmosphere__rename");

        // Rig heading to set atmosphere as active
        $heading.on('click', function() {
            g.atmosphereManager.setActiveAtmosphere(that);
        });
        
        // Rig rename button to toggle title editability
        $rename.click(function(event) {
            var isEditable = $titleText.is('.editable');
            g.stopEditingTitle(); // Clear any title currently being edited
            $titleText.prop('contenteditable', !isEditable);
            if (!isEditable) {
                $titleText.addClass("editable")
                // If it's now editable,
                //  let GlobalVars know,
                g.$editingTitle = $titleText;
                //  and select it with the cursor.
                $titleText.focus()
                .delay(1).select();
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

        $titleText.on('select', function(event) {
            console.log('ya');
            event.preventDefault();
        })
    }

    rigVolumeControls($atmosphereHTML) {
        var that = this;
        var $volumeSlider = $atmosphereHTML.find('.volume input[type=range]');
        $volumeSlider.on('input', function() {
            that.updateTrackVolumes($volumeSlider.val());
            
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
        console.log("Adding track: " + trackObject.name);
        // Get track information
        trackObject.id = this.idCounter;
        trackObject.atmosphereId = this.id;
        this.idCounter++;
        
        // Create track data object
        var track;
        track = new Track(trackObject, this);

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

    delete() {
        // Loop through tracks and delete them
        this.tracks.forEach(function(track) {
            track.delete();
        });
        // Delete html element
        this.$atmosphereHTML.slideUp('fast', function() {
            this.remove();
        });
    }
}

export default Atmosphere;