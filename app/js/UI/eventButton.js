import createDropdown from './createDropdown';
import rasterData from '../rasterData';

let eventDropdown = createDropdown()
  .key('startID')
  .displayName('name');

eventDropdown.on('click', function () {
  let curEvent = d3.select(this).data()[0];
  rasterData.curEvent(curEvent.startID);
});

export default eventDropdown;
