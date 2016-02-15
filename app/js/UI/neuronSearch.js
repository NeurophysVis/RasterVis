import createSearch from './createSearch';
import rasterData from '../rasterData';

let neuronSearch = createSearch();
const fuseOptions = {
  threshold: 0.4,
  shouldSort: true,
  location: 1,
};

neuronSearch.on('click', function (d) {
  rasterData.neuronName(d);
});

neuronSearch.fuseOptions(fuseOptions);

export default neuronSearch;
