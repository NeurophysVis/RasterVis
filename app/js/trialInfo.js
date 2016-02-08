import trialInfoDataManager from './trialInfoDataManger';
import rasterData from './rasterData';

var trialInfo = trialInfoDataManager();
trialInfo.on('dataReady', function () {
  rasterData.loadRasterData();
});

export default trialInfo;
