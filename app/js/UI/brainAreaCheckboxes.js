import createBrainAreaCheckboxes from './createBrainAreaCheckboxes';
import rasterData from '../rasterData';

let brainAreaCheckboxes = createBrainAreaCheckboxes();

brainAreaCheckboxes.on('change', function () {
  var choices = [];
  d3.selectAll('.checkbox').each(function (d) {
    let cb = d3.select(this).select('input');
    if (cb.property('checked')) {
      choices.push(cb.property('id'));
    }
  });

  rasterData.includeBrainAreas(choices);
});

export default brainAreaCheckboxes;
