import $ from 'jquery';

class DragManager {

    /*
        TODO:
    */

    constructor() {
        this.events()
    }

    events() {
        this.$sidebarDropZone = $('.drag-drop-zone--sidebar');
        this.$mainDropZone = $('.drag-drop-zone--main');
        // TODO: remove? ->
        this.$bothDropZones = $.merge(this.$sidebarDropZone, this.$mainDropZone);

        this.$mainDropZone.on('mouseenter', function() {
            // If dragging tracks, expand drop zone
            this.$mainDropZone.addClass('.drag-drop-zone--expanded');
        }.bind(this));

        this.$bothDropZones.on('mouseleave', function() {
            this.$bothDropZones.removeClass('.drag-drop-zone--expanded');
        }.bind(this));
    }
}

export default DragManager;