import createList from './createList';
import rasterData from '../rasterData';

let neuronList = createList();

neuronList.key('name');

neuronList.on('click', function (d) {
  rasterData.neuronName(d);
});

export default neuronList;
