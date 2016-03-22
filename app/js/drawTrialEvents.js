/* Draws each trial event (e.g. saccade, cue period, reward) from the beginning to
  end (e.g. saccade start, saccade finish) as an area. */

export default function (selection, sessionInfo, trialEvents, curEvent, timeScale, yScale) {

  let eventArea = selection.selectAll('path.eventArea').data(trialEvents, function (d) {return d.label;});

  /* Reformat data for area chart. Duplicate data twice in order to draw
  straight vertical edges at the beginning and end of trials */
  let dupData = duplicateData(sessionInfo);

  // Plot area corresponding to trial events
  eventArea.enter()
    .append('path')
      .attr('class', 'eventArea')
      .attr('id', function (d) {return d.label;})
      .attr('opacity', 1E-6)
      .attr('fill', function (d) {return d.color;});

  eventArea.exit().remove();

  eventArea
    .transition()
      .duration(1000)
      .ease('linear')
      .attr('opacity', 0.90)
      .attr('d', function (t) {
        return AreaFun(dupData, t, timeScale, yScale, curEvent);
      });
}

function AreaFun(values, trialEvents, timeScale, yScale, curEvent) {
  // Setup helper line function
  let area = d3.svg.area()
    .defined(function (d) {
      return d[trialEvents.startID] != null && d[trialEvents.endID] != null && d[curEvent] != null;
    }) // if null, suppress line drawing
    .x0(function (d) {
      return timeScale(d[trialEvents.startID] - d[curEvent]);
    })
    .x1(function (d) {
      return timeScale(d[trialEvents.endID] - d[curEvent]);
    })
    .y(function (d, i) {
      // Draws straight line down for each trial on the corners.
      if (i % 2 == 0) { // Alternate top and bottom
        return yScale(d.sortInd); // Top of the trial
      } else {
        return yScale(d.sortInd) + yScale.rangeBand(); // bottom of the trial
      }
    })
    .interpolate('linear');
  return area(values);
}

function duplicateData(data) {
  // Duplicate data so that it appears twice aka 11223344
  let valuesInd = d3.range(data.length);
  let newValues = data.concat(data);
  valuesInd = valuesInd.concat(valuesInd);
  newValues.forEach(function (d, i) {
    d.sortInd = valuesInd[i];
  });

  newValues.sort(function (a, b) {
    return d3.descending(a.sortInd, b.sortInd);
  });

  return newValues;
}
