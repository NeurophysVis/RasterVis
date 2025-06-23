import rasterData from '../rasterData';
import { save as saveSVG } from '../../../node_modules/d3-save-svg/index.js';

const exportButton = d3.select('button#export');

exportButton
  .on('click', function () {
    const svgs = d3.selectAll('#chart').selectAll('svg').nodes();

    svgs.forEach((svgNode, i) => {
      const svgSelection = d3.select(svgNode);
      // Find the canvas associated with this SVG
      const canvas = svgSelection.select('.spikes-canvas').node();
      if (!canvas) return;

      // Get the canvas content as a base64 image URL
      const imgData = canvas.toDataURL('image/png');

      // Temporarily embed the canvas image into the SVG for export.
      // We insert it before '.smoothLine' to ensure it's under the smoothing line.
      const tempImage = svgSelection.select('g').insert('image', '.smoothLine')
        .attr('xlink:href', imgData)
        .attr('width', canvas.width)
        .attr('height', canvas.height);

      // Prepare the filename (logic from original file)
      const levelNames = rasterData.rasterData().map(function (d) { return d.key; });
      const curFactor = rasterData.curFactor();
      const curEvent = rasterData.curEvent();
      const neuronName = rasterData.neuronName();
      const saveName = `${neuronName}_${curEvent}_${curFactor}_${levelNames[i]}`;

      // Save the modified SVG
      saveSVG(svgNode, { filename: saveName });

      // IMPORTANT: Remove the temporary image after saving to restore the live chart
      tempImage.remove();
    });
  });

export default exportButton;
