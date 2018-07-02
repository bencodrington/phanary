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
        this.$HTML.on('click', function(e) {
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

        // Update PersistenceManager's model of the lock checkbox on click
        this.$lockCheckbox.on('click', function(e) {
            g.pm.storeLockCheckboxState(this.$lockCheckbox.is(':checked'));
            e.stopPropagation();
        }.bind(this));

        // Stop lock checkbox click events from propagating and deselecting
        //  currently active atmosphere
        this.$lockCheckbox.parent().on('click', function(e) {
            e.stopPropagation();
        });
    }

    /*
        Apply the 'sidebar--hidden' class to the sidebar,
        and the 'full-width' class to the main content div
    */
    hide(ignoreLockBox) {
        if (!ignoreLockBox && this.$lockCheckbox.is(':checked')) {
            return;
        }
        this.$HTML.toggleClass("sidebar--hidden");
        this.$footerHTML.toggleClass("sidebar--hidden");
        this.$mainContent.toggleClass("full-width");
    }

    setLockCheckboxState(isChecked) {
        this.$lockCheckbox.prop('checked', isChecked);
    }

}

export default Sidebar;