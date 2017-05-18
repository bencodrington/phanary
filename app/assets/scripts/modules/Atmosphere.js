import $ from 'jquery';

import Track from './Track.js';
import AudioManager from './AudioManager';
import { g } from "./GlobalVars.js";

class Atmosphere {

    // exAtmosphereData = {
    //     name: 'Example Atmosphere Data',
    //     tracks: [],
    //     color: 'default'
    // }

    constructor(atmosphereData) {
        this.tracks = [];
        this.data = atmosphereData;
        this.instantiateTracks(atmosphereData.tracks);
        this.idCounter = 0;
        this.am = new AudioManager();         // Controls this atmosphere's list of audio sources

        this.createElement();
    }

    createElement() {
        
        // TODO: check if template is compiled or not
        
        // Convert object to HTML
        var atmosphereHTML = g.atmosphereTemplate(this.data);

        // Add to tracklist
        var $atmosphereHTML = $(atmosphereHTML).hide().prependTo(g.$atmosphereList).show('fast'); // TODO: only add to current atmosphere tracklist

        // // Rig play, stop, and delete buttons to function
        // var $playBtn = $atmosphereHTML.find(".btn--play-track");
        // var $stopBtn = $atmosphereHTML.find(".btn--stop-track");
        // var $delBtn = $atmosphereHTML.find(".btn--delete");
        // var that = this;
        // $playBtn.on('click', function() {
        //     that.play();
        // });
        // $stopBtn.on('click', function() {
        //     that.stop();
        // });
        // $delBtn.on('click', function() {
        //     that.delete();
        // });

        this.$atmosphereHTML = $atmosphereHTML;

    }

    instantiateTracks(tracks) {
        var track;
        var that = this;
        this.tracks.forEach(function(trackData) {
            that.addTrack(trackData);
        }, this);
    }

    addTrack(trackObject) {

        // Get track information
        trackObject.id = this.idCounter;
        this.idCounter++;
        
        // Create track data object
        var track;
        track = new Track(trackObject, this);

        // Add track to array
        this.tracks.push(track);
    }

    removeTrack(trackId) {
        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i].id;
            if (track.id == trackId) {
                this.tracks.splice(i, 1);
            }
        }
    }
}

export default Atmosphere;