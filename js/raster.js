(function() {
  ruleRaster = {};
  var width, height,
		chart, svg,
		defs, style;
  ruleRaster.init = function(params) {
    if (!params) {params = {};}

    chart = d3.select(params.chart || '#chart'); // placeholder div for svg
    margin = {top: 50, right: 10, bottom: 40, left: 300};
    padding = {top: 40, right: 40, bottom: 40, left: 40};
    var outerWidth = document.getElementById('chart').offsetWidth,
			outerHeight = params.height || 500,
			innerWidth = outerWidth - margin.left - margin.right,
			innerHeight = outerHeight - margin.top - margin.bottom;
    width = innerWidth - padding.left - padding.right;
    height = innerHeight - padding.top - padding.bottom;
    chart = chart.selectAll('svg')
      .data([{width: width + margin.left + margin.right, height: height + margin.top + margin.bottom}]);
    chart.enter()
     .append('svg');
    chart.exit()
         .remove();
    svg = chart.attr({
      width: function(d) {return d.width + margin.left + margin.right;},

      height: function(d) {return d.height + margin.top + margin.bottom;}
    })
			.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // ruleRaster.init can be re-ran to pass different height/width values
    // to the svg. this doesn't create new svg elements.
    style = svg.selectAll('style').data([{}]).enter()
			.append('style')
        .attr('type', 'text/css');

    // this is where we can insert style that will affect the svg directly.
    defs = svg.selectAll('defs').data([{}]).enter()
			.append('defs');

    // Load Data
    ruleRaster.loadData(params);
  };

  ruleRaster.loadData = function(params) {
    if (!params) {params = {};}

    d3.text(params.style || 'style.txt', function(error, txt) {

      d3.json('DATA/trialInfo.json', function(error, trialInfo) {
        style.text(txt); // but if found, it can be embedded in the svg.

        // Create the monkey menu
        var subjectNames = trialInfo.monkey.map(function(m) {return m.name;});
        var subjectMenu = d3.select('#subjectMenu').select('select');
        var subjectOptions = subjectMenu.selectAll('option').data(subjectNames, String);
        subjectOptions.enter()
          .append('option')
          .attr('value', String)
          .text(String);
        subjectOptions.exit()
         .remove();
        params.curSubject = params.curSubject || subjectNames[0];
        subjectOptions.filter(function(monkeyName) {return monkeyName === params.curSubject;})
          .attr('selected', 'selected');

        // Create recording session menu
        var sessionNames = trialInfo.monkey
          .filter(function(m) {return m.name === params.curSubject;})
          .map(function(d) {return d.sessionNames;})[0]
          .map(function(n) {return n.name;});
        var sessionMenu = d3.select('#sessionMenu').select('select');
        var sessionOptions = sessionMenu.selectAll('option').data(sessionNames, String);
        sessionOptions.enter()
          .append('option')
          .attr('value', String)
          .text(String);
        sessionOptions.exit()
         .remove();
        params.curSession = params.curSession || sessionNames[0];
        sessionOptions.filter(function(sessionName) {return sessionName === params.curSession;})
          .attr('selected', 'selected');

        // Create neuron menu
        var neuronNames = trialInfo.monkey
          .filter(function(m) {return m.name === params.curSubject;})
          .map(function(d) {return d.sessionNames;})[0]
          .filter(function(s) {return s.name === params.curSession;})[0]
          .neurons;
        var neuronMenu = d3.select('#neuronMenu').select('select');
        var neuronOptions = neuronMenu.selectAll('option').data(neuronNames, String);
        neuronOptions.enter()
          .append('option')
          .attr('value', String)
          .text(String);
        neuronOptions.exit()
          .remove();
        params.curNeuron = params.curNeuron || neuronNames[0];
        neuronOptions.filter(function(neuronName) {return neuronName === params.curNeuron;})
          .attr('selected', 'selected');

        // Create experimental factor menu
        var factorObjects = trialInfo.experimentalFactor;
        var factorMenu = d3.select('#factorSortMenu').select('select');
        var factorOptions = factorMenu.selectAll('option').data(factorObjects, function(f) {return f.name;});
        factorOptions.enter()
          .append('option')
          .attr('value', function(t) {return t.value;})
          .text(function(t) {return t.name;});
        factorOptions.exit()
          .remove();
        params.curFactor = params.curFactor || factorObjects[0].value;
        factorOptions.filter(function(factorObject) {return factorObject.value === params.curFactor;})
          .attr('selected', 'selected');

        // Create time period menu
        var timeObjects = trialInfo.timePeriods;
        var timeMenu = d3.select('#timeMenu').select('select');
        var timeOptions = timeMenu.selectAll('option').data(timeObjects, function(f) {return f.name;});
        timeOptions.enter()
          .append('option')
          .attr('value', function(t) {return t.value;})
          .text(function(t) {return t.name;});
        timeOptions.exit()
          .remove();
        params.curTime = params.curTime || timeObjects[0].value;
        timeOptions.filter(function(timeObject) {return timeObject.value === params.curTime;})
          .attr('selected', 'selected');

        queue()
          .defer(d3.json, 'DATA/' + params.curSession + '_TrialInfo.json')
          .defer(d3.json, 'DATA/Neuron_' + params.curNeuron + '.json')
          .await(function(errorObject, trials, neuron) {
            // Resize height so that spikes are large enough to see
            var numTrials = neuron.Number_of_Trials;
            height = 4 * numTrials;
            chart.attr('height', height + margin.top + margin.bottom);
            ruleRaster.data = _.merge(trials, neuron.Spikes);

            // Draw visualization
            ruleRaster.draw(params);
          });

      });
    });
  };

  ruleRaster.draw = function(params) {
    // Tool Tip - make a hidden div to appear as a tooltip when mousing over a line
    toolTip = d3.select('body').selectAll('div#tooltip').data([{}]);
    toolTip.enter()
      .append('div')
        .attr('id', 'tooltip')
        .style('opacity', 1e-6);

    window.history.pushState({}, '', '/RasterVis/index.html?curSubject=' + params.curSubject +
                                                          '&curSession=' + params.curSession +
                                                          '&curNeuron=' + params.curNeuron +
                                                          '&curTime=' + params.curTime +
                                                          '&curFactor=' + params.curFactor);

    // Nest and Sort Data
    if (params.curFactor != 'trial_id') {
      var factor = d3.nest()
          .key(function(d) {return d[params.curFactor];}) // nests data by selected factor
              .sortValues(function(a, b) { // sorts values based on Rule
                return d3.ascending(a.Rule, b.Rule);
              })
          .entries(ruleRaster.data);
    } else {
      var factor = d3.nest()
          .key(function(d) {return d[''];}) // nests data by selected factor
            .sortValues(function(a, b) { // sorts values based on trial
              return d3.ascending(a.trial_id, b.trial_id);
            })
          .entries(ruleRaster.data);
    }

    // Compute variables for placing plots (plots maintain constant size for each trial)
    var PLOT_BUFFER = 0;
    var factorLength = factor.map(function(d) {return d.values.length;});

    var factorRangeBand = factorLength.map(function(d) {return (height + (factorLength.length * -PLOT_BUFFER)) * (d / d3.sum(factorLength))});

    var factorPoints = [0];
    factorRangeBand.forEach(function(d, i) {
      factorPoints[i + 1] = factorPoints[i] + d + PLOT_BUFFER;
    });

    factorPoints = factorPoints.slice(0, factorPoints.length - 1);

    // Create a group element for each rule so that we can have two plots, translate plots so that they don't overlap
    var plotG = svg.selectAll('g.plotG')
      .data(factor, function(d) {return d.key;});

    plotG.exit()
          .remove();
    plotG.enter()
      .append('g')
        .attr('class', 'plotG')
        .attr('id', function(d) {return d.key;});

    plotG.attr('transform', function(d, i) {
          return 'translate(0,' + factorPoints[i] + ')';
        });

    // Append a y-scale to each plot so that the scale is adaptive to the range of each plot
    plotG
     .each(function(d, i) {
       d.yScale = d3.scale.ordinal()
         .domain(d3.range(d.values.length))
         .rangeBands([0, factorRangeBand[i]]);
     });

    // Set up x-scale, colorScale to be the same for both plots
    var	minTime = d3.min(ruleRaster.data, function(d) {
      return d.start_time - d[params.curTime];
    });

    var maxTime = d3.max(ruleRaster.data, function(d) {
      return d.end_time - d[params.curTime];
    });

    var xScale = d3.scale.linear()
      .domain([minTime - 10, maxTime + 10])
			.range([0, width]);

    var	colorScale;
    if (params.color != 'Neutral') {
      colorScale = d3.scale.ordinal()
        .domain(['Color', 'Orientation'])
        .range(['#ef8a62', '#67a9cf']);
    } else {
      colorScale = d3.scale.ordinal()
        .domain(['Color', 'Orientation'])
        .range(['black', 'black']);
    }

    // Draw spikes, event timePeriods, axes
    plotG.each(drawSpikes);
    appendAxis();

    // Listen for changes on the drop-down menu
    var subjectMenu = d3.select('#subjectMenu select');
    subjectMenu.on('change', function() {
      svg.selectAll('.eventLine').remove();
      params.curSubject = d3.selectAll('#subjectMenu select').property('value');
      params.curSession = undefined;
      params.curNeuron = undefined;
      ruleRaster.loadData(params);
    });
    var sessionMenu = d3.select('#sessionMenu select');
    sessionMenu.on('change', function() {
      svg.selectAll('.eventLine').remove();
      params.curSession = d3.selectAll('#sessionMenu select').property('value');
      params.curNeuron = undefined;
      ruleRaster.loadData(params);
    });
    var neuronMenu = d3.select('#neuronMenu select');
    neuronMenu.on('change', function() {
      params.curNeuron = d3.selectAll('#neuronMenu select').property('value');
      ruleRaster.loadData(params);
    });
    var factorMenu = d3.select('#factorSortMenu select');
    factorMenu.on('change', function() {
      svg.selectAll('.eventLine').remove();
      params.curFactor = d3.selectAll('#factorSortMenu select').property('value');
      ruleRaster.draw(params);
    });
    var timeMenu = d3.select('#timeMenu select');
    timeMenu.on('change', function() {
      params.curTime = d3.selectAll('#timeMenu select').property('value');
      ruleRaster.draw(params);
    });

    // ******************** Axis Function *******************
    function appendAxis() {
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('top')
        .ticks(10)
        .tickSize(0)
        .tickFormat(d3.format('4d'));

      // Append the x-axis
      var xAxisG = svg.selectAll('g.xAxis').data([{}]);
      xAxisG.enter()
        .append('g')
          .attr('class', 'xAxis');
      xAxisG
        .transition()
          .duration(10)
          .ease('linear')
          .call(xAxis);
    }

    // ******************** Helper Functions **********************

    // ******************** Draw Spikes Function ******************
    function drawSpikes(data, ind) {
      if (data.key === 'null') {
        return;
      }

      var curPlot = d3.select(this);
      var backgroundLayer = curPlot.selectAll('g.backgroundLayer').data([{}]);
      backgroundLayer.enter()
        .append('g')
          .attr('class', 'backgroundLayer');
      var trialLayer = curPlot.selectAll('g.trialLayer').data([{}]);
      trialLayer.enter()
        .append('g')
          .attr('class', 'trialLayer');
      var curPlotRect = backgroundLayer.selectAll('rect.background').data([{}]);
      curPlotRect.enter()
        .append('rect')
          .attr('class', 'background');
      curPlotRect
        .attr('x', -10)
        .attr('y', 0)
        .attr('width', width + 10)
        .attr('height', factorRangeBand[ind]);
      drawEventLines(data, ind);

      // Join the trial data to svg containers ('g')
      var	trialG = trialLayer.selectAll('.trial').data(data.values, function(d) {return d.trial_id + '_' + params.curFile;});

      // Remove trials that don't have matched data
      trialG.exit()
        .remove();

      // For each new data, append an svg container and set css class to trial
      // for each group, translate its location to its index location in the trial object
      trialG.enter()
        .append('g')
          .attr('class', 'trial')
          .attr('transform', function(d, i) {
            return 'translate(0,' + data.yScale(i) + ')';
          });

      trialG
        .style('fill', function(d) {
          return colorScale(d.Rule);
        })
        .attr('transform', function(d, i) {
          return 'translate(0,' + data.yScale(i) + ')';
        });

      // For each new spike time, append circles that correspond to the spike times
      // Set the x-position of the circles to their spike time and the y-position to the size of the ordinal scale range band
      // that way the translate can move them to their appropriate position relative to the same coordinate system
      var spikes = trialG.selectAll('circle.spikes').data(function(d) {return d.spikes;});

      spikes.exit()
        .transition()
          .duration(1000)
          .style('opacity', 1E-5)
        .remove();
      spikes.enter()
        .append('circle')
          .attr('class', 'spikes')
          .style('opacity', 1E-5);
      spikes
        .transition()
          .duration(1000)
          .attr('cx', function(d) {
            return xScale(d - (this.parentNode.__data__[params.curTime]));
          })
          .style('opacity', 1)
          .attr('r', data.yScale.rangeBand() / 2)
          .attr('cy', data.yScale.rangeBand() / 2);

      // Append invisible box for mouseover
      var mouseBox = trialG.selectAll('rect.trialBox').data(function(d) {return [d];});

      mouseBox.exit()
        .remove();
      mouseBox.enter()
        .append('rect')
          .attr('class', 'trialBox');
      mouseBox
        .attr('x', function(d) {
          if (d.start_time != null) {
            return xScale(d.start_time - d[params.curTime]);
          } else {return 0;}
        })
        .attr('y', 0)
        .attr('width', function(d) {
          if (d.start_time != null) {
            return (xScale(d.end_time - d[params.curTime])) - (xScale(d.start_time - d[params.curTime]));
          } else {return width;}
        })
        .attr('height', data.yScale.rangeBand())
        .attr('opacity', '1e-9')
        .on('mouseover', mouseBoxOver)
        .on('mouseout', mouseBoxOut);

      // Y axis labels
      var yAxisG = curPlot.selectAll('g.yAxis').data([data.key]);
      yAxisG.enter()
        .append('g')
          .attr('class', 'yAxis')
          .attr('transform', 'translate(-10,0)');
      yAxisG.exit()
        .remove();
      var yAxis = d3.svg.axis()
        .scale(data.yScale)
        .orient('left')
        .tickValues(data.yScale.domain().filter(function(d, i) {
          return false;
        }))
        .tickSize(-10);
      yAxisG
        .call(yAxis);
      var yAxisLabel = yAxisG.selectAll('text.yLabel').data([params.curFactor + ': ' + data.key]);
      yAxisLabel.enter()
        .append('text')
          .attr('class', 'yLabel')
          .attr('text-anchor', 'end');
      switch (params.curFactor) {
        case 'trial_id':
          yAxisLabel
            .attr('x', 0)
            .attr('y', -3)
            .attr('transform', 'rotate(-90)')
            .text('← Trials ')
          break;
        case 'Reaction_Time':
        case 'Preparation_Time':
          yAxisLabel
            .attr('x', 0)
            .attr('dx', -0.4 + 'em')
            .attr('transform', 'rotate(0)')
            .attr('y', factorRangeBand[ind] / 2)
            .attr('text-anchor', 'end')
            .text(function() {
              if (+data.key % 10 == 0) {
                return fixDimNames(params.curFactor) + ': ' + data.key + ' ms';
              } else {return '';}
            });

          break;
        default:
          yAxisLabel
            .attr('x', 0)
            .attr('dx', -0.4 + 'em')
            .attr('transform', 'rotate(0)')
            .attr('y', 0)
            .attr('y', 1 + 'em')
            .attr('text-anchor', 'end')
            .text(function(d) {return fixDimNames(d);})

          break;
      }
      function mouseBoxOver(d) {
        // Pop up tooltip
        toolTip
          .style('opacity', 1)
          .style('left', (d3.event.pageX + 10) + 'px')
          .style('top', (d3.event.pageY + 10) + 'px')
          .html(function() {
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

        var curMouseBox = d3.select(this);
        curMouseBox
          .attr('stroke', 'black')
          .attr('fill', 'white')
          .attr('opacity', 1)
          .attr('fill-opacity', 1e-9);
      }

      function mouseBoxOut(d) {
        // Hide tooltip
        toolTip
          .style('opacity', 1e-9);
        var curMouseBox = d3.select(this);
        curMouseBox
          .attr('opacity', 1e-9);
      }

      // ******************** Event Line Function *******************
      function drawEventLines(data, ind) {
        var timePeriods = [
          {label: '<br>ITI', id1: 'start_time', id2: 'fixation_onset', color: '#c5b0d5'},
          {label: '<br>Fix.', id1: 'fixation_onset', id2: 'rule_onset', color: '#f7b6d2'},
          {label: '<br>Rule', id1: 'rule_onset', id2: 'stim_onset', color: '#98df8a'},
          {label: 'Test<br>Stimulus', id1: 'stim_onset', id2: 'react_time', color:  '#ff9896'},
          {label: '<br>Saccade', id1: 'react_time', id2: 'reward_time', color: '#9edae5'},
          {label: '<br>Reward', id1: 'reward_time', id2: 'end_time', color:  '#c49c94'}
        ];
        var eventLine = backgroundLayer.selectAll('path.eventLine').data(timePeriods, function(d) {return d.label;});

        eventLine.exit()
          .remove();

        // Append mean times for label position
        timePeriods = timePeriods.map(function(d) {
          // if timePeriod value is null, find the next non-null trialß
          var dataInd = 0;
          while (data.values[dataInd][d.id1] == null) {
            dataInd++;
          }

          return {
            label: d.label,
            id1: d.id1,
            id2: d.id2,
            labelPosition: data.values[dataInd][d.id1] - data.values[dataInd][params.curTime],
            color: d.color
          };
        });

        var valuesInd = d3.range(data.values.length);
        var newValues = data.values.concat(data.values);
        valuesInd = valuesInd.concat(valuesInd);
        newValues = newValues.map(function(d, i) {
          d.sortInd = valuesInd[i];
          return d;
        });

        newValues.sort(function(a, b) {
          return d3.ascending(a.sortInd, b.sortInd);
        });

        // Plot timePeriods corresponding to trial events
        eventLine.enter()
          .append('path')
            .attr('class', 'eventLine')
            .attr('id', function(d) {return d.label;})
            .attr('opacity', 1E-6)
            .attr('fill', function(d) {return d.color;});

        eventLine
          .transition()
            .duration(1000)
            .ease('linear')
            .attr('opacity', 0.90)
            .attr('d', function(timePeriod) {
              return AreaFun(newValues, timePeriod);
            });

        // Add labels corresponding to trial events
        var eventLabel = svg.selectAll('.eventLabel').data(timePeriods, function(d) {return d.label;});

        if (ind == 0) {
          eventLabel.enter()
            .append('foreignObject')
              .attr('class', 'eventLabel')
              .attr('id', function(d) {return d.label;})
              .attr('y', -50)
              .attr('width', 45)
              .attr('height', 33)
              .style('color', function(d) {return d.color;})
              .html(function(d) {return '<div>' + d.label + '<br>▼</div>'; });

          eventLabel
            .attr('x', function(d) {
              return (xScale(d.labelPosition) - 22.5) + 'px';
            });
        }

        function AreaFun(values, timePeriod) {
          // Setup helper line function
          var area = d3.svg.area()
            .defined(function(d) {
              return d[timePeriod.id1] != null && d[timePeriod.id2] != null && d[params.curTime] != null;
            }) // if null, suppress line drawing
            .x0(function(d) {
              return xScale(d[timePeriod.id1] - d[params.curTime]);
            })
            .x1(function(d) {
              return xScale(d[timePeriod.id2] - d[params.curTime]);
            })
            .y(function(d, i) {
              if (i % 2 == 0) {
                return data.yScale(d.sortInd);
              } else {
                return data.yScale(d.sortInd) + data.yScale.rangeBand();
              }
            })
            .interpolate('linear');
          return area(values);
        }
      }
    }

  // Replaces underscores with blanks and 'plus' with '+'
  function fixDimNames(dimName) {
    var pat1 = /plus/;
    var pat2 = /_/g;
    var pat3 = /minus/;
    var fixedName = dimName.replace(pat1, '+').replace(pat2, ' ').replace(pat3, '-');
    return fixedName;
  }
  }
})();
