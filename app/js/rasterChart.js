import drawSpikes from './drawSpikes';
import drawTrialEvents from './drawTrialEvents';
import drawSmoothingLine from './drawSmoothingLine';
import drawMouseBox from './drawMouseBox';
import fixDimNames from './fixDimNames';
import eventMarkers from './eventMarkers';

export default function () {
  // Defaults
  let margin = { top: 50, right: 50, bottom: 50, left: 50 };
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
  let colorScale = d3.scale.ordinal().domain(['Spike']).range(['black']);

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

      // Initialize the chart, set up drawing layers
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
      enterG
        .append('g')
          .attr('class', 'timeAxis');
      enterG
        .append('g')
          .attr('class', 'yAxis');
      enterG
        .append('g')
          .attr('class', 'eventMarker');

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

      // Draw the chart
      let spikesG = svg.select('g.spikes');
      let trialEventsG = svg.select('g.trialEvents');
      let trialBoxG = svg.select('g.trialBox');
      let smoothLineG = svg.select('g.smoothLine');
      let eventMarkerG = svg.select('g.eventMarker');

      showSpikes ? drawSpikes(spikesG, data.values, timeScale, yScale, curEvent, interactionFactor, colorScale) : spikesG.selectAll('circle').remove();
      drawTrialEvents(trialEventsG, data.values, trialEvents, curEvent, timeScale, yScale);
      drawMouseBox(trialBoxG, data.values, timeScale, yScale, curEvent, innerWidth);
      let maxKDE = showSmoothingLines ? drawSmoothingLine(smoothLineG, data.values, timeScale, yScale, lineSmoothness, curEvent, interactionFactor, colorScale) : d3.selectAll('path.kdeLine').remove();
      eventMarkers(eventMarkerG, data.values, trialEvents, timeScale, curEvent, innerHeight);

      // Draw the time axis
      let timeAxisG = svg.select('g.timeAxis');
      let timeAxis = d3.svg.axis()
        .scale(timeScale)
        .orient('bottom')
        .ticks(7)
        .tickSize(0)
        .tickFormat(d3.format('4d'));
      timeAxisG
        .attr('transform', 'translate(0,' + innerHeight + ')')
        .call(timeAxis);

      // Draw smoothing axis if showing smoothing line
      let yAxisG = svg.select('g.yAxis');
      if (showSmoothingLines) {
        yAxisG.attr('display', '');
        let smoothScale = d3.scale.linear()
          .domain([0, maxKDE]) // assuming in milliseconds
          .range([innerHeight, 0]);
        let yAxis = d3.svg.axis()
          .scale(smoothScale)
          .orient('left')
          .tickValues([0, maxKDE])
          .tickSize(0);
        yAxisG.call(yAxis);
      } else {
        // hide axis
        yAxisG.attr('display', 'none');
      }

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

  chart.interactionFactor = function (value) {
    if (!arguments.length) return interactionFactor;
    interactionFactor = value;
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

  chart.colorScale = function (value) {
    if (!arguments.length) return colorScale;
    colorScale = value;
    return chart;
  };

  return chart;

}
