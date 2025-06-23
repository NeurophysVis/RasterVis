import createDropdown from './createDropdown';
import rasterData from '../rasterData';

const factorDropdown = createDropdown()
  .key('value')
  .displayName('name');

factorDropdown.on('click', function () {
  var curFactor = d3.select(this).data()[0];
  rasterData.curFactor(curFactor.value);
});

export default factorDropdown;
