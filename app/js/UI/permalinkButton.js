import rasterData from '../rasterData';

let permalinkBox = d3.select('#permalink');
let permalinkButton = d3.select('button#link');
permalinkButton
  .on('click', function () {
    permalinkBox
      .style('display', 'block');

    let linkString = window.location.origin + window.location.pathname + '?' +
      'neuronName=' + rasterData.neuronName() +
      '&curFactor=' + rasterData.curFactor() +
      '&curEvent=' + rasterData.curEvent() +
      '&showSmoothingLines=' + rasterData.showSmoothingLines() +
      '&lineSmoothness=' + rasterData.lineSmoothness() +
      '&showSpikes=' + rasterData.showSpikes() +
      '&interactionFactor=' + rasterData.interactionFactor();
    permalinkBox.selectAll('textarea').html(linkString);
    permalinkBox.selectAll('.bookmark').attr('href', linkString);
  });

permalinkBox.selectAll('.close')
  .on('click', function () {
    permalinkBox.style('display', 'none');
  });

export default permalinkButton;
