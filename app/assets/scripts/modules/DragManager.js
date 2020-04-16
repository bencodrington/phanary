import $ from 'jquery';

import { g } from "./GlobalVars.js";

// The distance that the drag icon appears from the cursor while being dragged
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
        .on('pointermove', function(e) {
            // Check if drag icon's position needs to be updated on mousemove
            if (this.draggingTrack || this.draggingAtmosphere) {
                this.updateDragIconLocation(e);
                // Stop text from being highlighted
                e.preventDefault();
            }
        }.bind(this))
        // TODO: mouseup touchend
        .on('pointerup', function() {
            // Stop dragging any applicable tracks or atmospheres
            this.stopDraggingTrack();
            this.stopDraggingAtmosphere();
            // TODO: refactor
            $('.section--show-drop-zone').removeClass('section--show-drop-zone');
            $('.drag-drop-zone--expanded').removeClass('drag-drop-zone--expanded');
        }.bind(this))

        this.$mainDropZone
        // TODO: mouseenter
        .on('pointerenter', function() {
            // If dragging tracks, expand drop zone
            if (this.draggingTrack) {
                this.$mainDropZone.addClass('drag-drop-zone--expanded');
            }
        }.bind(this))
        // TODO: mouseup touchend
        .on('pointerup', function() {
            // Insert track at first position
            if (this.draggingTrack) {
                this.$mainDropZone.after(this.draggingTrack.$trackHTML);
                this.$mainDropZone.removeClass('drag-drop-zone--expanded');
            }
        }.bind(this));

        this.$sidebarDropZone
        // TODO: mouseenter
        .on('pointerenter', function() {
            // If dragging atmospheres, expand drop zone
            if (this.draggingAtmosphere) {
                this.$sidebarDropZone.addClass('drag-drop-zone--expanded');
            }
        }.bind(this))
        // TODO: mouseup touchend
        .on('pointerup', function() {
            // Insert atmosphere at first position
            if (this.draggingAtmosphere) {
                g.atmosphereManager.insertDraggingAtmosphereAtPosition(0);  // Update g.atmosphereManager's array
                this.$sidebarDropZone.after(this.draggingAtmosphere.$atmosphereHTML);
                this.$sidebarDropZone.removeClass('drag-drop-zone--expanded');
            }
        }.bind(this));

        // Make sure drop zones are not expanded on mouseleave
        // TODO: mouseleave (pointerout?)
        this.$bothDropZones.on('pointerleave', function() {
            this.$bothDropZones.removeClass('drag-drop-zone--expanded');
        }.bind(this));
    }

    startDraggingTrack(track, e) {
        this.$dragIcon.show();
        this.draggingTrack = track;
        track.$trackHTML.slideUp();
        this.updateDragIconLocation(e);
    }

    stopDraggingTrack() {
        this.$dragIcon.hide();
        if (this.draggingTrack) {
            this.draggingTrack.$trackHTML.slideDown();
            this.draggingTrack = null;
        }
    }

    startDraggingAtmosphere(atmosphere, e) {
        this.$dragIcon.addClass('drag-icon--atmosphere');
        this.$dragIcon.show();
        this.draggingAtmosphere = atmosphere;
        atmosphere.$atmosphereHTML.slideUp();
        this.updateDragIconLocation(e);
    }

    stopDraggingAtmosphere() {
        this.$dragIcon.hide();
        this.$dragIcon.removeClass('drag-icon--atmosphere');
        if (this.draggingAtmosphere) {
            this.draggingAtmosphere.$atmosphereHTML.slideDown();
            this.draggingAtmosphere = null;
        }
    }

    // Updates the drag icon's location to be relative to the event
    //  that is causing the drag.
    updateDragIconLocation(e) {
        this.$dragIcon.offset({
            top: event.clientY- DRAG_ICON_OFFSET.y,
            left: event.clientX- DRAG_ICON_OFFSET.x
        })
    }

    // Handles the 'reorder' buttons on each section
    //  section: either the track or atmosphere to be moved
    //  direction: string: either 'up' or 'down'
    //  isAtmosphere: boolean value
    moveSection(section, direction, isAtmosphere) {
        // Store the jQuery object for the section, based on subclass
        var $html = isAtmosphere ? section.$atmosphereHTML : section.$trackHTML;
        // Move the object to its new position
        if (direction == 'up') {
            $html.prev('.card').before($html);
        } else if (direction == 'down') {
            $html.next('.card').after($html);
        } else {
            console.error('DragManager.js:moveSection: invalid direction provided: "' + direction + '"');
            return;
        }
        // Update AtmosphereManager array for persistance if necessary
        if (isAtmosphere) {
            g.atmosphereManager.modifyAtmospherePosition(section, direction == 'up' ? -1 : +1);
        }
    }
}

export default DragManager;