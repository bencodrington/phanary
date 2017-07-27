import $ from 'jquery';
import { g } from "./GlobalVars";
require('./templates/searchResult');

class DataManager {

    constructor() {
        this.fetchNames();
    }

    fetchNames() {
        var query = {
            'collection': 'tracks',
            'selectedInfo': {
                name: true,
                tags: true
            }
        };

        $.getJSON('/system/get', query, function( data ) {
            this.populateSearchResults(data, 'track');
        }.bind(this));
        query.collection = 'atmospheres';
        $.getJSON('/system/get', query, function( data ) {
            this.populateSearchResults(data, 'atmosphere');
        }.bind(this));
        query.collection = 'oneshots';
        $.getJSON('/system/get', query, function( data ) {
            this.populateSearchResults(data, 'oneshot');
        }.bind(this));
    }

    populateSearchResults(data, type) {
        var that = this;
        var resultHTML;
        $.each(data, function(index, object) {
            // console.log("DataManager.js: populateSearchResults: object.name: " + object.name);
            var $resultHTML = that.generateResultHTML(object, type);
            that.rigResultEvents($resultHTML);
        } );
    }

    generateResultHTML(object, type) {
        var resultObject = {
            _id: object._id,
            name: object.name,
            tags: object.tags,
            type: "result--" + type
        };

        if (type === "oneshot") {
            resultObject.isOneshot = true;
        } else if (type === "atmosphere") {
            resultObject.isAtmosphere = true;
        } else {
            resultObject.isLoop = true;
        }

        var resultHTML = Handlebars.templates['searchResult.hbs'](resultObject);
        return $(resultHTML).appendTo(g.$searchResults);
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