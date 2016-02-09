export default function () {
  // Defaults
  var margin = { top: 0, right: 0, bottom: 0, left: 0 };
  var outerWidth = 960;
  var outerHeight = 500;
  function chart(selection) {

    var innerWidth = outerWidth - margin.left - margin.right;
    selection.each(function (data) {
      var numTrials = data.values.length;
      outerHeight = numTrials + margin.top + margin.bottom;
      var innerHeight = outerHeight - margin.top - margin.bottom;
      var svg = d3.select(this).selectAll('svg').data([data]);

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

    });

  };

}
