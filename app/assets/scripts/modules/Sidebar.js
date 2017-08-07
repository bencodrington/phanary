import $ from 'jquery';
import { g } from "./GlobalVars.js";

class Sidebar {

    /*
        Contains the functionality for the sidebar section that contains the list of atmospheres.
    */

    constructor() {
        this.$HTML          = $(".sidebar");
        this.$footerHTML    = this.$HTML.find(".sidebar__footer");
        this.$mainContent   = $(".main-content");

        this.events();
    }

    events() {
        // Deselect active atmosphere on sidebar background click
        this.$HTML.on('click', function() {
            g.atmosphereManager.deselectActiveAtmosphere();
        }.bind(this));

        // ...but not if clicking the footer
        this.$footerHTML.on('click', function(e) {
            g.atmosphereManager.stopEditingTitle(); // ...but still cancel title editing
            e.stopPropagation();
        });

        // Toggle hidden class on sidebar upon when hide button is clicked
        $(".navbar__hide").click(function() {
            this.hide();
        }.bind(this));
    }

    /*
        Apply the 'mobile-hidden' class to the sidebar,
        and the 'full-width' class to the main content div
    */
    hide() {
        // TODO: check if sidebar is not 'locked' open
        this.$HTML.toggleClass("mobile-hidden");    // TODO: refactor 'mobile-hidden' to just 'hidden'?
        this.$footerHTML.toggleClass("mobile-hidden");
        this.$mainContent.toggleClass("full-width");
    }

}

export default Sidebar;