import SearchBar from './modules/SearchBar';
import { g } from './modules/GlobalVars';
import About from './modules/About';

var searchBar = new SearchBar();
g.searchBar = searchBar;
g.about = new About();