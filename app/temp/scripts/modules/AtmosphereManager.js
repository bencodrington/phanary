import $ from 'jquery';

import DataReader from './DataReader';

class AtmosphereManager {

    constructor(atmosphereDataURL, searchBar) {
        this.id_counter = 0;
        this.atmospheres = [];
        this.searchBar = searchBar;
        
        this.dataReader = new DataReader(atmosphereDataURL, this.onDataReadComplete.bind(this));

        this.events();
    }

    events() {
        // TODO: Rig new atmosphere button to call newAtmosphere();
    }

    onDataReadComplete(atmosphereData) {
        this.atmosphereData = atmosphereData;
        console.log(atmosphereData);
        this.dataReader.populateSearchResults(atmosphereData.atmospheres, "result--atmosphere");
    }

    addAtmosphere(atmosphereName) {
        // TODO: read atmosphere template and generate a new one with the current id
        // TODO: increment id_counter
        console.log('AtmosphereManager: Adding atmosphere: ' + atmosphereName);
    }


}

export default AtmosphereManager;