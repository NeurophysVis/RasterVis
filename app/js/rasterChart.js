import drawSpikes from './drawSpikes';

export default function () {
  // Defaults
  var margin = { top: 0, right: 0, bottom: 0, left: 0 };
  var outerWidth = 960;
  var outerHeight = 500;
  var timeDomain = [];
  var timeScale = d3.scale.linear();

  function chart(selection) {

    var innerWidth = outerWidth - margin.left - margin.right;

    selection.each(function (data) {
      var numTrials = data.values.length;
      outerHeight = numTrials + margin.top + margin.bottom;
      var innerHeight = outerHeight - margin.top - margin.bottom;
      var svg = d3.select(this).selectAll('svg').data([data], function (d) { return d.key; });

      // Initialize the chart
      var enterG = svg.enter()
        .append('svg')
          .append('g');
      enterG
        .append('g')
          .attr('class', 'trialEvents');
      enterG
        .append('g')
          .attr('class', 'spikes');
      enterG
        .append('g')
          .attr('class', 'smoothLine');

      // Update svg size, drawing area, and scales
      svg
        .attr('width', innerWidth + margin.left + margin.right)
        .attr('height', innerHeight + margin.top + margin.bottom);
      svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      timeScale
        .domain(timeDomain)
        .range([0, innerWidth]);

      drawSpikes(svg.select('g.spikes'), data.values.map(function (d) { return d.spikes; }), timeScale);

    });

  };

  chart.width = function (value) {
    if (!arguments.length) return outerWidth;
    outerWidth = value;
    return chart;
  };

  chart.timeDomain = function (value) {
    if (!arguments.length) return timeDomain;
    timeDomain = value;
    return chart;
  };

  return chart;

}
