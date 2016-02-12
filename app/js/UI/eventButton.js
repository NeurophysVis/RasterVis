import createDropdown from './createDropdown';
import rasterData from '../rasterData';

var eventDropdown = createDropdown()
  .key('startID')
  .displayName('name');

eventDropdown.on('click', function () {
  var curEvent = d3.select(this).data()[0];
  rasterData.curEvent(curEvent.startID);
});

export default eventDropdown;
