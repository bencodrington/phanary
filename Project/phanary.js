$(document).ready(function() {
    var tracks = [];        // The master array of track objects
    var audio = [];         // The master list of audio sources
    var glob_volume = 1;    // The global volume multiplier applied to all tracks
    var glob_muted = 0;     // Whether or not all tracks are currently muted
    var id_counter = 0;     // Used for giving each new track its own id
    var $trackList = $("#trackList"); // The div containing all tracks
    var $searchResults = $("#searchResults"); // The ul containing all search results
    var $searchBarInput = $("#searchBarInput");
    var $autoplayCheckbox = $("#autoplayCheckbox");
    var trackData;          // Object containing the parsed tracks.json file
    var trackDataURL = "https://api.myjson.com/bins/158o3f";
    var trackPrefix = "Tracks/"

    // Track object, contains all the data associated with a given track
    function Track (id, volume) {
        this.id = id;           // The same as this track's index in the 'tracks' array
        this.volume = volume;
    }

    function initialize() {
        // Parse tracks.json file to retrieve track info
        readTrackData(trackDataURL);
        // Rig 'Add Track' button to function
        $("#addTrackBtn").on("click", function() {
            addTrack("Cafeteria Ambience");
        });
        // Rig search bar to function
        $searchBarInput.keyup(keyPressInSearchBar);
        $searchBarInput.keydown(blockArrowKeys);
        $("#searchBarClearBtn").click(clearSearchBar)
        
    }

    // Called when the 'Add Track' button is clicked,
    //  and eventually when enter is pressed in the
    //  search bar.
    function addTrack(trackKey) {

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

    function blockArrowKeys(e) {
            var keyCode = (e.keyCode ? e.keyCode : e.which);
            if (keyCode == 38 || keyCode == 40) {
                e.preventDefault();
            }
    }

    function keyPressInSearchBar(e) {
        var keyCode = (e.keyCode ? e.keyCode : e.which);
        // console.log("keypressInSearchBar: keyCode: " + keyCode);
        switch (keyCode) {
            case 13:    // 'Enter'
                // Add selected track
                $selected = $(".selected");
                if ($selected) {
                    addTrack($(".selected").text());
                }
                e.preventDefault();
                break;
            case 38:    // Up Key
            case 40:    // Down Key
                var $visibleResults = $searchResults.find("li:visible");
                // $visibleResults.each(function(index, element) {
                //     console.log("Element " + index + ", " + element.innerHTML);
                // });
                if ($visibleResults.length > 0) {
                    e.preventDefault();
                    moveSearchSelector(keyCode, $visibleResults);
                } else {
                    // Unselect all items
                }
                break;
            default:
                filterResults();
                break;
        }
    }

    function moveSearchSelector(keyCode, $visibleResults) {
        var $current;
        var $selected = $visibleResults.filter(".selected");
        // console.log("BEFORE: $selected: " + $selected.html());
        var index = $visibleResults.index($selected);
        //console.log("== moveSearchSelector: $visibleResults.length: " + $visibleResults.length);
        // Remove .selected class from currently selected thing
        $selected.removeClass("selected");
        if (keyCode == 38) {
            // Move up
            // if nothing or the first item is selected
            if ( index == -1 || index == 0 ) {
                // select the last result
                index--;
                $current = $visibleResults.last();
            }
            else {
                // select the previous result
                $current = $visibleResults.eq(index - 1);
            }
        } else if (keyCode == 40) {
            // Move down
            // if nothing or the last item is selected
            if ( index == -1 || index >= $visibleResults.length - 1 ) {
                // select the first result
                $current = $visibleResults.first();
            }
            else {
                // select the next result
                index++;
                $current = $visibleResults.eq(index);
            }
            
        } else {
            console.error("moveSearchSelector: Invalid keyCode was passed: " + keyCode);
            return;
        }
        // console.log("moveSearchSelector: Currently selected: index #" + index + ", " + $current.html())
        $current.addClass("selected");
    }

    function readTrackData(file){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 && xhr.status === 200){
                trackData = JSON.parse(xhr.responseText);
                populateSearchResults();
            }
        }
        xhr.open('GET', file, true);
        xhr.send();
    }

    function populateSearchResults() {
        var rawTemplate = $("#searchResultTemplate").html();
        var compiledTemplate = Handlebars.compile(rawTemplate);
        var resultObject = {};
        var resultHTML;
        $.each(trackData.tracks, function(name) {
            console.log("name: " + name);
            resultObject['name'] = name;
            resultHTML = compiledTemplate(resultObject);
            $(resultHTML).appendTo($searchResults);
        } );
    }

    function playTrack(trackId) {
        console.log("Playing track #" + trackId);
        audio[trackId].play();
    }

    function stopTrack(trackId) {
        console.log("Stopping track #" + trackId);
        audio[trackId].stop();
    }

    function deleteTrack(trackId) {
        console.log("Deleting track #" + trackId);
        $("#track"+trackId).fadeTo('slow', 0);
        // $("#track"+trackId).hide(900, function() { $(this).remove()});
        id_counter;
    }

    function clearSearchBar() {
        $searchBarInput.val("");
        $searchBarInput.focus();
        filterResults();
    }

    function filterResults() {
        var results, i, enabledCount;
        //console.log("filterResults: Filtering...");
        filter = $searchBarInput.val().toUpperCase();
        results = $searchResults.children();
        enabledCount = 0;

        // Loop through all list items, and hide those who don't match the search query
        results.each(function() {
            var $result = $(this);
            if ((filter != "") && ($result.text().toUpperCase().indexOf(filter) > -1)) {
                $result.css("display", "");
                enabledCount++;
                //console.log("filterResults(): Showing: " + $result.text());
            } else {
                $result.css("display", "none");
                //console.log("filterResults(): Hiding: " + $result.text());
            }
        });
        //console.log("filterResults: There are " + enabledCount + " enabled list items.");
        results.removeClass("selected");
        if (enabledCount == 0) {
            $searchResults.css("display", "none");
        } else {
            // Select top element
            $searchResults.css("display", "");
            $searchResults.find("li:visible").first().addClass("selected")
        }

    }

    initialize();
});