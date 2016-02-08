import merge from '../../node_modules/lodash-es/merge';

export default function() {
  var neuronName = '';
  var sessionName = '';
  var rasterData = {};
  var showSpikes = true;
  var showPETH = true;
  var pethSmoothness = 20;
  var curFactor = '';
  var curEvent = '';

  dataManager.loadRasterData = function () {
    queue()
      .defer(d3.json, 'DATA/' + sessionName + '_TrialInfo.json')
      .defer(d3.json, 'DATA/Neuron_' + neuronName + '.json')
      .await(function (error, sessionInfo, neuron) {
        rasterData = merge(sessionInfo, neuron.Spikes);
      });
  };

}
