import $ from 'jquery';
import Handlebars from 'handlebars';

import DataManager from './DataManager';
import AtmosphereManager from './AtmosphereManager';

class GlobalVars {
    // Do all jquery searches here, then other classes can import this file as g and use g.$trackList for example

    constructor() {
        this.$trackList         = $("#trackList");          // The div containing all tracks
        this.$atmosphereList    = $("#atmosphereList");     // The div containing all atmospheres
        this.$searchResults     = $("#searchResults");      // The ul containing all search results
        this.$searchBarInput    = $("#searchBarInput");
        this.$sideBar           = $(".sidebar");
        this.$sideBarFooter     = $(".sidebar__footer");
        this.$mainContent       = $(".main-content");
        this.$autoplayCheckbox  = $("#autoplayCheckbox");
        this.$searchBarClearBtn = $("#searchBarClearBtn");
        this.$editingTitle      = null;
        
        this.trackPrefix        = "/audio/converted/";
        this.fileTypes          = ['.webm', '.mp3'];

        
        this.atmosphereManager = new AtmosphereManager();
        
        this.dataManager = new DataManager();

        // this.compileTemplates();

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
        this.$mainContent.toggleClass("full-width");
    }

    stopEditingTitle() {
        if (g.$editingTitle != null) {
            this.$editingTitle.prop('contenteditable', false).toggleClass('editable');
            this.$editingTitle = null;
        }
    }

    // compileTemplates() {
    //     var that = this;
    //     var template;
    //     // TODO: move paths to variable
    //     $.get("/templates/track.html", function(rawTemplate) {
    //         template = Handlebars.compile(rawTemplate);
    //         that.trackTemplate = template;
    //     });
    //     $.get("/templates/atmosphere.html", function(rawTemplate) {
    //         template = Handlebars.compile(rawTemplate);
    //         that.atmosphereTemplate = template;
    //     });
    //     $.get("/templates/oneshot.html", function(rawTemplate) {
    //         template = Handlebars.compile(rawTemplate);
    //         that.oneshotTemplate = template;
    //     });
    // }

    selectElementContents(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    convertToFilenames(filename) {
        var filenames = [],
        that = this;
        this.fileTypes.forEach( (fileType) => {
            filenames.push(that.trackPrefix + filename + fileType);
        });
        // console.log('GlobalVars.js:convertToFilenames:filenames:');
        // console.log(filenames);
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