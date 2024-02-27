export default function (scale) {
  const CIRCLE_RADIUS = 7.5;
  let margin = { top: 10, right: 10, bottom: 10, left: 10 };
  let outerWidth = document.getElementById('legend').offsetWidth;
  let outerHeight = (scale.domain().length * CIRCLE_RADIUS * 3)
    + margin.top + margin.bottom + CIRCLE_RADIUS;
  let innerHeight = outerHeight - margin.top - margin.bottom;
  let innerWidth = outerWidth - margin.left - margin.right;
  let legendID = d3.select('#filterNav').select('#legend');
  let legend = d3.legend.color()
    .shape('circle')
    .shapeRadius(CIRCLE_RADIUS)
    .shapePadding(CIRCLE_RADIUS)
    .title('Legend')
    .scale(scale);
  let svg = legendID.selectAll('svg').data([{}]);
  svg.enter()
    .append('svg')
    .append('g');
  svg
    .attr('width', innerWidth + margin.left + margin.right)
    .attr('height', innerHeight + margin.top + margin.bottom);
  svg.select('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.select('g').call(legend);

}
