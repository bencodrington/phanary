
import { g } from './GlobalVars';

class PersistenceManager {

    constructor() {
        if (this.storageEmpty()) {
            // Initialize storage
            localStorage.setItem('atmospheres', JSON.stringify([]));
        }
    }

    storageEmpty() {
        return !localStorage.getItem('atmospheres');
    }

    /*
        Records the current state of the app in the browser's localStorage,
        overwriting whatever was previously stored.
        Called whenever a recorded setting is changed.
            (atmosphere volume, atmosphere name, track volume,
            one-shot timing, atmosphere creation/deletion, track creation/deletion)
    */
     storeAtmospheres() {
        var atmospheres = [];
        var currentAtmosphere, currentTrack, collection;
        // Loop through g.am.atmospheres
        for (let atmosphere of g.atmosphereManager.atmospheres) {
            // If the current atmosphere is null, skip it
            if (atmosphere) {
                // Else, reinitialize currentAtmosphere to an empty object
                currentAtmosphere = {};
                currentAtmosphere.name = atmosphere.getTitle();     // Store its name
                currentAtmosphere.volume = atmosphere.am.volume;    // Store its volume
                currentAtmosphere.combinedTracks = [];

                // Loop through the current atmosphere's tracks
                for (let track of atmosphere.tracks) {
                    collection = track.getCollection();
                    currentTrack = {};
                    currentTrack.id = track.data._id;       // Store its id
                    currentTrack.collection = collection;   // Store its collection ('track' or 'oneshot')
                    currentTrack.volume = track.volume;     // Store its volume
                    // If the current track is a one-shot, store its timings
                    if (collection === 'oneshots') {
                        currentTrack.minIndex = track.minIndex;
                        currentTrack.maxIndex = track.maxIndex;
                    }
                    currentAtmosphere.combinedTracks.push(currentTrack);
                }

                atmospheres.push(currentAtmosphere);
            }
        }
        localStorage.setItem('atmospheres', JSON.stringify(atmospheres));
    }

    loadAtmospheres() {
        var atmospheres = JSON.parse(localStorage.getItem('atmospheres'));
        for (let atmosphere of atmospheres) {
            g.atmosphereManager.addAtmosphere(atmosphere, true);
        }
    }

}

export default PersistenceManager;