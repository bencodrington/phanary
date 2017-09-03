import Track from './Track.js';
require('./templates/oneshot');

import { g } from "./GlobalVars.js";

// The different values that "Playing every _ to _ seconds" can hold.
import _timesteps from './OneShotTimesteps';

let _startMinIndex = 3; // the index of the default minimum timestep
let _startMaxIndex = 4; // the index of the default maximum timestep

class OneShot extends Track {
    
    static get timesteps() { return _timesteps; }
    static get startMinIndex() { return _startMinIndex; }
    static get startMaxIndex() { return _startMaxIndex; }

    constructor(trackData, atmosphere, volume, minIndex, maxIndex) {
        super(trackData, atmosphere, volume);

        this.frameLength = 10;  // milliseconds between progress bar updates

        // Set the frequency of sample firing to the timestep defaults
        this.minIndex = OneShot.startMinIndex;
        this.maxIndex = OneShot.startMaxIndex;
        if (minIndex && maxIndex) { // One-shot timesteps are specified in the containing atmosphere
            this.minIndex = minIndex;
            this.maxIndex = maxIndex;
        }

        this.updateLabels();    // update labels to reflect the initialized indices

        // These lines are found in Track.createAudio(), but must be called after
        //  setting the sample firing frequency, and so are moved here in this class
        if (g.$autoplayCheckbox.is(":checked")) {
            this.begin(); // start the timer
        }
    }

    /* Overrides the default track template function */
    template(data) {
        return Handlebars.templates['oneshot.hbs'](data);
    }

    createElement() {
        super.createElement();
        this.rigOneShotControls();
    }

    /* Handles the creation of the actual Howler audio objects */
    createAudio(trackData) {
        var samples = [];   // will contain the completed Howler objects, to be passed
                            //  to the containing atmosphere's audio manager
        var paths, howl;

        this.data.samples.forEach(function(sample) {
            paths = g.convertToFilenames(sample.filename); // prepend path and append track postfixes to the sample name

            // Create new howl for the sample
            howl = new Howl({
                src: paths,
                buffer: true,
                autoplay: false,
                loop: false
            });

            samples.push(howl);
        });

        this.atmosphere.am.addOneShotSet(this.id, samples);
    }

    /* Must be called after super.createElement(), otherwise this.$trackHTML will be uninitialized */
    rigOneShotControls() {
        this.$startBtn = this.$trackHTML.find('.btn--start');
        this.$playText = this.$trackHTML.find('.oneshot-play-text');
        this.$minLabel = this.$trackHTML.find('.oneshot-min-label');
        this.$maxLabel = this.$trackHTML.find('.oneshot-max-label');
        this.$progressBar = this.$trackHTML.find('.progress__bar');

        this.$startBtn
        .on('click', function() {
            this.start();
        }.bind(this));

        // Change frequency range minimum by one step
        this.$trackHTML.find('.oneshot-min.btn--more')  // Increase
        .on('click', function() {
            this.changeRange('min', 1);
        }.bind(this));
        this.$trackHTML.find('.oneshot-min.btn--less')  // Decrease
        .on('click', function() {
            this.changeRange('min', -1);
        }.bind(this));

        // Change frequency range maximum by one step
        this.$trackHTML.find('.oneshot-max.btn--more')  // Increase
        .on('click', function() {
            this.changeRange('max', 1);
        }.bind(this));
        this.$trackHTML.find('.oneshot-max.btn--less')  // Decrease
        .on('click', function() {
            this.changeRange('max', -1);
        }.bind(this));
    }

    /* Called by the containing atmosphere on its play event, overrides Track.begin() */
    begin() {
        this.start();
    }

    /*  Fire one-shot sample once, changing nothing else.
        Overrides Track.play() to avoid hiding any play buttons
    */
    play() {
        this.atmosphere.am.playTrack(this.id, this.volume);
    }

    stop() {
        if (this.interval === null || this.interval === undefined) {
            // If timer is stopped or was never started
            return;
        }
        clearInterval(this.interval);           // stop updating each frame
        this.interval = null;
        this.updateProgressBar(100);            // reset progress bar to full
        this.$startBtn.toggle();                // show start button again
        this.$stopBtn.toggle();                 // hide stop button
        this.togglePlayText();                  // set text to 'play' instead of 'playing'
        this.atmosphere.am.stopTrack(this.id);  // stop currently firing one-shot
    }

