import $ from 'jquery';
import Handlebars from 'handlebars';
import { g } from "./GlobalVars.js";

class DataReader {

    constructor(trackDataURL, callback) {
        this.readTrackData(trackDataURL, callback);
    }

    // Parse tracks.json file to retrieve track info
    readTrackData(file, callback){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 && xhr.status === 200){
                callback(JSON.parse(xhr.responseText));
            }
        }
        xhr.open('GET', file, true);
        xhr.send();
    }

    populateSearchResults(trackData) {
        var rawTemplate = $("#searchResultTemplate").html();
        var compiledTemplate = Handlebars.compile(rawTemplate);
        var resultObject = {};
        var resultHTML;
        $.each(trackData.tracks, function(name) {
            console.log("DataReader.js: populateSearchResults: name: " + name);
            resultObject['name'] = name;
            resultHTML = compiledTemplate(resultObject);
            $(resultHTML).appendTo(g.$searchResults);
        } );
    }

}

export default DataReader;