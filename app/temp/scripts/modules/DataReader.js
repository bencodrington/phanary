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

    populateSearchResults(data, type) {
        var rawTemplate = $("#searchResultTemplate").html();
        var compiledTemplate = Handlebars.compile(rawTemplate);
        var resultObject = {};
        var resultHTML;
        $.each(data, function(name) {
            // console.log("DataReader.js: populateSearchResults: name: " + name);
            resultObject['name'] = name;
            resultObject['type'] = type;
            resultHTML = compiledTemplate(resultObject);
            $(resultHTML).appendTo(g.$searchResults);
        } );
    }

}

export default DataReader;