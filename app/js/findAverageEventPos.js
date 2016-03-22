// Append average start time for event label position
export default function (data, trialEvents, curEvent) {
  let avgHalfDuration = trialEvents.map(function (period) {
    return d3.mean(data, function (trial) {
      if (trial[curEvent] !== null && trial[period.startID] !== null) {
        return (trial[period.endID] - trial[period.startID]) / 2;
      }
    });
  });

  trialEvents.forEach(function (period, ind) {
    let avgTime = d3.mean(data, function (trial) {
      if (trial[curEvent] !== null && trial[period.startID] !== null) {
        return (trial[period.startID] + avgHalfDuration[ind] - trial[curEvent]);
      }

    });

    period.labelPosition = avgTime;
  });
}
