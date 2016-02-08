export default function() {
  var factorList = [];
  var trialEvents = [];
  var neuronList = [];

  dataManager.loadTrialInfo = function () {
    d3.json('DATA/' + 'trialInfo.json', function (error, trialInfo) {

    });
  };

}
