import rasterDataManger from './rasterDataManger';

var rasterData = rasterDataManger();
rasterData.on('dataReady', function () {
  console.log(rasterData.sortedRasterData());
});

export default rasterData;
