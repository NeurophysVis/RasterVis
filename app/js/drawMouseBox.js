var toolTip = d3.select('body').selectAll('div#tooltip').data([{}]);
toolTip.enter()
  .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 1e-6);

export default function (selection, data, timeScale, yScale, curEvent, width) {
  // Append invisible box for mouseover
  var mouseBox = selection.selectAll('rect.trialBox').data(data);

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
      return '<b>Trial ' + d.trial_id + '</b><br>' +
             '<table>' +
             '<tr><td>' + 'Rule:' + '</td><td><b>' + d.Rule + '</b></td></tr>' +
             '<tr><td>' + 'Rule Repetition:' + '</td><td><b>' + d.Rule_Repetition + '</b></td></tr>' +
             '<tr><td>' + 'Preparation Time:' + '</td><td><b>' + d.Preparation_Time + ' ms' + '</b></td></tr>' +
             '<tr><td>' + 'Congruency:' + '</td><td><b>' + d.Current_Congruency + '</b></td></tr>' +
             '<tr><td>' + 'Response Direction:' + '</td><td><b>' + d.Response_Direction + '</b></td></tr>' +
             '<tr><td>' + 'Reaction Time:' + '</td><td><b>' + d.Reaction_Time + ' ms' + '</b></td></tr>' +
             '<hr>' +
             '<tr><td>' + 'Correct?:' + '</td><td><b>' + d.isCorrect + '</b></td></tr>' +
             '<tr><td>' + 'Fixation Break?:' + '</td><td><b>' + d.Fixation_Break + '</b></td></tr>' +
             '<tr><td>' + 'Error on previous trial?:' + '</td><td><b>' + d.Previous_Error + '</b></td></tr>' +
             '<tr><td>' + 'Included in Analysis?:' + '</td><td><b>' + d.isIncluded + '</b></td></tr>' +
             '</table>';
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
