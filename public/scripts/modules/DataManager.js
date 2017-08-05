import $ from 'jquery';
import { g } from "./GlobalVars";
require('./templates/searchResult');

class DataManager {

    /*
        Responsible for making calls to the system API to get track and atmosphere data and files.
    */

    constructor() {
        this.fetchNames();
    }

    /* 
        Retrieves the names and tags of all entries in the database,
        and passes them to the populateSearchResults function upon
        asynchronous completion.
    */
    fetchNames() {
        var query = {
            'collection': 'tracks',         // select loop collection for retrieval
            'selectedInfo': {               // only need name and tags to complete search result template
                name: true,
                tags: true
            }
        };

        $.getJSON('/system/get', query, function( data ) {
            this.populateSearchResults(data, 'track');
        }.bind(this));
        query.collection = 'atmospheres';   // select atmosphere collection for retrieval
        $.getJSON('/system/get', query, function( data ) {
            this.populateSearchResults(data, 'atmosphere');
        }.bind(this));
        query.collection = 'oneshots';      // select one-shot collection for retrieval
        $.getJSON('/system/get', query, function( data ) {
            this.populateSearchResults(data, 'oneshot');
        }.bind(this));
    }

    populateSearchResults(data, type) {
        var that = this;
        $.each(data, function(index, object) {
            var $resultHTML = that.generateResultHTML(object, type);    // get result DOM element
            that.rigResultEvents($resultHTML);                          // attach event handlers
        } );
    }

    /*
        Injects result data into result template, then appends the created
        DOM element to the search results ul.
    */
    generateResultHTML(object, type) {
        var resultObject = {
            _id: object._id,
            name: object.name,
            tags: object.tags,
            type: "result--" + type
        };

        var resultHTML = Handlebars.templates['searchResult.hbs'](resultObject);
        return $(resultHTML).appendTo(g.searchBar.$results);
    }

    rigResultEvents($resultHTML) {
        $resultHTML.on('mouseover', function() {
            g.searchBar.select($resultHTML);
        })
        $resultHTML.on('click', function() {
            g.atmosphereManager.addSelected($resultHTML);
            g.searchBar.clearSearchBar();
        });
    }

    search(query, selectedInfo, callback) {
        var params = {
            'query': query,
            'selectedInfo': selectedInfo ? selectedInfo : {}
        };
        $.getJSON('/system/search', params, function(results) {
            callback(results);
        });
    }

    getData(collection, id, callback) {
        var params = {
            'collection': collection,
            'id': id
        };
        $.getJSON('/system/find', params, function(result) {
            callback(result);
        });
    }
}

export default DataManager;