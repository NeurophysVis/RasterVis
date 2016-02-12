import createDropdown from './createDropdown';
import trialInfo from '../trialInfo';
import rasterData from '../rasterData';

var factorDropdown = createDropdown()
  .key('value')
  .displayName('name');

factorDropdown.on('click', function () {
  var curFactor = d3.select(this).data()[0];
  rasterData.curFactor(curFactor.value);
});

export default factorDropdown;
