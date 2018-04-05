let toolTip = d3.select('body').selectAll('div#tooltip').data([{}]);
toolTip.enter()
  .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 1e-6);

export default function (selection, data, timeScale, yScale, curEvent, width) {
  // Append invisible box for mouseover
  let mouseBox = selection.selectAll('rect.trialBox').data(data);

  mouseBox.exit()
    .remove();
  mouseBox.enter()
    .append('rect')
      .attr('class', 'trialBox');
  mouseBox
    .attr('x', function (d) {
      if (d.start_time !== null) {
        return timeScale(d.start_time - d[curEvent]);
      } else {
        return 0;
      }
    })
    .attr('y', function (d, i) { return yScale(i); })
    .attr('width', function (d) {
      if (d.start_time !== null) {
        return (timeScale(d.end_time - d[curEvent])) - (timeScale(d.start_time - d[curEvent]));
      } else {
        return width;
      }
    })
    .attr('height', yScale.rangeBand())
    .attr('opacity', '1e-9')
    .on('mouseover', mouseBoxOver)
    .on('mouseout', mouseBoxOut);
}

function mouseBoxOver(d) {
  // Pop up tooltip
  toolTip
    .style('opacity', 1)
    .style('left', (d3.event.pageX + 10) + 'px')
    .style('top', (d3.event.pageY + 10) + 'px')
    .html(function () {
      var table = '<b>Trial ' + d.trial_id + '</b><br>' + '<table>';
      var varName = '';
      for (varName in d) {
        var isValid = (varName != 'trial_id') & (varName != 'spikes')
          & (varName != 'sortInd');
        if (isValid) {
          table += '<tr><td>' + varName + ':' + '</td><td><b>' + d[varName]
          + '</b></td></tr>';
        }
      }

      table +=  '</table>';
      return table;
    });

  d3.select(this)
    .attr('stroke', 'black')
    .attr('fill', 'white')
    .attr('opacity', 1)
    .attr('fill-opacity', 1e-9);
}

function mouseBoxOut(d) {
  // Hide tooltip
  toolTip
    .style('opacity', 1e-9);
  d3.select(this)
    .attr('opacity', 1e-9);
}
