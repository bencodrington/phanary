import $ from 'jquery';

import { g } from "./GlobalVars.js";

const DRAG_ICON_OFFSET = {
    x: 30,
    y: 30
}

class DragManager {

    /*
        Responsible for as much of the drag and drop functionality as
            can be excised from the other classes they interact with.
    */

    constructor() {
        this.events()
        // The mini version of the track that follows the mouse when dragging
        this.$dragIcon          = $('.drag-icon');
        this.draggingTrack      = null;             // Track that is currently being dragged, or null if there isn't one
        this.draggingAtmosphere = null;             // Atmosphere that is currently being dragged, or null if there isn't one
    }

    events() {
        // Cache references to drop zones
        //  (areas at the top of each section where tracks can be dropped
        //  to insert them into the first position)
        this.$sidebarDropZone = $('.drag-drop-zone--sidebar');
        this.$mainDropZone = $('.drag-drop-zone--main');
        this.$bothDropZones = this.$sidebarDropZone.add(this.$mainDropZone);

        $('html')
        .on('mousemove touchmove', function(e) {
            // Check if drag icon's position needs to be updated on mousemove
            if (this.draggingTrack || this.draggingAtmosphere) {
                this.updateDragIconLocation(e);
                e.preventDefault();
            }
        }.bind(this))
        .on('mouseup touchend', function() {
            // Stop dragging any applicable tracks or atmospheres
            this.stopDraggingTrack();
            this.stopDraggingAtmosphere();
        }.bind(this))

        this.$mainDropZone
        .on('mouseenter touchenter', function() {
            // If dragging tracks, expand drop zone
            if (this.draggingTrack) {
                this.$mainDropZone.addClass('drag-drop-zone--expanded');
            }
        }.bind(this))
        .on('mouseup touchend', function() {
            // Insert track at first position
            if (this.draggingTrack) {
                this.$mainDropZone.after(this.draggingTrack.$trackHTML);
                this.$mainDropZone.removeClass('drag-drop-zone--expanded');
            }
        }.bind(this));

        this.$sidebarDropZone
        .on('mouseenter touchenter', function() {
            // If dragging atmospheres, expand drop zone
            if (this.draggingAtmosphere) {
                this.$sidebarDropZone.addClass('drag-drop-zone--expanded');
            }
        }.bind(this))
        .on('mouseup touchend', function() {
            // Insert atmosphere at first position
            if (this.draggingAtmosphere) {
                g.atmosphereManager.insertAtmosphereAtPosition(0);  // Update g.atmosphereManager's array
                this.$sidebarDropZone.after(this.draggingAtmosphere.$atmosphereHTML);
                this.$sidebarDropZone.removeClass('drag-drop-zone--expanded');
            }
        }.bind(this));

        // Make sure drop zones are not expanded on mouseleave
        this.$bothDropZones.on('mouseleave', function() {
            this.$bothDropZones.removeClass('drag-drop-zone--expanded');
        }.bind(this));
    }

    startDraggingTrack(track, e) {
        this.updateDragIconLocation(e);
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

    startDraggingAtmosphere(atmosphere, e) {
        this.updateDragIconLocation(e);
        this.$dragIcon.addClass('drag-icon--atmosphere');
        this.$dragIcon.show();
        this.draggingAtmosphere = atmosphere;
        atmosphere.$atmosphereHTML.slideUp();
    }

    stopDraggingAtmosphere() {
        this.$dragIcon.hide();
        this.$dragIcon.removeClass('drag-icon--atmosphere');
        if (this.draggingAtmosphere) {
            this.draggingAtmosphere.$atmosphereHTML.slideDown();
            this.draggingAtmosphere = null;
        }
    }

    // Update's the drag icon's location to be relative to the event
    //  that is causing the drag.
    updateDragIconLocation(e) {
        this.$dragIcon.offset({
            top: this.getDragIconCoords(e, 'top'),
            left: this.getDragIconCoords(e, 'left')
        })
    }

    // Calculates the drag icon's new coordinates, adjusting for which 
    //  event is causing the drag (mouse or touch) and for which 
    //  attribute is to be calculated
    getDragIconCoords(event, attribute) {
        console.log(event.type.toLowerCase());
        // 'Top' coordinate
        if (attribute == 'top') {

            if (event.type.toLowerCase() === 'mousemove'
                    || event.type.toLowerCase() === 'mousedown') {
                // Mouse event
                return event.pageY - DRAG_ICON_OFFSET.y;
            } else {
                // Touch event
                return window.event.touches[0].pageY - DRAG_ICON_OFFSET.y;
            }

        // 'Left' coordinate
        } else if (attribute == 'left') {

            if (event.type.toLowerCase() === 'mousemove'
                    || event.type.toLowerCase() === 'mousedown') {
                // Mouse event
                return event.pageX - DRAG_ICON_OFFSET.x;
            } else {
                // Touch event
                return window.event.touches[0].pageX - DRAG_ICON_OFFSET.x;
            }

        } else {

            // ERROR: attribute should always be either 'top' or 'left'
            return 0;

        }
    }
}

export default DragManager;