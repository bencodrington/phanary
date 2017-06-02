import $ from 'jquery';
import Handlebars from 'handlebars';
import { g } from "./GlobalVars.js";

class DataReader {

    constructor(dataURL, callback) {
        this.readData(dataURL, callback);
    }

    // Parse JSON from file
    readData(file, callback){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 && xhr.status === 200){
                callback(JSON.parse(xhr.responseText));
            }
        }
        xhr.open('GET', file, true);
        xhr.send();
    }

    populateSearchResults(data) {
        var rawTemplate = $("#searchResultTemplate").html();
        var compiledTemplate = Handlebars.compile(rawTemplate);
        var resultObject = {};
        var resultHTML;
        $.each(data, function(name, object) {
            // console.log("DataReader.js: populateSearchResults: type: " + object.type);
            resultObject['name'] = name;
            resultObject['type'] = "result--" + object.type;
            resultHTML = compiledTemplate(resultObject);
            var $resultHTML = $(resultHTML).appendTo(g.$searchResults);
            $resultHTML.on('mouseover', function() {
                g.searchBar.select($resultHTML);
            })
            $resultHTML.on('click', function() {
                if ($resultHTML.hasClass("result--track")) {
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
        } );
    }

}

export default DataReader;