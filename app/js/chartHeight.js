import rasterView from './rasterView';
import rasterData from './rasterData';
/* If showing spikes, set to reasonable height so spikes are visible, else
   pick the normal height of the plot if it's small or a value that can fit
   several plots on the screen.
*/
export default function (data) {
  const spikeDiameter = 4;
  const noSpikesHeight = 200;
  let heightMargin = rasterView.margin().top + rasterView.margin().bottom;
  let withSpikesHeight = (data.values.length * spikeDiameter) + heightMargin;

  return rasterData.showSpikes() ? withSpikesHeight : d3.min([noSpikesHeight, withSpikesHeight]);
}
