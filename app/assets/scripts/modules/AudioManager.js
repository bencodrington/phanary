class AudioManager {
    constructor() {
        this.audio = []; // The master list of audio sources
        // TODO: this.volume = 1; // The volume modifier for all of an atmosphere's tracks
    }

    playTrack(trackID) {
        console.log('AudioManager: playing track #' + trackID);
        // TODO: fade in?
        this.audio[trackID].play();
    }

    stopTrack(trackID) {
        console.log('AudioManager: stopping track #' + trackID);
        // TODO: fade out?
        this.audio[trackID].stop();
    }
}

export default AudioManager;