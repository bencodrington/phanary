import $ from 'jquery';

const DRAG_ICON_OFFSET = {
    x: 30,
    y: 30
}

class DragManager {

    /*
        TODO: lots of comments
    */

    constructor() {
        this.events()
        this.$dragIcon      = $('.drag-icon');  // TODO: temp
        this.draggingTrack  = null;             // TODO:
    }

    events() {

        $('html')
        .on('mousemove', function(e) {
            if (this.draggingTrack) {
                // Update dragIcon location
                this.$dragIcon.offset({
                    top: e.pageY - DRAG_ICON_OFFSET.y,
                    left: e.pageX - DRAG_ICON_OFFSET.x
                })
                e.preventDefault();
            }
        }.bind(this))
        .on('mouseup', function() {
            this.stopDraggingTrack();
        }.bind(this))

        this.$sidebarDropZone = $('.drag-drop-zone--sidebar');
        this.$mainDropZone = $('.drag-drop-zone--main');
        // TODO: remove? ->
        this.$bothDropZones = $.merge(this.$sidebarDropZone, this.$mainDropZone);

        this.$mainDropZone
        .on('mouseenter', function() {
            // If dragging tracks, expand drop zone
            if (this.draggingTrack) {
                this.$mainDropZone.addClass('drag-drop-zone--expanded');
            }
        }.bind(this))
        .on('mouseup', function() {
            if (this.draggingTrack) {
                this.$mainDropZone.after(this.draggingTrack.$trackHTML);
                this.$mainDropZone.removeClass('drag-drop-zone--expanded');
            }
        }.bind(this));

        this.$bothDropZones.on('mouseleave', function() {
            this.$bothDropZones.removeClass('drag-drop-zone--expanded');
        }.bind(this));
    }

    startDraggingTrack(track) {
        this.$dragIcon.show();
        this.draggingTrack = track;
        track.$trackHTML.slideUp();
    }

    stopDraggingTrack() {
        this.$dragIcon.hide();
        if (this.draggingTrack) {
            this.draggingTrack.$trackHTML.slideDown();
            this.draggingTrack = null;
        }
    }
}

export default DragManager;