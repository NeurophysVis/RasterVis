import rasterData from '../rasterData';
let showSpikesCheckbox = d3.select('#showRaster input');

showSpikesCheckbox.on('change', function () {
  rasterData.showSpikes(this.checked);
});

export default showSpikesCheckbox;
