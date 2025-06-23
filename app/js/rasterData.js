import rasterDataManager from './rasterDataManager';
import rasterView from './rasterView';
import factorButton from './UI/factorButton';
import eventButton from './UI/eventButton';
import smoothingSlider from './UI/smoothingSlider';
import chartHeight from './chartHeight';
import neuronList from './UI/neuronList';
import neuronSearch from './UI/neuronSearch';
import showLinesCheckbox from './UI/showLinesCheckbox';
import showSpikesCheckbox from './UI/showSpikesCheckbox';
import brainAreaCheckboxes from './UI/brainAreaCheckboxes';
import legendView from './legendView';

let rasterData = rasterDataManager();
let fuseOptions = { threshold: .4 };

rasterData.on('dataReady', function () {
  d3.select('span#NeuronName')
    .text('Neuron ' + rasterData.brainArea() + ' ' + rasterData.neuronName());
  let chartWidth = document.getElementById('chart').offsetWidth;
  rasterView
    .width(chartWidth)
    .height(chartHeight)
    .timeDomain(rasterData.timeDomain())
    .trialEvents(rasterData.trialEvents())
    .lineSmoothness(rasterData.lineSmoothness())
    .showSmoothingLines(rasterData.showSmoothingLines())
    .showSpikes(rasterData.showSpikes())
    .curEvent(rasterData.curEvent())
    .curFactor(rasterData.curFactor())
    .interactionFactor(rasterData.interactionFactor())
    .colorScale(rasterData.colorScale());

  legendView(rasterData.colorScale());

  let multiples = d3.select('#chart').selectAll('div.row')
    .data(rasterData.rasterData(), function (d) { return d.key; });

  multiples.enter()
    .append('div')
    .attr('class', 'row')
    .attr('id', function (d) { return d.key; });

  multiples.exit().remove();
  multiples.call(rasterView);

  // UI
  factorButton.options(rasterData.factorList());
  eventButton.options(rasterData.trialEvents());

  neuronList.curSelected(rasterData.neuronName());
  d3.select('#FactorSortMenu').datum(rasterData.curFactor()).call(factorButton);
  d3.select('#EventMenu').datum(rasterData.curEvent()).call(eventButton);
  d3.select('#LineSmoothSliderPanel').datum(rasterData.lineSmoothness()).call(smoothingSlider);
  d3.select('#NeuronMenu').datum(rasterData.neuronList().filter(
    function (d) { return rasterData.includeBrainAreas().includes(d.brainArea); })
  ).call(neuronList);
  d3.select('#NeuronSearch').datum(rasterData.neuronList()).call(neuronSearch);
  d3.select('#NeuronFilter').datum(rasterData.includeBrainAreas()).call(brainAreaCheckboxes);

  showLinesCheckbox.property('checked', rasterData.showSmoothingLines());
  showSpikesCheckbox.property('checked', rasterData.showSpikes());
});

export default rasterData;
