import $ from 'jquery';

import { g } from "./GlobalVars.js";
import Atmosphere from './Atmosphere';

var activeClass = 'section--atmosphere--active';

class AtmosphereManager {

    constructor() {
        this.id_counter         = 0;    // Used for assigning instantiated tracks a unique integer ID
        this.muteMultiplier     = 1;    // 0 if global mute is on, 1 if it's not
        this.volume             = 1;    // The global volume modifier, affects all sounds
        this.atmospheres        = [];   // An array of all atmospheres
        this.activeAtmosphere   = null; // The currently selected atmosphere, whose tracks are being displayed
        this.$editingTitle      = null; // The title text element of the atmosphere which is currently being renamed

        this.$newAtmosphereBtn  = $('#newAtmosphereBtn');
        this.$list              = $("#atmosphereList"); // The div containing all atmospheres

        this.events();
    }

    events() {
        // Rig new atmosphere button to call newAtmosphere();
        this.$newAtmosphereBtn.on('click', function() {
            this.newAtmosphere();
        }.bind(this));

        // Stop editing title upon mouse click outside the title
        $(document).click(function(event) {
            if (this.$editingTitle != null
                    && !this.$editingTitle.is(event.target)
                    && this.$editingTitle.has(event.target).length === 0) {
                this.stopEditingTitle();
            }
        }.bind(this));

        this.rigVolumeControls();
    }

    // Called when 'Create custom atmosphere' button is clicked,
    //  and when a track is added but no tracks exist.
    newAtmosphere() {
        var emptyAtmosphere = {
            name: 'Custom Atmosphere',
            tracks: []
        }
        this.addAtmosphere(emptyAtmosphere);
    }

    // Called when enter is pressed in the search bar, or a result is clicked
    addSelected($selected) {
        var id = $selected.data('db-id');
        if ($selected.hasClass("result--track")) {
            g.dataManager.getData('tracks', id, function(result) {
                this.addTrack(result, 'tracks');
            }.bind(this));
        } else if ($selected.hasClass("result--oneshot")) {
            g.dataManager.getData('oneshots', id, function(result) {
                this.addTrack(result, 'oneshots');
            }.bind(this));
        } else if ($selected.hasClass("result--atmosphere")) {
            g.dataManager.getData('atmospheres', id, function(result) {
                this.addAtmosphere(result);
            }.bind(this));
        }
    }

    // Called when enter is pressed in the search bar, while a track is highlighted.
    //  Also called by this.newAtmosphere();
    addAtmosphere(atmosphereData, ignoreAutoplay) {
        var atmosphere = new Atmosphere(atmosphereData, this.id_counter, ignoreAutoplay);
        this.id_counter++;
        this.atmospheres.push(atmosphere)
        this.setActiveAtmosphere(atmosphere);
        g.pm.storeAtmospheres();
    }

    setActiveAtmosphere(atmosphere) {
        if (this.activeAtmosphere == atmosphere) {
            return;
        }

        this.deselectActiveAtmosphere();
        this.activeAtmosphere = atmosphere;

        // Add 'active' class to new active atmosphere
        $(this.activeAtmosphere.$atmosphereHTML).addClass(activeClass);
        // Show new tracks
        this.activeAtmosphere.showTracks();
    }

    deselectActiveAtmosphere() {
        var oldAtmosphere = this.activeAtmosphere;
        if (oldAtmosphere != null) {
            // Remove 'active' class from current active atmosphere
            $(oldAtmosphere.$atmosphereHTML).removeClass(activeClass);
            
            // Hide current tracks
            oldAtmosphere.hideTracks();
        }
        this.activeAtmosphere = null;
    }

    // Called when enter is pressed in the search bar, while a track is highlighted.
    addTrack(trackObject, collection) {
        if (this.activeAtmosphere == null) {
            this.newAtmosphere();
        }

        this.activeAtmosphere.addTrack(trackObject, collection);
    }

    switchTo(atmosphere) {
        this.atmospheres.forEach(function(current) {
            if (current) {
                if (current == atmosphere) {
                    current.play();
                } else {
                    current.stop();
                }
            }
        });
    }

    rigVolumeControls() {
        var that = this;
        var $muteBtn = $(".volume__mute-btn-global");
        $muteBtn.on('click', function() {
            that.toggleMute();
        });
        var $volumeSlider = $('.volume__range-global');
        $volumeSlider.on('input', function() {
            that.updateGlobalVolume($volumeSlider.val());
        });

    }

    toggleMute() {
        this.muteMultiplier = 1 - this.muteMultiplier;
        this.updateAllVolumes();
    }

    updateGlobalVolume(newVolume) {
        this.volume = newVolume;
        this.updateAllVolumes();
    }

    updateAllVolumes() {
        this.atmospheres.forEach(function(atmosphere) {
            if (atmosphere) {
                // Make sure atmosphere wasn't deleted
                atmosphere.updateTrackVolumes();
            }
        });
    }

    stopEditingTitle() {
        if (this.$editingTitle != null) {
            this.$editingTitle.prop('contenteditable', false).toggleClass('editable');
            this.$editingTitle = null;
            g.pm.storeAtmospheres();
        }
    }

    // TODO: comments

    removeAtmosphereFromArray(atmosphere) {
        var indexOfAtmosphere = this.getPositionInArray(atmosphere);
        this.atmospheres.splice(indexOfAtmosphere, 1);
    }

    getPositionInArray(atmosphere) {
        var indexOfAtmosphere = this.atmospheres.indexOf(atmosphere);
        if (indexOfAtmosphere < 0) {
            console.error('AtmosphereManager.js:getPositionInArray(): Atmosphere not found');
        }
        return indexOfAtmosphere;
    }

    insertAtmosphereAtPosition(insertIndex) {
        // Find current index of atmosphere that is being dragged
        var indexOfDragging = this.atmospheres.indexOf(g.dragManager.draggingAtmosphere);
        if (indexOfDragging < 0) {
            console.error('AtmosphereManager.js:insertAtmosphereAfter(): Dragging atmosphere not found.');
        }
        // Remove atmosphere that is being dragged from 'atmospheres' array
        var draggingAtmosphere = this.atmospheres.splice(indexOfDragging, 1)[0];
        // Return it to the array at its new position
        this.atmospheres.splice(insertIndex, 0, draggingAtmosphere);
        // Update localStorage
        g.pm.storeAtmospheres();
    }

}

export default AtmosphereManager;