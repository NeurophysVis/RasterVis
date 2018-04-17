import createSlider from './createSlider';
import rasterData from '../rasterData';

let smoothingSlider = createSlider();

smoothingSlider
  .domain([5, 1000])
  .stepSize(5)
  .units('ms');

smoothingSlider.on('sliderChange', function (bandwidth) {
  rasterData.lineSmoothness(bandwidth);
});

export default smoothingSlider;
