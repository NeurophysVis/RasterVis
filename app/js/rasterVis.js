import trialInfo from './trialInfo';
import rasterData from './rasterData';

rasterData.neuronName('cc1_9_1');

export function init(passedParams) {
  trialInfo.loadTrialInfo();
}
