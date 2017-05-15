import $ from 'jquery';

class GlobalVars {
    // Do all jquery searches here, then other classes can import this file as g and use g.searchResults for example

    constructor() {
        this.$trackList         = $("#trackList"); // The div containing all tracks
        this.$searchResults     = $("#searchResults"); // The ul containing all search results
        this.$searchBarInput    = $("#searchBarInput");
        this.$autoplayCheckbox  = $("#autoplayCheckbox");
        this.$searchBarClearBtn = $("#searchBarClearBtn");
    }

}

export let g = new GlobalVars();