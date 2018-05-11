import $ from 'jquery';

class TrackManager {

    /*
        Currently only used for caching a reference to the track list element.
        Felt like something that should be separated from the GlobalVars class.
        TODO: update
    */

    constructor() {
        this.$list          = $("#trackList");  // The div containing all track elements
        this.$dragIcon      = $('.drag-icon');  // TODO: temp
        this.draggingTrack  = null;             // TODO:
    }

}

export default TrackManager;