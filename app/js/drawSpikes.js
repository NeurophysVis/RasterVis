import flatten from '../../node_modules/lodash-es/flatten';

// Draws spikes as circles
export default function (selection, sessionInfo, timeScale, yScale, curEvent, interactionFactor, colorScale) {

  let circleRadius = yScale.rangeBand() / 2;

  // Reshape to spike time, trial position.
  // Adjust spike time relative to current trial event
  let data = sessionInfo.map(function (trial, ind) {
    if (!Array.isArray(trial.spikes)) { return []; };

    return trial.spikes.map(function (spike) {
      return [spike - trial[curEvent], ind];
    });
  });

  let factorLevel = sessionInfo.map(function (d) { return d[interactionFactor]; });

  // Flatten
  data = flatten(data);

  let circles = selection.selectAll('circle').data(data);
  circles.enter()
    .append('circle')
    .style('opacity', 1E-5);
  circles.exit()
    .transition()
    .duration(1000)
    .style('opacity', 1E-5).remove();

  circles
    .transition()
    .duration(1000)
    .attr('cx', function (d) {
      return timeScale(d[0]);
    })
    .attr('fill', function (d) {
      let factorName = (factorLevel[d[1]] === undefined) ? 'Spike' : factorLevel[d[1]];
      return colorScale(factorName);
    })
    .style('opacity', 1)
    .attr('r', circleRadius)
    .attr('cy', function (d) { return yScale(d[1]) + circleRadius; });
}
