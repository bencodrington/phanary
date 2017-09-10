import $ from 'jquery';
import Handlebars from 'handlebars';

import DataManager from './DataManager';
import AtmosphereManager from './AtmosphereManager';
import TrackManager from './TrackManager';
import Sidebar from './Sidebar';
import PersistenceManager from './PersistenceManager';

class GlobalVars {

    /*
        A utility class containing references to classes that should act as
        singletons (e.g. atmosphereManager, dataManager, etc.).
        Also contains general purpose helper functions.
    */

    constructor() {
        
        this.$autoplayCheckbox  = $("#autoplayCheckbox");
        
        this.trackPrefix        = "/audio/converted/";
        this.fileTypes          = ['.webm', '.mp3'];

        this.atmosphereManager = new AtmosphereManager();
        this.trackManager = new TrackManager();
        this.dataManager = new DataManager();
        this.sidebar = new Sidebar();

        if (this.storageAvailable('localStorage')) {
            this.pm = new PersistenceManager();
        }
    }

    /*
        From:
        https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    */
    storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage.length !== 0;
        }
    }

    /* Highlights the contents of a given element, used when editing atmosphere titles */
    selectElementContents(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    /*
        Creates an array of full filenames by prepending the path, and appending the accepted filetypes
        e.g convertToFilenames("test") returns ["/audio/converted/test.webm", "/audio/converted/test.mp3"]
    */
    convertToFilenames(filename) {
        var filenames = [],
        that = this;
        this.fileTypes.forEach( (fileType) => {
            filenames.push(that.trackPrefix + filename + fileType);
        });
        return filenames;
    }

    /* Returns a pseudorandom integer in the range [0, max - 1] */
    getRandomInt(max) {
        max = Math.floor(max);
        return Math.floor(Math.random() * max);
    }

    /*
        Returns min if number < min,
        max if number > max,
        number otherwise
    */
    clamp(min, number, max) {
        return Math.min(Math.max(number, min), max);
    }
}

export let g = new GlobalVars();