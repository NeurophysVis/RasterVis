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
  var factorList = [];
  var trialEvents = [];
  var neuronList = [];
  var dispatch = d3.dispatch('dataReady');
  var dataManager = {};

  dataManager.loadRasterData = function () {
    var s = neuronName.split('_');
    sessionName = s[0];
    queue()
      .defer(d3.json, 'DATA/' + 'trialInfo.json')
      .defer(d3.json, 'DATA/' + sessionName + '_TrialInfo.json')
      .defer(d3.json, 'DATA/Neuron_' + neuronName + '.json')
      .await(function (error, trialInfo, sI, neuron) {
        factorList = trialInfo.experimentalFactor;
        trialEvents = trialInfo.timePeriods;
        neuronList = trialInfo.monkey;
        spikeInfo = neuron.Spikes;
        sessionInfo = sI;

        dataManager.sortRasterData();
        dataManager.changeEvent();
        dispatch.dataReady();
      });
  };

  dataManager.changeEvent = function () {
    var minTime = d3.min(sessionInfo, function (s) { return s[curEvent] - s.start_time; });

    var maxTime = d3.max(sessionInfo, function (s) { return s.end_time - s[curEvent]; });

    timeDomain = [minTime, maxTime];
  };

  dataManager.sortRasterData = function () {
    rasterData = merge(sessionInfo, spikeInfo);
    var factorType = factorList.filter(function (d) {return d.value === curFactor;})
                               .map(function (d) {return d.factorType;})[0].toUpperCase();

    // Nest and Sort Data
    if (factorType !== 'CONTINUOUS') {
      rasterData = d3.nest()
        .key(function (d) { return d[curFactor] + '_' + sessionName;}) // nests data by selected factor
        .sortKeys(function (a, b) {
          // Sort ordinal keys
          if (factorType === 'ORDINAL') return d3.ascending(+a[curFactor], +b[curFactor]);
        })
        .sortValues(function (a, b) {
          // If interaction factor is specified, then sort by that as well
          if (interactionFactor !== '') return d3.ascending(+a[interactionFactor], +b[interactionFactor]);
        })
        .entries(rasterData);
    } else {
      rasterData = d3.nest()
        .key(function (d) {return d[''] + '_' + sessionName;}) // nests data by selected factor
          .sortValues(function (a, b) { // sorts values on factor if continuous
            return d3.ascending(+a[curFactor], +b[curFactor]);
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
    if (sessionInfo !== {}) dataManager.sortRasterData(); dispatch.dataReady();
    return dataManager;
  };

  dataManager.curEvent = function (value) {
    if (!arguments.length) return curEvent;
    curEvent = value;
    if (sessionInfo !== {}) dataManager.changeEvent(); dispatch.dataReady();
    return dataManager;
  };

  dataManager.timeDomain = function (value) {
    if (!arguments.length) return timeDomain;
    timeDomain = value;
    return dataManager;
  };

  dataManager.factorList = function (value) {
    if (!arguments.length) return factorList;
    factorList = value;
    return dataManager;
  };

  dataManager.trialEvents = function (value) {
    if (!arguments.length) return trialEvents;
    trialEvents = value;
    return dataManager;
  };

  dataManager.neuronList = function (value) {
    if (!arguments.length) return neuronList;
    neuronList = value;
    return dataManager;
  };

  d3.rebind(dataManager, dispatch, 'on');

  return dataManager;

}
