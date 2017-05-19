import $ from 'jquery';

import DataReader from './DataReader';
import Atmosphere from './Atmosphere';

var activeClass = 'section--atmosphere--active';

class AtmosphereManager {

    constructor() {
        this.id_counter = 0;
        this.atmospheres = [];
        this.activeAtmosphere = null;
        this.$newAtmosphereBtn = $('#newAtmosphereBtn');

        this.events();
    }

    events() {
        // Rig new atmosphere button to call newAtmosphere();
        this.$newAtmosphereBtn.on('click', function() {
            this.newAtmosphere();
        }.bind(this));

        // Exit title edit mode if not
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

    // Called when enter is pressed in the search bar, while a track is highlighted.
    //  Also called by this.newAtmosphere();
    addAtmosphere(atmosphereData) {
        // TODO: read atmosphere template and generate a new one with the current id
        // TODO: increment id_counter
        var atmosphere = new Atmosphere(atmosphereData, this.id_counter);
        this.id_counter++;
        this.atmospheres.push(atmosphere)
        this.setActiveAtmosphere(atmosphere);
        // console.log('AtmosphereManager: Adding atmosphere: ' + atmosphereData.name);
    }

    setActiveAtmosphere(atmosphere) {
        if (this.activeAtmosphere == atmosphere) {
            return;
        }

        var oldAtmosphere = this.activeAtmosphere;
        this.activeAtmosphere = atmosphere;

        if (oldAtmosphere != null) {
            // Remove 'active' class from current active atmosphere
            $(oldAtmosphere.$atmosphereHTML).removeClass(activeClass);
            
            // Hide current tracks
            oldAtmosphere.hideTracks();
        }

        // Add 'active' class to new active atmosphere
        $(this.activeAtmosphere.$atmosphereHTML).addClass(activeClass);
        // Show new tracks
        this.activeAtmosphere.showTracks();
    }
    // Called when enter is pressed in the search bar, while a track is highlighted.
    addTrack(trackData) {
        // console.log('AtmosphereManager: Adding track "' + trackData.name + '" to current atmosphere.')
        if (this.activeAtmosphere == null) {
            // console.log('AtmosphereManager: Current atmosphere is null. Creating new atmosphere...');
            this.newAtmosphere();
        }

        this.activeAtmosphere.addTrack(trackData);
    }

}

export default AtmosphereManager;