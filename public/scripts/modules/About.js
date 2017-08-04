import $ from 'jquery';

class About {

    /*
        Contains the functionality for the 'About' modal that opens when the Phanary logo is clicked.
    */

    constructor() {
        this.popupLifetime = 10000;                 // The length of time(ms), until the popup element is removed

        // cache DOM elements
        this.$about = $('.about');                  // The modal div element
        this.$popup = $(".navbar__brand__popup");   // The shaking/fading tooltip element
        this.rigToggleButtons();
        this.managePopup();
    }

    rigToggleButtons() {
        $('.about__open').on('click', this.open.bind(this));
        $('.about__close').on('click', this.close.bind(this));
    }

    open() {
        this.$about.removeClass('about--closed');
    }

    close() {
        this.$about.addClass('about--closed');
    }

    /* Manages time-based popup events */
    managePopup() {
        // Begin popup animations
        this.$popup.addClass("hidden");

        // Remove the popup after popupLifetime has elapsed
        setTimeout(() => {
            this.$popup.remove();
        }, this.popupLifetime)
    }

}

export default About;