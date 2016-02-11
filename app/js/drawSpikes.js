
export default function (selection, data, timeScale, yScale) {

  var circleRadius = yScale.rangeBand() / 2;

  // Reshape to spike time, trial position
  data = data.map(function (trial, ind) {
    return trial.map(function (spike) {
      return [spike, ind];
    });
  });

  // Flatten
  data = [].concat.apply([], data);

  var circles = selection.selectAll('circle').data(data);
  circles.enter()
    .append('circle');
  circles.exit().remove();

  circles
    .attr('cx', function (d) {
      return timeScale(d[0]);
    })
    .style('opacity', 1)
    .attr('r', circleRadius)
    .attr('cy', function (d) { return yScale(d[1]) + circleRadius; });
}
