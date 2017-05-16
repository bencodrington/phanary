import SearchBar from './modules/SearchBar';
import TrackManager from './modules/TrackManager';
import AtmosphereManager from './modules/AtmosphereManager';


var trackDataURL = "assets/data/tracks.json"; //https:api.myjson.com/bins/15eiip";
var atmosphereDataURL = "assets/data/atmospheres.json";

var searchBar = new SearchBar();
var atmosphereManager = new AtmosphereManager(atmosphereDataURL, searchBar);
searchBar.atmosphereManager = atmosphereManager;
var trackManager = new TrackManager(trackDataURL, atmosphereManager, searchBar);
searchBar.trackManager = trackManager;