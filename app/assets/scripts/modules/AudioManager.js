import { g } from "./GlobalVars.js";

class AudioManager {

    constructor() {
        this.audio = [];            // Array containing all Howler objects for the containing atmosphere
        this.fadeLength = 1500;     // How long loops take to fade in and out when started or stopped, in ms
        this.volume = 1;            // The atmosphere's volume: a volume multiplier applied to each of an atmosphere's tracks
        this.muteMultiplier = 1;    // 0 if the containing atmosphere is muted, 1 if it's not
    }

    addTrack(id, howl) {
        this.audio[id] = howl;
        this.audio[id].volume(0);
    }

    addOneShotSet(id, howls) {
        this.audio[id] = howls;
    }

    playTrack(trackID, volume) {
        var track = this.audio[trackID];
        if (this.isOneShot(track)) {
            // Randomly select one of the samples to play
            var sampleToPlay = track[g.getRandomInt(track.length)];
            sampleToPlay.play();
        } else {
            track.off('fade'); // if currently fading in/out, forget about that
            track.play();
            track.fade(track.volume(), this.calculateVolume(volume), this.fadeLength); // begin fading to full volume
        }
        
    }

    stopTrack(trackID, callback) {
        var track = this.audio[trackID];
        if (this.isOneShot(track)) {
            // One-shot
            track.forEach(function(sample) {
                sample.stop(); // stop all samples
            });
        } else {
            // Loop
            track.fade(track.volume(), 0, this.fadeLength); // start fading out
            track.once('fade', function() {
                track.stop(); // stop playing loop upon fade completion
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
                sample.mute(!sample.mute());
            });
        } else {
            // Loop
            track.mute(!track.mute());
        }
        
    }

    toggleMuteMultiplier() {
        this.muteMultiplier = 1 - this.muteMultiplier;
    }

    setTrackVolume(trackID, newVolume) {
        var track = this.audio[trackID];
        if (this.isOneShot(track)) {
            // One-shot
            track.forEach(function(sample) {
                sample.volume(this.calculateVolume(newVolume));
            }, this);
        } else {
            // Loop
            track.volume(this.calculateVolume(newVolume));
        }
        
    }

    calculateVolume(trackVolume) {
        return g.atmosphereManager.muteMultiplier   // Whether global mute is checked
            * g.atmosphereManager.volume            // Global volume modifier
            * this.muteMultiplier                   // Whether this atmosphere's mute button is checked
            * this.volume                           // This atmosphere's volume modifier
            * trackVolume                           // This track's volume modifier
    }

    unloadTrack(trackID) {
        var track = this.audio[trackID];
        if (this.isOneShot(track)) {
            // One-shot
            track.forEach(function(sample) {
                sample.unload();
            });
        } else {
            // Loop
            track.unload();
        }
    }

    isOneShot(track) {
        return Array.isArray(track);
    }
}

export default AudioManager;