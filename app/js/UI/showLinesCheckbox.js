import rasterData from '../rasterData';
let showLinesCheckbox = d3.select('#showLines input');

showLinesCheckbox.on('change', function () {
  rasterData.showSmoothingLines(this.checked);
});

export default showLinesCheckbox;
