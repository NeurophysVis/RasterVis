export default function (selection, data, trialEvents, timeScale, curEvent) {

  const labelWidth = 45;

  // if timePeriod value is null, find the next non-null trial
  var dataStartInd = 0;
  while (data[dataStartInd][trialEvents[0].startID] === null && (dataStartInd < data.length - 1)) {
    dataStartInd++;
  }

  // Append first non-null time for label position
  trialEvents.forEach(function (period, ind) {
    period.labelPosition = data[dataStartInd][period.startID] - data[dataStartInd][curEvent];
  });

  // Add labels corresponding to trial events
  var eventLabel = selection.selectAll('.eventLabel').data(trialEvents, function (d) {return d.label;});

  eventLabel.enter()
    .append('foreignObject')
      .attr('class', 'eventLabel')
      .attr('id', function (d) {return d.label;})
      .attr('y', 0)
      .attr('width', labelWidth)
      .attr('height', 33)
      .style('color', function (d) {return d.color;})
      .html(function (d) {return '<div>' + d.label + '<br>▼</div>'; });

  eventLabel
    .attr('x', function (d) {
      return timeScale(d.labelPosition) + (labelWidth / 2);
    });
}
