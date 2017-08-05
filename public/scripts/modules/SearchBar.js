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
        var $clearBtn   = $("#searchBarClearBtn");  // the button that removes current text from the search bar

        this.$input.on('keyup', this.keyPressInSearchBar.bind(this));
        this.$input.focus(function() {
            $(this).select();
        });
        this.$input.keydown(this.blockArrowKeys);
        
        $clearBtn.click(this.clearSearchBar.bind(this));
        g.$autoplayCheckbox.click(function(event) {
            this.$input.focus();
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
                    g.atmosphereManager.addSelected($selected);
                    this.clearSearchBar();
                }
                e.preventDefault();
                break;
            case 38:    // Up Key
            case 40:    // Down Key
                var $visibleResults = this.$results.find("li:visible");
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
        var $results = this.$results.find('.selected').removeClass('selected');
    }

    select($result) {
        this.deselect();
        $result.addClass('selected');
    }

    blockArrowKeys(e) {
            var keyCode = (e.keyCode ? e.keyCode : e.which);
            if (keyCode == 38 || keyCode == 40) {
                e.preventDefault();
            }
    }

    clearSearchBar() {
        this.$input.val("");
        this.$input.focus();
        this.filterResults();
    }

    filterResults() {
        if (this.$results == null) {
            console.log('SearchBar.js: filterResults: No search results. Returning...');
            return;
        }

        g.dataManager.search(this.$input.val(), { '_id': 1 }, this.update.bind(this));

    }

    update(results) {
        var searchResults = this.$results.children(),
        enabledCount = 0;

        // console.log("/update/results: ");
        // console.log(results);

        // Hide all search results
        searchResults.css('display', 'none');

        if (results && results.length != 0) {

            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                // Find search result with matching ID
                var resultListItem = this.findSearchResult(result._id);
                if (resultListItem === null) {
                    console.error('Client has no list item with ID #' + result._id);
                } else {
                    // Move to the i'th position in the list
                    enabledCount++;
                    this.moveResultToIndex(i, resultListItem);
                    $(resultListItem).css('display', '');
                }
            }
        }

        searchResults.removeClass("selected");
        if (enabledCount == 0) {
            this.$results.css("display", "none");
        } else {
            this.$results.css("display", "");
            // Select top element
            this.$results.find("li:visible").first().addClass("selected");
        }
    }

    appendToSearchBar(text) {
        var newText = this.$input.val();
        newText += text + " ";
        this.$input.val(newText);
        this.$input.focus();
        this.filterResults();
    }

    findSearchResult(id) {
        //TODO: Store all search results in a map, and then just get the one at key[id]?
        var $result = this.$results.children().filter('[data-db-id="' + id + '"]');

        if ($result.length > 0) {
            return $result[0];
        }
        return null;
    }

    moveResultToIndex(index, searchResult) {
        // The element to be moved
        var $result = $(searchResult);
        // The element currently at the desired location
        var $target = this.$results.children().eq(index);

        // If element will be moving left...
        if ($result.index() > index) {
            // Place on the left
            $target.before($result);
        } else {
            // Place on the right
            $target.after($result);
        }
    };

}

export default SearchBar;