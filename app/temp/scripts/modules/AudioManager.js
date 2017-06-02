
import { g } from "./GlobalVars.js";

class AudioManager {
    constructor() {
        this.audio = []; // The master list of audio sources
        this.fadeLength = 1500; // Milliseconds
        this.volume = 1; // The volume modifier for all of an atmosphere's tracks
    }

    addTrack(id, howl) {
        this.audio[id] = howl;
        this.audio[id].volume(0);
    }

    addOneShotSet(id, howls) {
        this.audio[id] = howls;
    }

    playTrack(trackID, volume) {
        // console.log('AudioManager: playing track #' + trackID);
        var track = this.audio[trackID];
        if (this.isOneShot(track)) {
            var sampleToPlay = track[g.getRandomInt(track.length)];
            sampleToPlay.play();
        } else {
            track.off('fade');
            track.play();
            track.fade(track.volume(), this.volume * volume, this.fadeLength);
        }
        
    }

    stopTrack(trackID, callback) {
        // console.log('AudioManager: stopping track #' + trackID);
        var that = this;
        var track = this.audio[trackID];
        if (this.isOneShot(track)) {
            // One-shot
            track.forEach(function(sample) {
                sample.stop();
            });
        } else {
            // Loop
            track.fade(track.volume(), 0, this.fadeLength);
            track.once('fade', function() {
                // console.log('AudioManager: finishing track stop');
                that.audio[trackID].stop();
                if (callback) {
                    callback();
                }
            });
        }
    }

    toggleTrackMute(trackID) {
        var track = this.audio[trackID];
        if (this.isOneShot(track)) {
            // One-shot
            track.forEach(function(sample) {
                if (sample.mute()) {
                    sample.mute(false);
                } else {
                    sample.mute(true);
                }
            });
        } else {
            // Loop
            if (track.mute()) {
                track.mute(false);
            } else {
                track.mute(true);
            }
        }
        
    }

    setTrackMute(trackID, muted) {
        var track = this.audio[trackID];
        if (this.isOneShot(track)) {
            // One-shot
            track.forEach(function(sample) {
                sample.mute(muted);
            });
        } else {
            // Loop
            track.mute(muted);
        }
        
    }

    setTrackVolume(trackID, newVolume) {
        var track = this.audio[trackID];
        if (this.isOneShot(track)) {
            // One-shot
            track.forEach(function(sample) {
                sample.volume(this.volume * newVolume);
            }, this);
        } else {
            // Loop
            track.volume(this.volume * newVolume);
        }
        
    }

    unloadTrack(trackID) {
        var track = this.audio[trackID];
        track.unload();
    }

    isOneShot(track) {
        return Array.isArray(track);
    }
}

export default AudioManager;