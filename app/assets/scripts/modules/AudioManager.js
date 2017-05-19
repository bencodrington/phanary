class AudioManager {
    constructor() {
        this.audio = []; // The master list of audio sources
        this.fadeLength = 1500; // Milliseconds
        this.volume = 1; // TODO: The volume modifier for all of an atmosphere's tracks
    }

    playTrack(trackID, volume) {
        // console.log('AudioManager: playing track #' + trackID);
        var track = this.audio[trackID];
        track.volume(0);
        track.play();
        track.fade(0, this.volume * volume, this.fadeLength);
    }

    stopTrack(trackID) {
        // console.log('AudioManager: stopping track #' + trackID);
        var that = this;
        var track = this.audio[trackID];
        track.fade(track.volume(), 0, this.fadeLength);
        track.on('fade', function() {
            that.audio[trackID].stop();
        });
        
    }

    setTrackVolume(trackID, newVolume) {
        var track = this.audio[trackID];
        track.volume(this.volume * newVolume);
    }
}

export default AudioManager;