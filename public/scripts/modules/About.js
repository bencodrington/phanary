import $ from 'jquery';

class About {

    constructor() {

        this.$about = $('.about');
        this.rigOpen();
        this.rigClose();
    }

    rigOpen() {
        $('.about__open').on('click', this.open.bind(this));
    }

    rigClose() {
        $('.about__close').on('click', this.close.bind(this));
    }

    open() {
        this.$about.removeClass('about--closed');
    }

    close() {
        this.$about.addClass('about--closed');
    }

}

export default About;