import drawSpikes from './drawSpikes';
import drawTrialEvents from './drawTrialEvents';
import drawSmoothingLine from './drawSmoothingLine';
import drawMouseBox from './drawMouseBox';
import fixDimNames from './fixDimNames';

export default function () {
  // Defaults
  var margin = { top: 20, right: 20, bottom: 20, left: 20 };
  var outerWidth = 960;
  var outerHeight = 500;
  var timeDomain = [];
  var timeScale = d3.scale.linear();
  var yScale = d3.scale.ordinal();
  var curEvent = '';
  var trialEvents = [];
  var lineSmoothness = 20;
  var interactionFactor = '';
  var curFactor = '';

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
        .append('rect')
          .attr('width', innerWidth)
          .attr('height', innerHeight)
          .attr('opacity', 0.1)
          .attr('fill', '#aaa');
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

      // Fix title names
      var s = data.key.split('_');
      if (s[0] === 'undefined') {
        s[0] = '';
      } else {
        s[0] = ': ' + s[0];
      };

      var title = enterG
        .append('text')
        .attr('class', 'title')
        .attr('font-size', 16)
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', -8);
      svg.select('text.title')
        .text(fixDimNames(curFactor) + s[0]);

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

  chart.curFactor = function (value) {
    if (!arguments.length) return curFactor;
    curFactor = value;
    return chart;
  };

  chart.trialEvents = function (value) {
    if (!arguments.length) return trialEvents;
    trialEvents = value;
    return chart;
  };

  chart.lineSmoothness = function (value) {
    if (!arguments.length) return lineSmoothness;
    lineSmoothness = value;
    return chart;
  };

  return chart;

}
