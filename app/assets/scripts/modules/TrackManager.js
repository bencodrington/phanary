import Track from './Track';
import DataReader from './DataReader';

class TrackManager {

    constructor(trackDataURL) {
        var track = new Track(5, 50);
        track.greet();
        this.dataReader = new DataReader(trackDataURL, this.onDataReadComplete.bind(this));
    }

    onDataReadComplete(trackData) {
        this.trackData = trackData;
        this.dataReader.populateSearchResults(trackData);

    }

    // Called when the 'Add Track' button is clicked,
    //  and eventually when enter is pressed in the
    //  search bar.
    addTrack(trackKey) {

        if (trackData == null) {
            console.error("Track Data failed to fetch from server. Cannot add track.");
            return;
        }

        console.log("addTrack(): trackKey: " + trackKey);

        // Create new Track data object and add it to the tracklist
        var newId = id_counter;
        tracks.push(new Track(newId, 1));

        // Generate template
        var rawTemplate = $("#trackTemplate").html();
        var compiledTemplate = Handlebars.compile(rawTemplate);
        // Convert object to HTML
        var trackObject = trackData.tracks[trackKey];
        trackObject.name = trackKey;
        trackObject.trackId = newId;
        var trackHTML = compiledTemplate(trackObject);
        // Add to tracklist
        $(trackHTML).hide().prependTo($trackList).show('fast')

        // Rig play and stop buttons to function
        $playBtn = $("#playBtn" + newId); // cache element for use in Howl
        $playBtn.click(function() {
            playTrack(newId);
        });
        $("#stopBtn"+newId).click(function() {
            stopTrack(newId);
        });
        $("#deleteBtn"+newId).click(function() {
            deleteTrack(newId);
        });

        console.log("addTrack(): Autoplay checked? " + $autoplayCheckbox.is(":checked"));

        // Append prefix to filenames
        var filenames = trackObject.filenames;
        filenames = filenames.map(function(filename) {
            return trackPrefix + filename;
        });
        console.log(filenames);

        // Create new audio source
        // TODO: if audio already contains newId, just add another source
        audio[newId] = new Howl({
            src: filenames,
            buffer: true,
            autoplay: $autoplayCheckbox.is(":checked"),
            loop: trackObject.loop,                                 // TODO: button to change
            onload: function() {
                console.log("Loaded track #" + newId + ", " + trackKey);
                $playBtn.removeAttr("disabled");
            }
        });

        clearSearchBar();

        id_counter++;
        document.getElementById("trackCounter").innerHTML = "Tracks created: " + id_counter;
    }

    playTrack(trackId) {
        console.log("Playing track #" + trackId);
        audio[trackId].play();
    }

    stopTrack(trackId) {
        console.log("Stopping track #" + trackId);
        audio[trackId].stop();
    }

    deleteTrack(trackId) {
        console.log("Deleting track #" + trackId);
        $("#track"+trackId).fadeTo('slow', 0);
        // $("#track"+trackId).hide(900, function() { $(this).remove()});
        id_counter;
    }

}

export default TrackManager;