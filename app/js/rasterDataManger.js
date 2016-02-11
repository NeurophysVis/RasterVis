import merge from '../../node_modules/lodash-es/merge';
import queue from '../../node_modules/d3-queue/src/queue';

export default function() {
  var neuronName = '';
  var sessionName = '';
  var rasterData = {};
  var spikeInfo = {};
  var sessionInfo = {};
  var showSpikes = true;
  var showSmoothingLines = true;
  var lineSmoothness = 20;
  var curFactor = 'trial_id';
  var curEvent = 'start_time';
  var interactionFactor = '';
  var timeDomain = [];
  var dispatch = d3.dispatch('dataReady');
  var dataManager = {};

  dataManager.loadRasterData = function () {
    var s = neuronName.split('_');
    sessionName = s[0];
    queue()
      .defer(d3.json, 'DATA/' + sessionName + '_TrialInfo.json')
      .defer(d3.json, 'DATA/Neuron_' + neuronName + '.json')
      .await(function (error, sI, neuron) {
        spikeInfo = neuron.Spikes;
        sessionInfo = sI;
        var minTime = d3.min(sessionInfo, function (s) { return s.start_time; });

        var maxTime = d3.max(sessionInfo, function (s) { return s.end_time; });

        timeDomain = [minTime, maxTime];
        dataManager.sortRasterData();
        dispatch.dataReady();
      });
  };

  dataManager.sortRasterData = function () {
    var relativeSpikes = spikeInfo.map(function (trial, ind) {
      if (Array.isArray(trial.spikes))
      {
        return {
          trial_id: trial.trial_id,
          spikes: trial.spikes.map(function (s) { return s - sessionInfo[ind][curEvent]; }),
        };
      } else {
        return {
          trial_id: trial.trial_id,
          spikes: [],
        };
      }
    });

    rasterData = merge(sessionInfo, relativeSpikes);

    // Nest and Sort Data
    if (curFactor != 'trial_id') {
      rasterData = d3.nest()
          .key(function (d) { return d[curFactor] + '_' + sessionName;}) // nests data by selected factor
              .sortValues(function (a, b) { // sorts values based on Rule
                return d3.ascending(a[interactionFactor], b[interactionFactor]);
              })
          .entries(rasterData);
    } else {
      rasterData = d3.nest()
          .key(function (d) {return d[''] + '_' + sessionName;}) // nests data by selected factor
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

  dataManager.timeDomain = function (value) {
    if (!arguments.length) return timeDomain;
    timeDomain = value;
    return dataManager;
  };

  d3.rebind(dataManager, dispatch, 'on');

  return dataManager;

}
