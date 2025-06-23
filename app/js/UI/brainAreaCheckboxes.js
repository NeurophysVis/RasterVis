import createBrainAreaCheckboxes from './createBrainAreaCheckboxes';
import rasterData from '../rasterData';

let brainAreaCheckboxes = createBrainAreaCheckboxes();

brainAreaCheckboxes.on('change', function () {
  const choices = d3.selectAll('#NeuronFilter .checkbox input:checked').nodes().map(cb => cb.id);
  rasterData.includeBrainAreas(choices);
});

export default brainAreaCheckboxes;
