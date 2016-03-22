// Append average start time for event label position
export default function (data, trialEvents, curEvent) {
  trialEvents.forEach(function (period, ind) {
    let avgTime = d3.mean(data, function (trial) {
      if (trial[curEvent] !== null && trial[period.startID] !== null) {
        return trial[period.startID] - trial[curEvent];
      }

    });

    period.labelPosition = avgTime;
  });
}
