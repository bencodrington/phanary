class AudioManager {
    constructor() {
        this.audio = []; // The master list of audio sources
        this.fadeLength = 1500; // Milliseconds
        this.volume = 1; // The volume modifier for all of an atmosphere's tracks
    }

    playTrack(trackID, volume) {
        // console.log('AudioManager: playing track #' + trackID);
        var track = this.audio[trackID];
        track.off('fade');
        track.play();
        track.fade(track.volume(), this.volume * volume, this.fadeLength);
    }

    stopTrack(trackID, callback) {
        // console.log('AudioManager: stopping track #' + trackID);
        var that = this;
        var track = this.audio[trackID];
        track.fade(track.volume(), 0, this.fadeLength);
        track.once('fade', function() {
            // console.log('AudioManager: finishing track stop');
            that.audio[trackID].stop();
            if (callback) {
                callback();
            }
        });
    }

    toggleTrackMute(trackID) {
        var track = this.audio[trackID];
        if (track.mute()) {
            track.mute(false);
        } else {
            track.mute(true);
        }
    }

    setTrackMute(trackID, muted) {
        var track = this.audio[trackID];
        track.mute(muted);
    }

    

    setTrackVolume(trackID, newVolume) {
        var track = this.audio[trackID];
        track.volume(this.volume * newVolume);
    }

    unloadTrack(trackID) {
        var track = this.audio[trackID];
        track.unload();
    }
}

export default AudioManager;