
// Track object, contains all the data associated with a given track
class Track {

    constructor(id, volume) {
        this.id = id; // TODO: The same as this track's index in the 'tracks' array
        this.volume = volume;
    }

    greet() {
        console.log('hello, my id is: ' + this.id + ', and my volume is: ' + this.volume + '%.');
    }

}

export default Track;