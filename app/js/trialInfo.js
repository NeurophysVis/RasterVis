import trialInfoDataManager from './trialInfoDataManger';
import rasterData from './rasterData';
import factorButton from './UI/factorButton';
import eventButton from './UI/eventButton';

var trialInfo = trialInfoDataManager();
trialInfo.on('dataReady', function () {
  factorButton.options(trialInfo.factorList());
  eventButton.options(trialInfo.trialEvents());
  rasterData.loadRasterData();
});

export default trialInfo;
