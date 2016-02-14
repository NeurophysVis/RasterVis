import rasterDataManger from './rasterDataManger';
import rasterView from './rasterView';
import factorButton from './UI/factorButton';
import eventButton from './UI/eventButton';
import smoothingSlider from './UI/smoothingSlider';
import neuronDropdown from './UI/neuronDropdown';

var rasterData = rasterDataManger();
rasterData.on('dataReady', function () {
  var chartWidth = document.getElementById('chart').offsetWidth;
  rasterView
    .width(chartWidth)
    .height(function (d) {return d.values.length * 4; })
    .timeDomain(rasterData.timeDomain())
    .trialEvents(rasterData.trialEvents())
    .lineSmoothness(rasterData.lineSmoothness())
    .curEvent(rasterData.curEvent())
    .curFactor(rasterData.curFactor());

  var multiples = d3.select('#chart').selectAll('div.row').data(rasterData.rasterData(), function (d) {return d.key;});

  multiples.enter()
    .append('div')
      .attr('class', 'row')
      .attr('id', function (d) {return d.key;});

  multiples.exit().remove();
  multiples.call(rasterView);

  factorButton.options(rasterData.factorList());
  eventButton.options(rasterData.trialEvents());
  neuronDropdown.options(rasterData.neuronList());

  d3.select('#NeuronMenu').datum(rasterData.neuronList()).call(neuronDropdown);
  d3.select('#FactorSortMenu').datum(rasterData.curFactor()).call(factorButton);
  d3.select('#EventMenu').datum(rasterData.curEvent()).call(eventButton);
  d3.select('#LineSmoothSliderPanel').datum(rasterData.lineSmoothness()).call(smoothingSlider);
});

export default rasterData;
