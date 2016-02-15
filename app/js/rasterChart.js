import drawSpikes from './drawSpikes';
import drawTrialEvents from './drawTrialEvents';
import drawSmoothingLine from './drawSmoothingLine';
import drawMouseBox from './drawMouseBox';
import fixDimNames from './fixDimNames';

export default function () {
  // Defaults
  let margin = { top: 20, right: 20, bottom: 20, left: 20 };
  let outerWidth = 960;
  let outerHeight = 500;
  let timeDomain = [];
  let timeScale = d3.scale.linear();
  let yScale = d3.scale.ordinal();
  let curEvent = '';
  let trialEvents = [];
  let lineSmoothness = 20;
  let interactionFactor = '';
  let curFactor = '';
  let showSpikes = true;
  let showSmoothingLines = true;
  let innerHeight;
  let innerWidth;

  function chart(selection) {
    selection.each(function (data) {

      // Allow height and width to be determined by data
      if (typeof outerHeight === 'function') {
        innerHeight = outerHeight(data) - margin.top - margin.bottom;
      } else {
        innerHeight = outerHeight - margin.top - margin.bottom;
      };

      if (typeof outerWidth === 'function') {
        innerWidth = outerWidth(data) - margin.left - margin.right;
      } else {
        innerWidth = outerWidth - margin.left - margin.right;
      }

      let svg = d3.select(this).selectAll('svg').data([data], function (d) { return d.key; });

      // Initialize the chart
      let enterG = svg.enter()
        .append('svg')
          .append('g');
      enterG
        .append('rect')
          .attr('class', 'backgroundLayer');
      svg.select('rect.backgroundLayer')
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
          .attr('class', 'trialBox');

      // Fix title names
      let s = data.key.split('_');
      if (s[0] === 'undefined') {
        s[0] = '';
      } else {
        s[0] = ': ' + s[0];
      };

      let title = enterG
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
        .domain(d3.range(0, data.values.length))
        .rangeBands([innerHeight, 0]);

      showSpikes ? drawSpikes(svg.select('g.spikes'), data.values, timeScale, yScale, curEvent) : svg.select('g.spikes').selectAll('circle').remove();
      drawTrialEvents(svg.select('g.trialEvents'), data.values, trialEvents, curEvent, timeScale, yScale);
      drawMouseBox(svg.select('g.trialBox'), data.values, timeScale, yScale, curEvent, innerWidth);
      showSmoothingLines ? drawSmoothingLine(svg.select('g.smoothLine'), data.values, timeScale, yScale, lineSmoothness, curEvent, interactionFactor) : svg.select('g.smoothLine').selectAll('path.kdeLine').remove();

    });

  };

  chart.width = function (value) {
    if (!arguments.length) return outerWidth;
    outerWidth = value;
    return chart;
  };

  chart.height = function (value) {
    if (!arguments.length) return outerHeight;
    outerHeight = value;
    return chart;
  };

  chart.margin = function (value) {
    if (!arguments.length) return margin;
    margin = value;
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

  chart.showSmoothingLines = function (value) {
    if (!arguments.length) return showSmoothingLines;
    showSmoothingLines = value;
    return chart;
  };

  chart.showSpikes = function (value) {
    if (!arguments.length) return showSpikes;
    showSpikes = value;
    return chart;
  };

  return chart;

}
