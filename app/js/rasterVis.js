import rasterData from './rasterData';
import exportButton from './UI/exportButton';
import permalinkButton from './UI/permalinkButton';
import helpButton from './UI/helpButton';
import showLinesCheckbox from './UI/showLinesCheckbox';
import showSpikesCheckbox from './UI/showSpikesCheckbox';

export function init(passedParams) {

  let showSpikes = (passedParams.showSpikes === undefined) ?
    true : (passedParams.showSpikes === 'true');
  let showSmoothingLines = (passedParams.showSmoothingLines === undefined) ?
    true : (passedParams.showSmoothingLines === 'true');
  let lineSmoothness = (passedParams.lineSmoothness || 20);
  let curFactor = passedParams.curFactor || 'trial_id';
  let curEvent = passedParams.curEvent || 'start_time';
  let interactionFactor = passedParams.interactionFactor || '';
  let neuronName = passedParams.neuronName || '';

  rasterData
    .showSpikes(showSpikes)
    .showSmoothingLines(showSmoothingLines)
    .lineSmoothness(lineSmoothness)
    .curFactor(curFactor)
    .curEvent(curEvent)
    .interactionFactor(interactionFactor)
    .neuronName(neuronName);

}
