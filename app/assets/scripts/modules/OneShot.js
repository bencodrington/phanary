import Track from './Track.js';
require('./templates/oneshot');

import { g } from "./GlobalVars.js";

// Used for setting random time ranges
let _timesteps = [
    1, 2, 5, 10, 15, 20, 30, 45, 60,
    120, 180
];

class OneShot extends Track {
    
    static get timesteps() { return _timesteps; }

    constructor(trackData, atmosphere) {
        super(trackData, atmosphere);
        // this.rigOneShotControls();
        this.interval = null;
        this.frameLength = 10; // Milliseconds between progress bar updates
        this.minIndex = 1;
        this.maxIndex = 2;
        // Update labels
        this.updateLabels();
    }

    template(data) {
        return Handlebars.templates['oneshot.hbs'](data);
    }

    createElement() {
        super.createElement();
        this.rigOneShotControls();
    }

    createAudio(trackData) {
        
        var $playBtn = this.$trackHTML.find(".btn--play");
        var that = this;
        var samples = [];
        var paths, howl;
        this.data.samples.forEach(function(sample) {
            // For each oneshot
            // Append track prefixes to each fallback audio path
            paths = g.convertToFilenames(sample.filename);
            // Create new howl for the sample
            howl = new Howl({
                src: paths,
                buffer: true,
                autoplay: false,
                loop: false,
                onload: function() {
                    // console.log("Loaded track '" + that.data.name + "'.");
                    $playBtn.removeAttr("disabled");
                }
            });

            samples.push(howl);

        });

        // Add to audio manager
        this.atmosphere.am.addOneShotSet(this.id, samples);
        
        if (g.$autoplayCheckbox.is(":checked")) {
            this.start();
        }
    }

    rigOneShotControls() {
        var that = this;
        var $startBtn = this.$startBtn = this.$trackHTML.find('.btn--start');
        var $stopBtn = this.$trackHTML.find('.btn--stop');
        var $minMore = this.$trackHTML.find('.oneshot-min.btn--more');
        var $minLess = this.$trackHTML.find('.oneshot-min.btn--less');
        var $maxMore = this.$trackHTML.find('.oneshot-max.btn--more');
        var $maxLess = this.$trackHTML.find('.oneshot-max.btn--less');
        this.$playText = this.$trackHTML.find('.oneshot-play-text');
        this.$minLabel = this.$trackHTML.find('.oneshot-min-label');
        this.$maxLabel = this.$trackHTML.find('.oneshot-max-label');
        this.$progressBar = this.$trackHTML.find('.progress__bar');
        $startBtn.on('click', function() {
            that.start();
            that.togglePlayText();
        });
        $stopBtn.on('click', function() {
            that.togglePlayText();
        });
        $minLess.on('click', function() {
            that.changeRange('min', -1);
        });
        $minMore.on('click', function() {
            that.changeRange('min', 1);
        });
        $maxLess.on('click', function() {
            that.changeRange('max', -1);
        });
        $maxMore.on('click', function() {
            that.changeRange('max', 1);
        });
    }

    play() {
        this.atmosphere.am.playTrack(this.id, this.volume);
    }

    stop() {
        console.log('stop():this.interval:' + this.interval);
        if (this.interval != null && this.interval != undefined) {
            console.log('this.interval != null');
            clearInterval(this.interval);
        }
        this.$startBtn.toggle();
        this.$stopBtn.toggle();
    }

    start() {
        if (!this.minIndex || !this.maxIndex) {
            console.log('setting indexes');
            this.minIndex = 1;
            this.maxIndex = 2;
        }
        this.timerLength = this.getTimerLength() * 1000;
        console.log('this.timerLength: ' + this.timerLength);
        this.timerProgress = 0;
        this.updateProgressBar();
        // Clear previous timeout
        this.stop();
        // Play after delay
        this.interval = setInterval(this.progressFrame.bind(this), 10);
        console.log('this.interval!!!: ' + this.interval);
        this.$startBtn.hide();
        this.$stopBtn.show();
    }

    progressFrame() {
        if (this.timerProgress >= this.timerLength) {
            console.log('timerprogress: ' + this.timerProgress + ', timerlength: ' + this.timerLength);
            // Play sound
            // this.play();
            // Restart loop
            this.start();
        } else {
            this.timerProgress += this.frameLength;
            this.updateProgressBar();
        }
    }

    delete() {
        this.stop();
        this.atmosphere.am.stopTrack(this.id);
        this.atmosphere.am.unloadTrack(this.id);
        // Unlink data object from containing atmosphere
        this.atmosphere.removeTrack(this.id);

        // Remove DOM Element
        this.$trackHTML.slideUp('fast', function() {
            this.remove();
        });
    }

    changeRange(minmax, difference) {

        if (minmax === 'min') {
            this.minIndex = g.clamp(0, this.minIndex + difference, OneShot.timesteps.length - 1);
            this.updateLabels();
            if (this.minIndex > this.maxIndex) {
                // Increase max
                // console.log("OneShot:changeRange(): " + this.minIndex + " is greater than " + this.maxIndex);
                this.changeRange('max', 1);
            }
        } else { // 'max'
            this.maxIndex = g.clamp(0, this.maxIndex + difference, OneShot.timesteps.length - 1);
            this.updateLabels();
            if (this.maxIndex < this.minIndex) {
                // Decrease min
                // console.log("OneShot:changeRange(): " + this.maxIndex + " is less than " + this.minIndex);
                this.changeRange('min', -1);
            }
        }
    }

    updateLabels() {
        this.$minLabel.text(OneShot.getTimeStep(this.minIndex));
        this.$maxLabel.text(OneShot.getTimeStep(this.maxIndex));
    }

    updateProgressBar() {
        if (this.timerLength <= 0) {
            console.error('OneShot.js: Timer length <= 0: ' + this.timerLength);
            return;
        }
        var percentage = this.timerProgress / this.timerLength;
        percentage = 1 - percentage;
        percentage *= 100;
        this.$progressBar.width(percentage + "%");
    }

    getTimerLength() {
        var min = OneShot.getTimeStep(this.minIndex)
        var max = OneShot.getTimeStep(this.maxIndex)
        console.log(min + ', ' + max + ', ' + this.minIndex + ', ' + this.maxIndex);
        var length = min + g.getRandomInt(max - min + 1);
        return length;
    }

    togglePlayText() {
        if (this.$playText.text() === "Play") {
            this.$playText.text("Playing");
        } else {
            this.$playText.text("Play");
        }
    }

    static getTimeStep(index) {
        return OneShot.timesteps[index];
    }

}

export default OneShot;