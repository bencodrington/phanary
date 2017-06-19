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
                name: true
            }
        };

        $.getJSON('/system/get', query, function( data ) {
            console.log('track names retrieved');
            console.log(data);
            this.populateSearchResults(data, 'track');
        }.bind(this));
        query.collection = 'atmospheres';
        $.getJSON('/system/get', query, function( data ) {
            console.log('atmosphere names retrieved');
            console.log(data);
            this.populateSearchResults(data, 'atmosphere');
        }.bind(this));
        query.collection = 'oneshots';
        $.getJSON('/system/get', query, function( data ) {
            console.log('oneshot names retrieved');
            console.log(data);
            this.populateSearchResults(data, 'oneshot');
        }.bind(this));
    }

    populateSearchResults(data, type) {
        var that = this;
        var resultHTML;
        $.each(data, function(index, object) {
            // console.log("DataManager.js: populateSearchResults: object.name: " + object.name);
            var $resultHTML = that.generateResultHTML(object._id, object.name, type);
            that.rigResultEvents($resultHTML);
        } );
    }

    generateResultHTML(id, name, type) {
        var resultObject = {
            _id: id,
            name: name,
            type: "result--" + type
        };
        var resultHTML = Handlebars.templates['searchResult.hbs'](resultObject);
        return $(resultHTML).appendTo(g.$searchResults);
    }

    rigResultEvents($resultHTML) {
        $resultHTML.on('mouseover', function() {
            g.searchBar.select($resultHTML);
        })
        $resultHTML.on('click', function() {
            if ($resultHTML.hasClass("result--track") || $resultHTML.hasClass("result--oneshot")) {
                g.atmosphereManager.addTrack(
                    g.nameToTrackData($resultHTML.text())
                );
            } else if ($resultHTML.hasClass("result--atmosphere")) {
                g.atmosphereManager.addAtmosphere(
                    g.nameToAtmosphereData($resultHTML.text())
                );
            }
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