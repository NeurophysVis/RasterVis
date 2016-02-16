import createSearch from './createSearch';
import rasterData from '../rasterData';

let neuronSearch = createSearch();

const fuseOptions = {
  threshold: 0.4,
  shouldSort: true,
  include: ['score'],
  location: 1,
  keys: ['name', 'brainArea'],
};

neuronSearch.on('click', function (d) {
  rasterData.neuronName(d);
});

neuronSearch
  .fuseOptions(fuseOptions)
  .key('name');

export default neuronSearch;
