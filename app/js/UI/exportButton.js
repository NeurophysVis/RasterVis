import rasterData from '../rasterData';
import {save as saveSVG} from '../../../node_modules/d3-save-svg/index.js';

let exportButton = d3.select('button#export');

exportButton
  .on('click', function () {
    let svg = d3.selectAll('#chart').selectAll('svg')[0];
    let levelNames = rasterData.rasterData().map(function (d) {return d.key;});
    let curFactor = rasterData.curFactor();
    let curEvent = rasterData.curEvent();
    let neuronName = rasterData.neuronName();

    svg.forEach(function (s, i) {
      let saveName = neuronName + '_' +
                     curEvent + '_' +
                     curFactor + '_' +
                     levelNames[i];
      saveSVG(s, { filename: saveName });
    });

  });

export default exportButton;
