import $ from 'jquery';
import Handlebars from 'handlebars';
// TODO: import handlebars runtime 
// import handleBars from 'handlebars/handlebars.runtime.js';
// import resultTemplate from './../../../temp/templates/templates.js';


import DataReader from './DataReader';
import DataManager from './DataManager';
import AtmosphereManager from './AtmosphereManager';

// var trackDataURL = "/data/tracks.json";
// var atmosphereDataURL = "/data/atmospheres.json";

class GlobalVars {
    // Do all jquery searches here, then other classes can import this file as g and use g.$searchResults for example

    constructor() {
        this.$trackList         = $("#trackList");          // The div containing all tracks
        this.$atmosphereList    = $("#atmosphereList");     // The div containing all atmospheres
        this.$searchResults     = $("#searchResults");      // The ul containing all search results
        this.$searchBarInput    = $("#searchBarInput");
        this.$sideBar           = $(".sidebar");
        this.$sideBarFooter     = $(".sidebar__footer");
        this.$autoplayCheckbox  = $("#autoplayCheckbox");
        this.$searchBarClearBtn = $("#searchBarClearBtn");
        this.$editingTitle      = null;
        
        this.trackPrefix        = "/audio/tracks/";

        
        this.atmosphereManager = new AtmosphereManager();
        
        this.dataManager = new DataManager();
        // this.trackDataReader = new DataReader(trackDataURL, this.onTrackDataReadComplete.bind(this));
        // this.atmosphereDataReader = new DataReader(atmosphereDataURL, this.onAtmosphereDataReadComplete.bind(this));

        this.compileTemplates();

        this.events();
    }
    
    events() {
        // Stop editing title upon mouse click outside the title
        var that = this;
        $(document).click(function(event) {
            if (that.$editingTitle != null
                    && !that.$editingTitle.is(event.target)
                    && that.$editingTitle.has(event.target).length === 0) {
                that.stopEditingTitle();
            }
        });

        // Toggle hidden class on sidebar upon hide button click
        $(".navbar__hide").click(function() {
            that.hideSidebar();
        });

    }

    hideSidebar() {
        this.$sideBar.toggleClass("mobile-hidden");
        this.$sideBarFooter.toggleClass("mobile-hidden");
    }

    stopEditingTitle() {
        if (g.$editingTitle != null) {
            this.$editingTitle.prop('contenteditable', false).toggleClass('editable');
            this.$editingTitle = null;
        }
    }
    
    // onTrackDataReadComplete(trackData) {
    //     this.trackData = trackData;
    //     this.trackDataReader.populateSearchResults(trackData.tracks);
    // }
    
    // onAtmosphereDataReadComplete(atmosphereData) {
    //     this.atmosphereData = atmosphereData;
    //     this.atmosphereDataReader.populateSearchResults(atmosphereData.atmospheres);
    // }

    compileTemplates() {
        var that = this;
        var template;
        // TODO: move paths to variable
        $.get("/templates/track.html", function(rawTemplate) {
            template = Handlebars.compile(rawTemplate);
            that.trackTemplate = template;
        });
        $.get("/templates/atmosphere.html", function(rawTemplate) {
            template = Handlebars.compile(rawTemplate);
            that.atmosphereTemplate = template;
        });
        $.get("/templates/oneshot.html", function(rawTemplate) {
            template = Handlebars.compile(rawTemplate);
            that.oneshotTemplate = template;
        });
        // $.get("assets/templates/searchResult.html", function(rawTemplate) {
        //     template = Handlebars.compile(rawTemplate);
        //     that.resultTemplate = template;
        // });
        // console.log(Phanary.templates.searchResult());
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

    selectElementContents(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    appendTrackPrefixes(filenames) {
        var that = this;
        filenames = filenames.map(function(filename) {
            return that.trackPrefix + filename;
        });
        return filenames;
    }

    getRandomInt(max) {
        max = Math.floor(max);
        return Math.floor(Math.random() * max);
    }

    clamp(min, number, max) {
        return Math.min(Math.max(number, min), max);
    }
}

export let g = new GlobalVars();