    start() {
        this.timerLength = this.getTimerLength() * 1000;    // get random length and convert to ms
        this.timerProgress = 0;                             // reset progress counter
        this.updateProgressBar(this.calculateProgressBar());
        this.stop();                                        // clear previous interval

        // Progress one frame every (this.frameLength) seconds
        this.interval = setInterval(this.progressFrame.bind(this), this.frameLength);

        this.$startBtn.hide();
        this.$stopBtn.show();
        this.togglePlayText();  // set text to 'playing' instead of 'play'
    }

    /*
        Called every (this.frameLength) seconds when containing one-shot is playing
        Plays a sample if timer has expired, otherwise just updates the progress bar.
    */
    progressFrame() {
        if (this.timerProgress >= this.timerLength) {
            this.start();   // restart timer with new random length
            this.play();    // play sample (must come after this.start(), or else will be stopped immediately)
        } else {
            this.timerProgress += this.frameLength;
            this.updateProgressBar(this.calculateProgressBar());
        }
    }

    /*
        retain: whether or not to avoid removing the track from the containing atmosphere
        If this were called in Atmosphere.tracks.forEach(), removing the track mid-loop
        would cause issues like one track being skipped.
    */
    delete(retain) {
        this.stop();
        this.atmosphere.am.unloadTrack(this.id);
        if (!retain) {
            this.atmosphere.removeTrack(this.id); // unlink data object from containing atmosphere
        }

        // Remove DOM Element
        this.$trackHTML.slideUp('fast', function() {
            this.remove();
        });
    }

    /*
        Modifies the valid range of times for use in the countdown until the next sample firing
        minmax: 'min' if the minimum index is to be modified, 'max' for the maximum index
        difference: how much to modify the selected index by
    */
    changeRange(minmax, difference) {
        if (minmax === 'min') {
            this.minIndex = g.clamp(0, this.minIndex + difference, OneShot.timesteps.length - 1);
            this.updateLabels();
            if (this.minIndex > this.maxIndex) {
                // new min cannot be greater than max; increase max by one step
                this.changeRange('max', 1);
            }
        } else { // 'max'
            this.maxIndex = g.clamp(0, this.maxIndex + difference, OneShot.timesteps.length - 1);
            this.updateLabels();
            if (this.maxIndex < this.minIndex) {
                // new max cannot be less than min; decrease min by one step
                this.changeRange('min', -1);
            }
        }
    }

    updateLabels() {
        this.$minLabel.text(OneShot.getTimeStep(this.minIndex));
        this.$maxLabel.text(OneShot.getTimeStep(this.maxIndex));
    }

    calculateProgressBar() {
        if (this.timerLength <= 0) {
            console.error('OneShot.js: Timer length <= 0: ' + this.timerLength);
            return 100;
        }
        var percentage = this.timerProgress / this.timerLength; // 0 < percentage < 1
        percentage = 1 - percentage; // invert to have progress bar count down instead of up
        percentage *= 100; // 0 < percentage < 100
        return percentage;
    }

    /* Sets the percentage of the progress bar that is filled based on input in the range [0, 100] */
    updateProgressBar(percentage) {
        this.$progressBar.width(percentage + "%");
    }

    /* Returns a random whole number in the range of selected times, inclusively */
    getTimerLength() {
        var min = OneShot.getTimeStep(this.minIndex)
        var max = OneShot.getTimeStep(this.maxIndex)
        var length = min + g.getRandomInt(max - min + 1); //TODO: use decimals instead of whole numbers for more variability
        return length;
    }

    /* Sets 'play' to 'playing' and vice versa for linguistic accuracy */
    togglePlayText() {
        if (this.$playText.text() === "Play") {
            this.$playText.text("Playing");
        } else {
            this.$playText.text("Play");
        }
    }

    /* Semantic method for accessing the static timesteps array given a min or max index */
    static getTimeStep(index) {
        return OneShot.timesteps[index];
    }

}

export default OneShot;