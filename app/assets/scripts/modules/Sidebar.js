import $ from 'jquery';

class Sidebar {

    /*
        Contains the functionality for the sidebar section that contains the list of atmospheres.
    */

    constructor() {
        this.$HTML          = $(".sidebar");
        this.$footerHTML    = this.$HTML.find(".sidebar__footer");
        this.$mainContent   = $(".main-content");
    }

    hide() {
        // TODO: check if sidebar is not 'locked' open
        this.$HTML.toggleClass("mobile-hidden");
        this.$footerHTML.toggleClass("mobile-hidden");
        this.$mainContent.toggleClass("full-width");
    }

}

export default Sidebar;