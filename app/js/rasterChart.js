import drawSpikes from './drawSpikes';
import drawTrialEvents from './drawTrialEvents';
import drawSmoothingLine from './drawSmoothingLine';
import drawMouseBox from './drawMouseBox';

export default function () {
  // Defaults
  var margin = { top: 0, right: 0, bottom: 0, left: 0 };
  var outerWidth = 960;
  var outerHeight = 500;
  var timeDomain = [];
  var timeScale = d3.scale.linear();
  var yScale = d3.scale.ordinal();
  var curEvent = '';
  var trialEvents = [];
  var lineSmoothness = 20;
  var interactionFactor = '';

  function chart(selection) {

    var innerWidth = outerWidth - margin.left - margin.right;

    selection.each(function (data) {
      var numTrials = data.values.length;
      outerHeight = (numTrials * 4) + margin.top + margin.bottom;
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
      enterG
        .append('g')
          .attr('class', 'invisibleBox');

      // Update svg size, drawing area, and scales
      svg
        .attr('width', innerWidth + margin.left + margin.right)
        .attr('height', innerHeight + margin.top + margin.bottom);
      svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      timeScale
        .domain(timeDomain)
        .range([0, innerWidth]);
      yScale
        .domain(d3.range(0, numTrials))
        .rangeBands([innerHeight, 0]);

      drawSpikes(svg.select('g.spikes'), data.values, timeScale, yScale, curEvent);
      drawTrialEvents(svg.select('g.trialEvents'), data.values, trialEvents, curEvent, timeScale, yScale);
      drawMouseBox(svg.select('g.invisibleBox'), data.values, timeScale, yScale, curEvent, innerWidth);
      drawSmoothingLine(svg.select('g.smoothLine'), data.values, timeScale, yScale, lineSmoothness, curEvent, interactionFactor);

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

  chart.curEvent = function (value) {
    if (!arguments.length) return curEvent;
    curEvent = value;
    return chart;
  };

  chart.curEvent = function (value) {
    if (!arguments.length) return curEvent;
    curEvent = value;
    return chart;
  };

  chart.trialEvents = function (value) {
    if (!arguments.length) return trialEvents;
    trialEvents = value;
    return chart;
  };

  return chart;

}
