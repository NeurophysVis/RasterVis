import merge from '../../node_modules/lodash-es/merge';
import queue from '../../node_modules/d3-queue/src/queue';

export default function() {
  var neuronName = '';
  var sessionName = '';
  var rasterData = {};
  var sortedRasterData = {};
  var showSpikes = true;
  var showSmoothingLines = true;
  var lineSmoothness = 20;
  var curFactor = 'trial_id';
  var curEvent = '';
  var interactionFactor = '';
  var dispatch = d3.dispatch('dataReady');
  var dataManager = {};

  dataManager.loadRasterData = function () {
    var s = neuronName.split('_');
    sessionName = s[0];
    queue()
      .defer(d3.json, 'DATA/' + sessionName + '_TrialInfo.json')
      .defer(d3.json, 'DATA/Neuron_' + neuronName + '.json')
      .await(function (error, sessionInfo, neuron) {
        rasterData = merge(sessionInfo, neuron.Spikes);
        dataManager.sortRasterData();
        dispatch.dataReady();
      });
  };

  dataManager.sortRasterData = function () {
    // Nest and Sort Data
    if (curFactor != 'trial_id') {
      sortedRasterData = d3.nest()
          .key(function (d) { return d[curFactor];}) // nests data by selected factor
              .sortValues(function (a, b) { // sorts values based on Rule
                return d3.ascending(a[interactionFactor], b[interactionFactor]);
              })
          .entries(rasterData);
    } else {
      sortedRasterData = d3.nest()
          .key(function (d) {return d[''];}) // nests data by selected factor
            .sortValues(function (a, b) { // sorts values based on trial
              return d3.ascending(a.trial_id, b.trial_id);
            })
          .entries(rasterData);
    }
  };

  dataManager.neuronName  = function (value) {
    if (!arguments.length) return neuronName;
    neuronName = value;
    return dataManager;
  };

  dataManager.sessionName  = function (value) {
    if (!arguments.length) return sessionName;
    sessionName = value;
    return dataManager;
  };

  dataManager.rasterData  = function (value) {
    if (!arguments.length) return rasterData;
    rasterData = value;
    return dataManager;
  };

  dataManager.showSpikes  = function (value) {
    if (!arguments.length) return showSpikes;
    showSpikes = value;
    return dataManager;
  };

  dataManager.showSmoothingLines = function (value) {
    if (!arguments.length) return showSmoothingLines;
    showSmoothingLines = value;
    return dataManager;
  };

  dataManager.lineSmoothness = function (value) {
    if (!arguments.length) return lineSmoothness;
    lineSmoothness = value;
    return dataManager;
  };

  dataManager.curFactor = function (value) {
    if (!arguments.length) return curFactor;
    curFactor = value;
    return dataManager;
  };

  dataManager.curEvent = function (value) {
    if (!arguments.length) return curEvent;
    curEvent = value;
    return dataManager;
  };

  dataManager.sortedRasterData = function (value) {
    if (!arguments.length) return sortedRasterData;
    sortedRasterData = value;
    return dataManager;
  };

  d3.rebind(dataManager, dispatch, 'on');

  return dataManager;

}
