import $ from 'jquery';

import DataManager from './DataManager';
import AtmosphereManager from './AtmosphereManager';
import TrackManager from './TrackManager';
import Sidebar from './Sidebar';
import PersistenceManager from './PersistenceManager';
import DragManager from './DragManager';

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

        this.atmosphereManager  = new AtmosphereManager();
        this.trackManager       = new TrackManager();
        this.dataManager        = new DataManager();
        this.sidebar            = new Sidebar();
        this.dragManager        = new DragManager();

        if (this.storageAvailable('localStorage')) {
            this.pm = new PersistenceManager();
        }

        this.events();
        
        // Ensure only working controls show on browsers without
        //  pointer event support
        if (!window.PointerEvent) { 
            // Pointer events aren't supported
            $('html').addClass('no-pointer-events');
          }
    }

    events() {
        // Update PersistenceManager's model of the autoplay checkbox on click
        this.$autoplayCheckbox.on('click', function(e) {
            g.pm.storeAutoplayCheckboxState(this.$autoplayCheckbox.is(':checked'));
            e.stopPropagation();
        }.bind(this));
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

    debounce(callback, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => callback.apply(context, args), delay);
        }
    }

    setAutoplayCheckboxState(isChecked) {
        this.$autoplayCheckbox.prop('checked', isChecked);
    }
}

export let g = new GlobalVars();