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
                    top: this.getDragIconCoords(e, 'top'),
                    left: this.getDragIconCoords(e, 'left')
                })
                e.preventDefault();
            }
        }.bind(this))
        .on('mouseup touchend', function() {
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

    getDragIconCoords(event, attribute) {
        if (attribute == 'top') {
            return (event.type.toLowerCase() === 'mousemove')
            ? event.pageY - DRAG_ICON_OFFSET.y
            : window.event.touches[0].pageY - DRAG_ICON_OFFSET.y
        } else if (attribute == 'left') {
            return (event.type.toLowerCase() === 'mousemove')
            ? event.pageX - DRAG_ICON_OFFSET.x
            : window.event.touches[0].pageX - DRAG_ICON_OFFSET.x
        } else {
            // ERROR
            return 0;
        }
    }
}

export default DragManager;