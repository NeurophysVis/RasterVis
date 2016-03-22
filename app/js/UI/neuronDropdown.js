import createDropdown from './createDropdown';
import rasterData from '../rasterData';

var neuronDropdown = createDropdown();

neuronDropdown
  .key('')
  .displayName('');

neuronDropdown.on('click', function () {
  var neuronName = d3.select(this).data()[0];
  rasterData.neuronName(neuronName);
});

export default neuronDropdown;
