import $ from 'jquery';

import { g } from "./GlobalVars.js";
import Atmosphere from './Atmosphere';

var activeClass = 'section--atmosphere--active';

class AtmosphereManager {

    constructor() {
        this.id_counter         = 0;    // Used for assigning instantiated tracks a unique integer ID
        this.muteMultiplier     = 1;    // 0 if global mute is on, 1 if it's not (TODO: look into howler.js global mute method)
        this.volume             = 1;    // The global volume modifier, affects all sounds
        this.atmospheres        = [];   // An array of all atmospheres
        this.activeAtmosphere   = null; // The currently selected atmosphere, whose tracks are being displayed

        this.$newAtmosphereBtn  = $('#newAtmosphereBtn');

        this.events();
    }

    events() {
        // Rig new atmosphere button to call newAtmosphere();
        this.$newAtmosphereBtn.on('click', function() {
            this.newAtmosphere();
        }.bind(this));

        // Deselect active atmosphere on sidebar background click
        $('.sidebar').on('click', function() {
            this.deselectActiveAtmosphere();
        }.bind(this));

        // ...But not if clicking the footer
        $('.sidebar__footer').on('click', function(e) {
            e.stopPropagation();
        });
        this.rigVolumeControls();
    }

    // Called when 'Create custom atmosphere' button is clicked,
    //  and when a track is added but no tracks exist.
    newAtmosphere() {
        var emptyAtmosphere = {
            name: 'Custom Atmosphere',
            tracks: [],
            color: 'default'
        }
        this.addAtmosphere(emptyAtmosphere);
    }

    // Called when enter is pressed in the search bar, or a result is clicked
    addSelected($selected) {
        var id = $selected.data('db-id');
        if ($selected.hasClass("result--track")) {
            g.dataManager.getData('tracks', id, function(result) {
                this.addTrack(result, 'track');
            }.bind(this));
        } else if ($selected.hasClass("result--oneshot")) {
            g.dataManager.getData('oneshots', id, function(result) {
                this.addTrack(result, 'oneshot');
            }.bind(this));
        } else if ($selected.hasClass("result--atmosphere")) {
            g.dataManager.getData('atmospheres', id, function(result) {
                this.addAtmosphere(result);
            }.bind(this));
        }
    }

    // Called when enter is pressed in the search bar, while a track is highlighted.
    //  Also called by this.newAtmosphere();
    addAtmosphere(atmosphereData) {
        var atmosphere = new Atmosphere(atmosphereData, this.id_counter);
        this.id_counter++;
        this.atmospheres.push(atmosphere)
        this.setActiveAtmosphere(atmosphere);
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
    addTrack(trackData, type) {
        if (this.activeAtmosphere == null) {
            this.newAtmosphere();
        }

        this.activeAtmosphere.addTrack(trackData, type);
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

}

export default AtmosphereManager;