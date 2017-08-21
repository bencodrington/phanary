import $ from 'jquery'; 
import { g } from "./GlobalVars.js";

class SearchBar {

    constructor() {
        this.$results   = $("#searchResults");      // the ul containing all search results
        this.$input     = $("#searchBarInput");     // the search bar textbox itself
        this.$input.focus();                        // start cursor in the searchbar
        this.events();
    }

    events() {
        $("#searchBarClearBtn").click(  // the button that removes current text from the search bar
            this.clearSearchBar
            .bind(this)
        );
        this.$input.on('keyup',         // any time a key is pressed in the search bar text
            this.keyPressInSearchBar
            .bind(this)
        );
        this.$input.focus(function() {  // automatically select all text on focus
            $(this).select();
        });
        this.$input.keydown(            // don't let up and down arrows move the cursor
            this.blockArrowKeys
        );
        g.$autoplayCheckbox.click(      // refocus on the search bar text input
            this.onAutoplayPress
            .bind(this)
        );
    }

    keyPressInSearchBar(e) {
        var keyCode = (e.keyCode ? e.keyCode : e.which);
        switch (keyCode) {
            case 13:    // 'Enter'
                // Add selected track/atmosphere
                var $selected = $(".selected");
                if ($selected) {
                    g.atmosphereManager.addSelected($selected);
                    this.clearSearchBar();
                }
                e.preventDefault();
                break;
            case 38:    // Up Key
            case 40:    // Down Key
                var $visibleResults = this.$results.find("li:visible");
                if ($visibleResults.length > 0) {
                    e.preventDefault();
                    this.moveSearchSelector(keyCode, $visibleResults);
                }
                break;
            default:    // Probably a character was added or removed
                this.filterResults();
                break;
        }
    }

    moveSearchSelector(keyCode, $visibleResults) {
        var $current;
        var $selected = $visibleResults.filter(".selected");
        var index = $visibleResults.index($selected);
        $selected.removeClass("selected");  // remove .selected class from currently selected result
        if (keyCode == 38) { // move up in the list
            // if nothing or the first item is selected
            if ( index == -1 || index == 0 ) {
                // select the last result
                $current = $visibleResults.last();
            }
            else {
                // select the previous result
                $current = $visibleResults.eq(index - 1);
            }
        } else if (keyCode == 40) { // move down in the list
            // if nothing or the last item is selected
            if ( index == -1 || index >= $visibleResults.length - 1 ) {
                // select the first result
                $current = $visibleResults.first();
            }
            else {
                // select the next result
                $current = $visibleResults.eq(index + 1);
            }
        } else {    // sanity check
            console.error("moveSearchSelector: Invalid keyCode was passed: " + keyCode);
            return;
        }
        $current.addClass("selected");
    }

    deselect() {
        var $results = this.$results.find('.selected').removeClass('selected');
    }

    select($result) {
        this.deselect();
        $result.addClass('selected');
    }

    /*
        Takes an event object, and if the up or down key was pressed, prevents their
        default effects from occuring (i.e. move text cursor back and forth)
    */
    blockArrowKeys(e) {
            var keyCode = (e.keyCode ? e.keyCode : e.which);
            if (keyCode == 38 || keyCode == 40) { // 38 = Up arrow, 40 = Down arrow
                e.preventDefault();
            }
    }

    /* Empty search bar text, focus on it, and update search results accordingly */
    clearSearchBar() {
        this.$input.val("");
        this.$input.focus();
        this.filterResults();
    }

    /* Focuses on the search bar, and stops the event propagation from interfering with that */
    onAutoplayPress(event) {
        this.$input.focus();
        event.stopPropagation();
    }

    /*
        Tells the data manager to make a call to the system API to get search results
        based on the current contents of the search bar
    */
    filterResults() {
        if (this.$results == null) {
            console.error('SearchBar.js: filterResults: No search results. Returning...');
            return;
        }
        g.dataManager.search(
            this.$input.val(),      // search using current contents of search bar input
            { '_id': 1 },           // only need the id fields of the returned results
            this.update             // call this.update() with the results upon async completion
                .bind(this)         // make sure this.update() is running in the correct context
        );

    }

    /*
        Updates the ul of search results to match the results returned by searching the database.
        results: an array containing the ID's of the results which should be displayed after this update
    */
    update(results) {
        var searchResults = this.$results.children();
        searchResults.css('display', 'none');   // hide all search results
        var enabledCount = 0;   // how many search results are currently selected to be displayed

        if (results && results.length != 0) {   // if any results should be displayed
            for (var i = 0; i < results.length; i++) {
                var result = results[i];        // FOREACH database object result IN results
                // Find the search result li with an ID that matches the current database result object
                var resultListItem = this.findSearchResult(result._id);
                if (resultListItem === null) {
                    console.error('SearchBar.js:update(): Client has no list item with ID #' + result._id);
                } else {                        // search result li with matching ID found
                    enabledCount++;
                    this.moveResultToIndex(i, resultListItem);  // move to the i'th position in the list
                    $(resultListItem).css('display', '');       // show the li
                }
            }
        }
        searchResults.removeClass("selected");
        if (enabledCount == 0) {
            this.$results.css("display", "none");   // hide entire ul (stops the styled ul top and bottom from showing)
        } else {
            this.$results.css("display", "");
            this.$results.find("li:visible").first().addClass("selected"); // select top element
        }
    }

    /*
        text: string to append to the end of the current search bar query text
    */
    appendToSearchBar(text) {
        var newText = this.$input.val();
        newText += text + " ";
        this.$input.val(newText);
        this.$input.focus();
        this.filterResults();
    }

    /*
        Finds and returns the search result li with the given data-db-id attribute,
        or null if none exist.
    */
    findSearchResult(id) {
        //TODO: Store all search results in a map, and then just get the one at key[id]?
        //  would that be more efficient?
        var $result = this.$results.children().filter('[data-db-id="' + id + '"]');
        if ($result.length > 0) {
            return $result[0];
        }
        return null;
    }

    /*
        Moves a given search result li element to a given position in the ul.
    */
    moveResultToIndex(index, searchResult) {
        var $result = $(searchResult);                      // the element to be moved
        var $target = this.$results.children().eq(index);   // the element currently at the desired location

        // If $result will be moving up...
        if ($result.index() > index) {
            // Place above $target
            $target.before($result);
        } else {    // $result will be moving down
            // Place below $target
            $target.after($result);
        }
    };

}

export default SearchBar;