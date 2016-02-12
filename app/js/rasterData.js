import rasterDataManger from './rasterDataManger';
import rasterView from './rasterView';
import trialInfo from './trialInfo';
import factorButton from './UI/factorButton';
import eventButton from './UI/eventButton';

var rasterData = rasterDataManger();
rasterData.on('dataReady', function () {
  var chartWidth = document.getElementById('chart').offsetWidth;
  rasterView
    .width(chartWidth)
    .timeDomain(rasterData.timeDomain())
    .trialEvents(trialInfo.trialEvents())
    .curEvent(rasterData.curEvent());

  var multiples = d3.select('#chart').selectAll('div.row').data(rasterData.rasterData(), function (d) {return d.key;});

  multiples.enter()
    .append('div')
      .attr('class', 'row')
      .attr('id', function (d) {return d.key;});

  multiples.exit().remove();
  multiples.call(rasterView);

  d3.select('#FactorSortMenu').datum(rasterData.curFactor()).call(factorButton);
  d3.select('#EventMenu').datum(rasterData.curEvent()).call(eventButton);
});

export default rasterData;
