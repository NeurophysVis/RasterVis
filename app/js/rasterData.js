import rasterDataManger from './rasterDataManger';
import rasterView from './rasterView';

var rasterData = rasterDataManger();
rasterData.on('dataReady', function () {
  var chartWidth = document.getElementById('chart').offsetWidth;
  rasterView
    .width(chartWidth)
    .timeDomain(rasterData.timeDomain());

  var multiples = d3.select('#chart').selectAll('div.row').data(rasterData.rasterData());
  multiples.enter()
    .append('div')
      .attr('class', 'row');
  multiples.exit().remove();
  multiples.call(rasterView);
});

export default rasterData;
