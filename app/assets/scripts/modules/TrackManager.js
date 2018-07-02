import $ from 'jquery';

class TrackManager {

    /*
        Currently only used for caching a reference to the track list element.
        Felt like something that should be separated from the GlobalVars class.
    */

    constructor() {
        this.$list          = $("#trackList");  // The div containing all track elements
    }

}

export default TrackManager;