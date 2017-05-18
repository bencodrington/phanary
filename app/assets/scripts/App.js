import SearchBar from './modules/SearchBar';
import AtmosphereManager from './modules/AtmosphereManager';


var searchBar = new SearchBar();
var atmosphereManager = new AtmosphereManager();
searchBar.atmosphereManager = atmosphereManager;