import $ from 'jquery';
import { g } from "./GlobalVars.js";

class Sidebar {

    /*
        Contains the functionality for the sidebar section that contains the list of atmospheres.
    */

    constructor() {
        this.$HTML          = $(".sidebar");
        this.$footerHTML    = this.$HTML.find(".sidebar__footer");

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
            this.toggleHidden();
        }.bind(this));
    }

    /*
        Apply the 'sidebar--hidden' class to the sidebar and footer
    */
    hide() {
        this.$HTML.addClass("sidebar--hidden");
        this.$footerHTML.addClass("sidebar--hidden");
    }

    toggleHidden() {
        this.$HTML.toggleClass("sidebar--hidden");
        this.$footerHTML.toggleClass("sidebar--hidden");
    }

}

export default Sidebar;