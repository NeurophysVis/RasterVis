import findAverageStartTime from './findAverageStartTimeEventPos';

export default function (selection, data, trialEvents, timeScale, curEvent, innerHeight) {

  const labelWidth = 45;
  const labelHeight = 33;

  findAverageStartTime(data, trialEvents, curEvent);

  // Add labels corresponding to trial events
  let eventLabel = selection.selectAll('.eventLabel').data(trialEvents, function (d) { return d.label; });

  eventLabel.enter()
    .append('foreignObject')
    .attr('class', 'eventLabel')
    .attr('id', function (d) { return d.label; })
    .attr('width', labelWidth)
    .attr('height', 33)
    .style('color', function (d) { return d.color; })
    .html(function (d) { return '<div>▲<br>' + d.label + '</div>'; });

  eventLabel
    .attr('x', function (d) {
      return timeScale(d.labelPosition) - (labelWidth / 2);
    })
    .attr('y', innerHeight + 16);
}
