export default function() {
  var factorList = [];
  var trialEvents = [];
  var neuronList = [];
  var dispatch = d3.dispatch('dataReady');
  var dataManager = {};

  dataManager.loadTrialInfo = function () {
    d3.json('DATA/' + 'trialInfo.json', function (error, trialInfo) {
      factorList = trialInfo.experimentalFactor;
      trialEvents = trialInfo.timePeriods;
      neuronList = trialInfo.monkey;
      dispatch.dataReady();
    });
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
