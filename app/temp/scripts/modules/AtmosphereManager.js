import $ from 'jquery';

import DataReader from './DataReader';
import Atmosphere from './Atmosphere';

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

    setActiveAtmosphere(atmosphere) {
        // TODO: set 'active' class
        this.activeAtmosphere = atmosphere;
    }

    // Called when enter is pressed in the search bar, while a track is highlighted.
    //  Also called by this.newAtmosphere();
    addAtmosphere(atmosphereData) {
        // TODO: read atmosphere template and generate a new one with the current id
        // TODO: increment id_counter
        var atmosphere = new Atmosphere(atmosphereData);
        this.atmospheres.push(atmosphere)
        this.setActiveAtmosphere(atmosphere);
        console.log('AtmosphereManager: Adding atmosphere: ' + atmosphereData.name);
    }

    // Called when enter is pressed in the search bar, while a track is highlighted.
    addTrack(trackData) {
        console.log('AtmosphereManager: Adding track "' + trackData.name + '" to current atmosphere.')
        if (this.activeAtmosphere == null) {
            console.log('AtmosphereManager: Current atmosphere is null. Creating new atmosphere...');
            this.newAtmosphere();
        }

        this.activeAtmosphere.addTrack(trackData);
    }

}

export default AtmosphereManager;