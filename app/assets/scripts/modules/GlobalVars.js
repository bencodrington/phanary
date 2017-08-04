import $ from 'jquery';
import Handlebars from 'handlebars';

import DataManager from './DataManager';
import AtmosphereManager from './AtmosphereManager';
import Sidebar from './Sidebar';

class GlobalVars {

    constructor() {
        this.$trackList         = $("#trackList");          // The div containing all tracks
        this.$atmosphereList    = $("#atmosphereList");     // The div containing all atmospheres
        this.$searchResults     = $("#searchResults");      // The ul containing all search results
        this.$searchBarInput    = $("#searchBarInput");
        this.$autoplayCheckbox  = $("#autoplayCheckbox");
        this.$searchBarClearBtn = $("#searchBarClearBtn");
        this.$editingTitle      = null;
        
        this.trackPrefix        = "/audio/converted/";
        this.fileTypes          = ['.webm', '.mp3'];

        
        this.atmosphereManager = new AtmosphereManager();
        this.dataManager = new DataManager();
        this.sidebar = new Sidebar();

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
            that.sidebar.hide();
        });

    }

    hideSidebar() {
        
    }

    stopEditingTitle() {
        if (g.$editingTitle != null) {
            this.$editingTitle.prop('contenteditable', false).toggleClass('editable');
            this.$editingTitle = null;
        }
    }

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