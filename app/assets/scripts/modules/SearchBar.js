import $ from 'jquery'; 
import { g } from "./GlobalVars.js";

class SearchBar {

    constructor() {
        g.$searchBarInput.focus();
        this.events();
    }

    events() {
        g.$searchBarInput.on('keyup', this.keyPressInSearchBar.bind(this));
        g.$searchBarInput.focus(function() {
            $(this).select();
        });
        g.$searchBarInput.keydown(this.blockArrowKeys);
        g.$searchBarClearBtn.click(this.clearSearchBar.bind(this));
        g.$autoplayCheckbox.click(function(event) {
            g.$searchBarInput.focus();
            event.stopPropagation();
        });
    }

    keyPressInSearchBar(e) {
        var keyCode = (e.keyCode ? e.keyCode : e.which);
        // console.log("keypressInSearchBar: keyCode: " + keyCode);
        switch (keyCode) {
            case 13:    // 'Enter'
                // Add selected track
                var $selected = $(".selected");
                if ($selected) {
                    if ($selected.hasClass("result--track")) {
                        g.atmosphereManager.addTrack(
                            g.nameToTrackData($selected.text())
                        );
                    } else if ($selected.hasClass("result--atmosphere")) {
                        g.atmosphereManager.addAtmosphere(
                            g.nameToAtmosphereData($selected.text())
                        );
                    }
                    this.clearSearchBar();
                }
                e.preventDefault();
                break;
            case 38:    // Up Key
            case 40:    // Down Key
                var $visibleResults = g.$searchResults.find("li:visible");
                // $visibleResults.each(function(index, element) {
                //     console.log("Element " + index + ", " + element.innerHTML);
                // });
                if ($visibleResults.length > 0) {
                    e.preventDefault();
                    this.moveSearchSelector(keyCode, $visibleResults);
                } else {
                    // Unselect all items
                }
                break;
            default:
                this.filterResults();
                break;
        }
    }

    moveSearchSelector(keyCode, $visibleResults) {
        var $current;
        var $selected = $visibleResults.filter(".selected");
        var index = $visibleResults.index($selected);
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
        $current.addClass("selected");
    }

    deselect() {
        var $results = g.$searchResults.find('.selected').removeClass('selected');
    }

    select($result) {
        this.deselect();
        $result.addClass('selected');
    }

    // TODO: move to helper class
    blockArrowKeys(e) {
            var keyCode = (e.keyCode ? e.keyCode : e.which);
            if (keyCode == 38 || keyCode == 40) {
                e.preventDefault();
            }
    }

    clearSearchBar() {
        g.$searchBarInput.val("");
        g.$searchBarInput.focus();
        this.filterResults();
    }

    filterResults() {
        var results, i, enabledCount;
        //console.log("filterResults: Filtering...");
        var filter = g.$searchBarInput.val().toUpperCase();
        if (g.$searchResults == null) {
            console.log('SearchBar.js: filterResults: No search results. Returning...');
            return;
        }
        var results = g.$searchResults.children(),
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
            g.$searchResults.css("display", "none");
        } else {
            // Select top element
            g.$searchResults.css("display", "");
            g.$searchResults.find("li:visible").first().addClass("selected")
        }

    }

}

export default SearchBar;