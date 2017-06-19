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
        this.timeOut = null;
        this.minIndex = 1;
        this.maxIndex = 2;
        // Update labels
        // TODO: just make updateLabels function
        this.changeRange('min', 0);
        this.changeRange('max', 0);
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
            paths = g.appendTrackPrefixes([sample.filenames]); //TODO: remove []
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

    begin() {
        this.start();
    }

    play() {
        this.atmosphere.am.playTrack(this.id, this.volume);
    }

    stop() {
        if (this.timeOut != null) {
            clearTimeout(this.timeOut);
        }
        this.$startBtn.toggle();
        this.$stopBtn.toggle();
    }

    start() {
        var that = this;
        var timerLength = this.getTimerLength() * 1000;
        // Clear previous timeout
        this.stop();
        // Play after delay
        this.timeOut = setTimeout(function() {
            that.play();
            that.start();
        }, timerLength);
        this.$startBtn.hide();
        this.$stopBtn.show();
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
            this.$minLabel.text(OneShot.getTimeStep(this.minIndex));
            if (this.minIndex > this.maxIndex) {
                // Increase max
                // console.log("OneShot:changeRange(): " + this.minIndex + " is greater than " + this.maxIndex);
                this.changeRange('max', 1);
            }
        } else { // 'max'
            this.maxIndex = g.clamp(0, this.maxIndex + difference, OneShot.timesteps.length - 1);
            this.$maxLabel.text(OneShot.getTimeStep(this.maxIndex));
            if (this.maxIndex < this.minIndex) {
                // Decrease min
                // console.log("OneShot:changeRange(): " + this.maxIndex + " is less than " + this.minIndex);
                this.changeRange('min', -1);
            }
        }
    }

    getTimerLength() {
        var min = OneShot.getTimeStep(this.minIndex)
        var max = OneShot.getTimeStep(this.maxIndex)
        var length = min + g.getRandomInt(max - min + 1);
        // console.log("OneShot:getTimerLength(): " + length);
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