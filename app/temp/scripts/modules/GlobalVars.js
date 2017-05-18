import $ from 'jquery';
import Handlebars from 'handlebars';


import DataReader from './DataReader';

var trackDataURL = "assets/data/tracks.json"; //https:api.myjson.com/bins/15eiip";
var atmosphereDataURL = "assets/data/atmospheres.json";

class GlobalVars {
    // Do all jquery searches here, then other classes can import this file as g and use g.searchResults for example

    constructor() {
        this.$trackList         = $("#trackList"); // The div containing all tracks
        this.$atmosphereList    = $("#atmosphereList"); // The div containing all atmospheres
        this.$searchResults     = $("#searchResults"); // The ul containing all search results
        this.$searchBarInput    = $("#searchBarInput");
        this.$autoplayCheckbox  = $("#autoplayCheckbox");
        this.$searchBarClearBtn = $("#searchBarClearBtn");
        
        this.trackIdCounter     = 0;
        this.trackPrefix        = "assets/audio/tracks/";

        
        this.trackDataReader = new DataReader(trackDataURL, this.onTrackDataReadComplete.bind(this));
        this.atmosphereDataReader = new DataReader(atmosphereDataURL, this.onAtmosphereDataReadComplete.bind(this));

        this.compileTemplates();
    }
    
    onTrackDataReadComplete(trackData) {
        this.trackData = trackData;
        this.trackDataReader.populateSearchResults(trackData.tracks, "result--track");
    }
    
    onAtmosphereDataReadComplete(atmosphereData) {
        this.atmosphereData = atmosphereData;
        this.atmosphereDataReader.populateSearchResults(atmosphereData.atmospheres, "result--atmosphere");
    }

    compileTemplates() {
        var that = this;
        var template;
        // TODO: move paths to variable
        $.get("assets/templates/track.html", function(rawTemplate) {
            template = Handlebars.compile(rawTemplate);
            that.trackTemplate = template;
        });
        $.get("assets/templates/atmosphere.html", function(rawTemplate) {
            template = Handlebars.compile(rawTemplate);
            that.atmosphereTemplate = template;
        });
    }

    nameToTrackData(name) {
        if (this.trackData == null) {
            console.error("Track Data failed to fetch from server. Cannot add track.");
            return;
        }
        var trackObject = this.trackData.tracks[name];
        trackObject.name = name;
        return trackObject;
    }

    nameToAtmosphereData(name) {
        if (this.atmosphereData == null) {
            console.error("Atmosphere Data failed to fetch from server. Cannot add atmosphere.");
            return;
        }
        var atmosphereObject = this.atmosphereData.atmospheres[name];
        atmosphereObject.name = name;
        return atmosphereObject;
    }

}

export let g = new GlobalVars();