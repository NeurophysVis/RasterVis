const CIRCLE_RADIUS = 0.5;

export default function (selection, data, timeScale) {

  // Reshape to spike time, trial position
  data = data.map(function (trial, ind) {
    return trial.map(function (spike) {
      return [spike, ind];
    });
  });

  // Flattern
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
    .attr('r', CIRCLE_RADIUS)
    .attr('cy', function (d) { return d[1] + CIRCLE_RADIUS; });
}
