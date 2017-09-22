import $ from 'jquery';
import { g } from "./GlobalVars.js";

class Sidebar {

    /*
        Contains the functionality for the sidebar section that contains the list of atmospheres.
    */

    constructor() {
        this.$HTML          = $(".sidebar");
        this.$footerHTML    = this.$HTML.find(".sidebar__footer");
        this.$lockCheckbox  = this.$HTML.find("#lockCheckbox");
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
            this.hide(true);
        }.bind(this));
    }

    /*
        Apply the 'mobile-hidden' class to the sidebar,
        and the 'full-width' class to the main content div
    */
    hide(ignoreLockBox) {
        if (!ignoreLockBox && this.$lockCheckbox.is(':checked')) {
            return;
        }
        this.$HTML.toggleClass("mobile-hidden");    // TODO: refactor 'mobile-hidden' to just 'hidden'?
        this.$footerHTML.toggleClass("mobile-hidden");
        this.$mainContent.toggleClass("full-width");
    }

}

export default Sidebar;