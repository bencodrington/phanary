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

    // Called when enter is pressed in the search bar, while a track is highlighted
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

    removeAtmosphereFromArray(atmosphere) {
        var indexOfAtmosphere = this.getPositionInArray(atmosphere);
        this.atmospheres.splice(indexOfAtmosphere, 1);
    }

    // Returns the integer position of the passed-in atmosphere
    getPositionInArray(atmosphere) {
        var indexOfAtmosphere = this.atmospheres.indexOf(atmosphere);
        if (indexOfAtmosphere < 0) {
            // Atmosphere was not found in the array
            console.error('AtmosphereManager.js:getPositionInArray(): Atmosphere not found');
        }
        return indexOfAtmosphere;
    }

    // Inserts the atmosphere that is currently being dragged (if there is one)
    //  at the given position in this class's array
    insertDraggingAtmosphereAtPosition(insertIndex) {
        // Find current index of atmosphere that is being dragged
        var indexOfDragging = this.atmospheres.indexOf(g.dragManager.draggingAtmosphere);
        if (indexOfDragging < 0) {
            // Atmosphere was not found in the array
            console.error('AtmosphereManager.js:insertDraggingAtmosphereAfter(): Dragging atmosphere not found.');
            return;
        }
        this.moveAtmosphereAtPosition(indexOfDragging, insertIndex);
    }

    // Moves the atmosphere at the first given position to the second
    //  given position.
    moveAtmosphereAtPosition(currentIndex, insertIndex) {
        // Remove atmosphere that is being moved from 'atmospheres' array
        var movingAtmosphere = this.atmospheres.splice(currentIndex, 1)[0];
        // Return it to the array at its new position
        this.atmospheres.splice(insertIndex, 0, movingAtmosphere);
        // Update localStorage
        g.pm.storeAtmospheres();
    }

    // Takes an atmosphere object and a positive or negative integer
    //  and moves the atmosphere the number of positions and in the
    //  direction specified by the integer.
    modifyAtmospherePosition(atmosphere, modification) {
        // Get current position of atmosphere
        var currentPosition = this.getPositionInArray(atmosphere);
        // Modify that by the passed in value
        var newPosition = currentPosition + modification;
        // Ensure the new position is within the bounds of the array
        newPosition = g.clamp(0, newPosition, this.atmospheres.length - 1);
        // Finally, insert back into the array at its new position
        this.moveAtmosphereAtPosition(currentPosition, newPosition);
    }

}

export default AtmosphereManager;