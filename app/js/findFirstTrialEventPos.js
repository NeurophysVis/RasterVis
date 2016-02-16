// Append first non-null time for label position
export default function (data, trialEvents, curEvent) {
  // if timePeriod value is null, find the next non-null trial
  let dataStartInd = 0;
  while (data[dataStartInd][trialEvents[0].startID] === null && (dataStartInd < data.length - 1)) {
    dataStartInd++;
  }

  trialEvents.forEach(function (period, ind) {
    period.labelPosition = data[dataStartInd][period.startID] - data[dataStartInd][curEvent];
  });
}
