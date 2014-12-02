(function () {
    ruleRaster = {};
	var width, height,
		chart, svg,
		defs, style;
	ruleRaster.init = function (params) {
		if (!params) {params = {}; }
		chart = d3.select(params.chart || "#chart"); // placeholder div for svg
		var margin = {top: 30, right: 30, bottom: 30, left: 30};
		var padding = {top: 60, right: 60, bottom: 60, left: 60};
		var outerWidth = params.width || 960,
			outerHeight = params.height || 500,
			innerWidth = outerWidth - margin.left - margin.right,
			innerHeight = outerHeight - margin.top - margin.bottom;
		width = innerWidth - padding.left - padding.right;
		height = innerHeight - padding.top - padding.bottom;
		chart.selectAll("svg")
			.data([{width: width + margin.left + margin.right, height: height + margin.top + margin.bottom}])
			.enter()
			.append("svg");
		svg = d3.select("svg").attr({
			width: function (d) {return d.width + margin.left + margin.right; },
			height: function (d) {return d.height + margin.top + margin.bottom; }
		})
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		// ruleRaster.init can be re-ran to pass different height/width values
		// to the svg. this doesn't create new svg elements.
		style = svg.selectAll("style").data([{}]).enter()
			.append("style")
			.attr("type", "text/css");
		// this is where we can insert style that will affect the svg directly.
		defs = svg.selectAll("defs").data([{}]).enter()
			.append("defs");
		// Create neuron file menu
		var fileNames = ["cc1", "isa9"];
		var fileMenu = d3.selectAll("#fileMenu")
			.append("select")
			.attr("name", "file-list");
		var options = fileMenu.selectAll("option")
			.data(fileNames)
			.enter()
			.append("option");
		fileMenu.select("option")
						.attr("selected", "selected");
		options.text(String)
				.attr("value", String);
		// Load Data
		ruleRaster.loadData(params);
	};
	ruleRaster.loadData = function (params) {
		if (!params) {params = {}; }
		d3.text(params.style || "style.txt", function (error, txt) {
			// note that execution won't be stopped if a style file isn't found
			style.text(txt); // but if found, it can be embedded in the svg.
			// ("#" + Math.random()) makes sure the script loads the file each time instead of using a cached version, remove once live
			var curFileName = "DATA/" + params.data  + ".json" + "#" + Math.random();
			d3.json(curFileName, function (error, json) {

        // Downsample if too many trials
        if (json[params.data].neurons[0].Number_of_Trials > 2000) {
          json[params.data].trials = json[params.data].trials.filter(function(d) {
            return Math.random() > 0.7;
          })
        };

				ruleRaster.data = json;
				// populate drop-down menu with neuron names
				var neuronMenu = d3.select("#neuronMenu");
				neuronMenu.selectAll("select.main")
						.data([{}])
						.enter()
						      .append("select")
						            .attr("name", "neuron-list")
						            .classed("main", 1);
				var	neuron = ruleRaster.data[params.data].neurons,
					options = neuronMenu.select("select").selectAll("option")
						.data(neuron, function(d) {return d.Name;});
				options.enter()
					.append("option")
					     .text(function (d) { return d.Name; })
					     .attr("value", function (d) { return d.Name; });
				options.exit().remove();
				neuronMenu // add option to select neuron based on parameters from the browser
						.select("select")
						.select("option")
						.attr("selected", "selected");

				// Draw visualization

				ruleRaster.draw(params);
			});
		});
	};
	ruleRaster.draw = function (params) {
		var PLOT_BUFFER = 60; // Defines separation between plots
		// Extract relevant trial and neuron information
		var neuronMenu = d3.select("#neuronMenu select"),
			curNeuronName = neuronMenu.property("value"),
			timeMenu = d3.select("#timeMenu select"),
			timeMenuValue = timeMenu.property("value"),
      fileMenu = d3.selectAll("#fileMenu"),
			factorSortMenu = d3.select("#factorSortMenu select"),
			factorSortMenuValue = factorSortMenu.property("value"),
			neuron = ruleRaster.data[params.data].neurons
                .filter(function (d) {
                    return d.Name === curNeuronName;
            });
		// Nest and Sort Data
		var trial = d3.nest()
				.key(function(d) {return d.Rule;}) // nests data by Rule
      			.sortValues(function (a, b) { // sorts data based on selected option
					         return d3.ascending(a[factorSortMenuValue], b[factorSortMenuValue]);
				})
      			.entries(ruleRaster.data[params.data].trials),
      	// Create a group element for each rule so that we can have two plots, translate plots so that they don't overlap
			plotG = svg.selectAll("g.plotG").data(trial, function(d) {return d.key;});
			plotG.enter()
  				.append("g")
  				.attr("transform", function(d,i) {
                      return "translate(0," + ((height/2) + PLOT_BUFFER)*i + ")";
                })
  				.attr("class", "plotG");
        // Append a y-scale to each plot so that the scale is adaptive to the range of each plot
  		plotG
  			.each(function(d) {
  				d.yScale = d3.scale.ordinal()
					.domain(d3.range(d.values.length))
					.rangeBands([0, (height - PLOT_BUFFER)/2]);
  			});

		// Set up x-scale, colorScale to be the same for both plots
		var	minTime = d3.min(ruleRaster.data[params.data].trials, function (d) {
				return d3.min(d[curNeuronName], function (e) { return d3.min(e); })  - d[timeMenuValue];
			}),
			maxTime = d3.max(ruleRaster.data[params.data].trials, function (d) {
				return d3.max(d[curNeuronName], function (e) { return d3.max(e); }) - d[timeMenuValue];
			}),
			xScale = d3.scale.linear()
					.domain([minTime, maxTime])
					.range([0, width]);
		var	colorScale = colorPicker();

        // Draw spikes, event lines, axes
        updateNeuralInfo();
        plotG.each(drawSpikes);
        plotG.each(drawEventLines);
        plotG.each(appendAxis);

        // Add labels to each plot
        ruleColorScale = d3.scale.ordinal()
            .domain(["Color", "Orientation"])
            .range(["#ef8a62","#67a9cf"]);

    var plotLabels = plotG.selectAll(".plotLabel")
            .data(function(d) {return [d];})
            .enter()
              .append("text")
                .attr("class", "plotLabel")
                .attr("x", 0)
                .attr("y", 0)
                .attr("dy", "-0.95em")
                .style("fill", function(d) {return ruleColorScale(d.key);})
                .text(function(d) {return d.key + " Rule";});

		// Listen for changes on the drop-down menu
		factorSortMenu
			.on("change", function () {
				ruleRaster.draw(params);
			});
		neuronMenu
			.on("change", function () {
				ruleRaster.draw(params);
			});
		timeMenu
			.on("change", function () {
				ruleRaster.draw(params);
			});
    fileMenu
			.on("change", function () {
				params.data = d3.selectAll("#fileMenu select").property("value"),
				ruleRaster.loadData(params);
			});

// ******************** Helper Functions **********************

// ******************** Draw Spikes Function ******************
        function drawSpikes(rule) {
            var curPlot = d3.select(this);

            // Join the trial data to svg containers ("g")
            var	trialG = curPlot.selectAll(".trial")
                  .data(rule.values, function(d) {return d.trial_id; });

            // For each new data, append an svg container and set css class to trial
            // for each group, translate its location to its index location in the trial object
            trialG.enter()
                .append("g")
                  .attr("class", "trial")
                  .attr("transform", function(d, i) {
                      return "translate(0," + rule.yScale(i) + ")";
                  });
            trialG
                .style("fill", function (d) {
                    return colorScale(d[factorSortMenuValue]);
                })
                .transition()
                  .duration(1000)
                .attr("transform", function(d, i) {
                    return "translate(0," + rule.yScale(i) + ")";
                });
            // For each new spike time, append circles that correspond to the spike times
            // Set the x-position of the circles to their spike time and the y-position to the size of the ordinal scale range band
            // that way the translate can move them to their appropriate position relative to the same coordinate system
            var spikes = trialG.selectAll("circle.spikes")
                .data(function (d) { return d[curNeuronName]; });
            spikes.enter()
                .append("circle")
                  .attr("class", "spikes")
                  .style("opacity", 1E-5)
                  .attr("r", 2)
                  .attr("cy", function (d) {
                      return rule.yScale.rangeBand() / 2;
                    });
            spikes
                .transition()
                  .duration(1000)
                .attr("cx", function (d) {
                    return xScale(d - (this.parentNode.__data__[timeMenuValue]));
                })
                .style("opacity", 0.9);
            spikes.exit()
                .remove();
            // Remove trials that don't have matched data
            trialG.exit()
                .remove();
        }
// ******************** Event Line Function *******************
        function drawEventLines(rule) {
            var curPlot = d3.select(this),
                lines = [
                    {label: "Rule Cue", id: "rule_onset"},
                    {label: "Test Stimulus Cue", id: "stim_onset"},
                    {label: "Saccade", id: "react_time"}
                ],
                eventLine = curPlot
                    .selectAll(".eventLine")
                    .data(lines, function(d) {return d.id;});
            // Append mean times for label position
            lines = lines.map(function(line) {
                return {
                    label: line.label,
                    id: line.id,
                    mean_stat: d3.mean(rule.values.map(function(d) {
                        return d[line.id] - d[timeMenuValue];
                    }))
                };
            });
            // Plot lines corresponding to trial events
            eventLine.enter()
                .append("path")
                  .attr("class", "eventLine")
                  .attr("id", function(d) {return d.id;});

            eventLine
                .transition()
                  .duration(1000)
                  .ease("linear")
                .attr("d", function(line) {
                        return LineFun(rule.values, rule.yScale, line.id);
                });

            eventLine.exit()
              .remove();

            // Add labels corresponding to trial events
            var eventLabel = curPlot.selectAll(".eventLabel")
                .data(lines, function(d) {return d.id;});

            eventLabel.enter()
                .append("text")
                  .attr("class", "eventLabel")
                  .attr("id", function(d) {return d.id;})
                  .attr("y", function(d) {return rule.yScale(0); })
                  .attr("dy", "-0.25em")
                  .attr("text-anchor", "middle")
                  .text(function(d) {return d.label; });

            eventLabel
                .transition()
                  .duration(1000)
                  .ease("linear")
                .attr("x", function(d) {
                        return xScale(d.mean_stat);
                });

            eventLabel.exit()
              .remove();

            function LineFun(values, scaleFun, line_name) {

                // Setup helper line function
                 var line = d3.svg.line()
                    .x(function (d) {
                        return xScale(d[line_name] - d[timeMenuValue]);
                    })
                    .y(function (d, i) { return scaleFun(i); })
                    .interpolate("linear");

                return line(values);
            }
        }
// ******************** Axis Function *******************
        function appendAxis(rule) {
            var curPlot = d3.select(this),
                xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom");
            // Append the x-axis
            var axisG = curPlot.selectAll("g.axis").data([{}]);
            axisG.enter()
                .append("g")
                .attr("class", "axis")
                .attr("transform", function() {
                    return "translate(0," + (height - PLOT_BUFFER)/2 + ")";
                });
            axisG
              .transition()
                .duration(10)
                  .ease("linear")
              .call(xAxis);
            // Label x-axis
            curPlot.selectAll(".xLabel")
                .data([{}])
                  .enter()
                    .append("text")
                      .attr("class", "xLabel")
                      .attr("text-anchor", "end")
                      .attr("x", width - (width/2))
                      .attr("transform", function() {
                        return "translate(0," + (height - PLOT_BUFFER)/2 + ")";
                      })
                      .attr("dy", "2.50em")
                      .text("Time (ms)");
            // Label y-axis
            curPlot.selectAll(".yLabel")
                .data([{}])
                .enter()
                  .append("text")
                    .attr("class", "yLabel")
                    .attr("text-anchor", "middle")
                    .attr("transform", "rotate(-90)")
                    .attr("x", 0 - ((height - PLOT_BUFFER)/4))
                    .attr("y", 0)
                    .attr("dx", "0.4em")
                    .attr("dy", "-0.4em")
                    .text("Trials");
        }
// ******************** Color Scale Function *******************
            function colorPicker() {
                switch (factorSortMenuValue) {
                    case "trial_id":
                    case "stim_onset":
                        colorScale = d3.scale.ordinal()
                            .domain(0)
                            .range(["black"]);
                        break;
                    case "Rule":
                        colorScale = d3.scale.ordinal()
                            .domain(["Color", "Orientation"])
                            .range(["#ef8a62","#67a9cf"]);
                        break;
                    case "ResponseDir":
                        colorScale = d3.scale.ordinal()
                            .domain(["Left", "Right"])
                            .range(["red", "green"]);
                        break;
                    case "SwitchDist":
                        // can build a continuous color scale
                        colorScale = d3.scale.linear()
                            .domain([0, 11])
                            .range(["magenta", "grey"]);
                        break;
                }
                    return colorScale;
            }
// ******************** Neuron Info Function *******************
            function updateNeuralInfo() {
                var atGlance = d3.select("#atGlance").selectAll("table")
                    .data(neuron, function (d) {return d.Name;});
                // Display neuron info
                atGlance.enter()
                        .append("table")
                        .append("tbody");
                var tbody = atGlance.selectAll("tbody");
                var tr = tbody
                    .selectAll("tr")
                    .data(d3.keys(neuron[0]), String);
                tr.enter()
                    .append("tr")
                    .append("th")
                    .text(String);
                tr.selectAll("td")
                    .data(function (d) {
                        return neuron.map(function(column) {
                            return {key: d, value: column[d]};
                        });
                    })
                    .enter()
                      .append("td")
                      .text(function(d) { return d.value; });
                atGlance.exit()
                  .remove();
            }
	};
})();
