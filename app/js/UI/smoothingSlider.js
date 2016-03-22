import createSlider from './createSlider';
import rasterData from '../rasterData';

let smoothingSlider = createSlider();

smoothingSlider
  .domain([5, 1000])
  .stepSize(5)
  .units('ms');

smoothingSlider.on('sliderChange', function (smoothing) {
  rasterData.lineSmoothness(smoothing);
});

export default smoothingSlider;
