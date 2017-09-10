
import { g } from './GlobalVars';

class PersistenceManager {

    constructor() {
        if (this.storageEmpty()) {
            // Initialize storage
            localStorage.setItem('atmospheres', JSON.stringify([]));
        } else {
            console.log('full');
            // TODO: reload stored atmospheres
            loadAtmospheres();
        }
    }

    storageEmpty() {
        return !localStorage.getItem('atmospheres');
    }

    // TODO: call this whenever a setting is changed (atmosphere volume, atmosphere name, track volume, one-shot timing, atmosphere creation/deletion, track creation/deletion)
    // TODO: store global volume as well (?)
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
                currentAtmosphere.tracks = [];

                // Loop through the current atmosphere's tracks
                for (let track of atmosphere.tracks) {
                    collection = track.getCollection();
                    console.log('collection:', collection);
                    currentTrack = {};
                    currentTrack.id = track.data.resourceId;    // Store its id
                    currentTrack.collection = collection;       // Store its collection ('track' or 'oneshot')
                    currentTrack.volume = track.volume;         // Store its volume
                    // If the current track is a one-shot, store its timings
                    if (collection === 'oneshots') {
                        currentTrack.minIndex = track.minIndex;
                        currentTrack.maxIndex = track.maxIndex;
                    }
                    currentAtmosphere.tracks.push(currentTrack);
                }

                atmospheres.push(currentAtmosphere);
            }
        }
        
        console.log(atmospheres);
        localStorage.setItem('atmospheres', JSON.stringify(atmospheres));
        
    }

    loadAtmospheres() {
        //TODO:
    }

}

export default PersistenceManager;