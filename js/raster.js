(function () {
    vis = {};
	var width, height,
		chart, svg,
		defs, style;
	vis.init = function (params) {
		if (!params) {params = {}; }
		chart = d3.select(params.chart || "#chart"); // placeholder div for svg
		margin = {top: 30, right: 30, bottom: 30, left: 30};
		padding = {top: 60, right: 60, bottom: 60, left: 60};
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
		// vis.init can be re-ran to pass different height/width values
		// to the svg. this doesn't create new svg elements.
		style = svg.selectAll("style").data([{}]).enter()
			.append("style")
			.attr("type", "text/css");
		// this is where we can insert style that will affect the svg directly.
		defs = svg.selectAll("defs").data([{}]).enter()
			.append("defs");
		// Create neuron file menu
		file_names = ["cc1", "isa9"];
		file_menu = d3.selectAll("#file_menu")
			.append("select")
			.attr("name", "file-list");
		var options = file_menu.selectAll("option")
			.data(file_names)
			.enter()
			.append("option");
		file_menu.select("option")
						.attr("selected", "selected");
		options.text(String)
				.attr("value", String);
		// Load Data
		vis.loaddata(params);
	};
	vis.loaddata = function (params) {
		if (!params) {params = {}; }
		d3.text(params.style || "style.txt", function (error, txt) {
			// note that execution won't be stopped if a style file isn't found
			style.text(txt); // but if found, it can be embedded in the svg.
			// ("#" + Math.random()) makes sure the script loads the file each time instead of using a cached version, remove once live
			var cur_file_name = "/DATA/" + params.data  + ".json" + "#" + Math.random();
			d3.json(cur_file_name, function (error, json) {
				vis.data = json;
				// populate drop-down menu with neuron names
				var neuron_menu = d3.select("#neuron_menu");
				neuron_menu
						.selectAll("select.main")
						.data([{}])
						.enter()
						.append("select")
						.attr("name", "neuron-list")
						.classed("main", 1);
				var	neuron = vis.data[params.data].neurons,
					options = neuron_menu
						.select("select")
						.selectAll("option")
						.data(neuron, function(d) {return d.Name;});
				options
					.enter()
					.append("option")
					.text(function (d) { return d.Name; })
					.attr("value", function (d) { return d.Name; });
				options.exit().remove();
				neuron_menu // add option to select neuron based on parameters from the browser
						.select("select")
						.select("option")
						.attr("selected", "selected");

				// Draw visualization

				vis.draw(params);
			});
		});
	};
	vis.draw = function (params) {
		plot_buffer = 70;
		// Extract relevant trial and neuron information
		// Future versions will include option to select neuron, select the first one
		var neuron_menu = d3.select("#neuron_menu select"),
			cur_neuron_name = neuron_menu.property("value"),
			time_menu = d3.select("#time_menu select"),
			time_menu_value = time_menu.property("value"),
			factor_sort_menu = d3.select("#factor_sort_menu select"),
			factor_sort_menu_value = factor_sort_menu.property("value"),
			neuron = vis.data[params.data].neurons.filter(function (d) {return d.Name === cur_neuron_name; }), // == does type conversion before equality, === does not do type conversion
			at_glance = d3.select("#at_glance")
				.selectAll("table")
				.data(neuron, function (d) {return d.Name;}),
		// Nest and Sort Data
			trial = d3.nest()
				.key(function(d) {return d.Rule;}) // nests data by Rule
      			.sortValues(function (a, b) { // sorts data based on selected option
					return d3.ascending(a[factor_sort_menu_value], b[factor_sort_menu_value]);
				})
      			.entries(vis.data[params.data].trials),
      	// Create a group element for each rule so that we can have two plots, translate plots so that they don't overlap
			plot_g = svg.selectAll("g.plot_g").data(trial, function(d) {return d.key;});
			plot_g
				.enter()
  				.append("g")
  				.attr("transform", function(d,i) {return "translate(0," + ((height/2) + plot_buffer)*i + ")";})
  				.attr("class", "plot_g");
  			plot_g
  				.each(function(d) {
  					d.yScale = d3.scale.ordinal()
						.domain(d3.range(d.values.length))
						.rangeBands([0, (height - plot_buffer)/2]);
  				});

		// Display neuron info
		at_glance.enter()
				.append("table")
				.append("tbody");
		var tbody = at_glance.selectAll("tbody");
		var tr = tbody
			.selectAll("tr")
			.data(d3.keys(neuron[0]), String);
		tr
			.enter()
			.append("tr")
			.append("th")
			.text(String);
		tr
			.selectAll("td")
			.data(function (d) {
				return neuron.map(function(column) {
					return {key: d, value: column[d]};
				});
			})
			.enter()
			.append("td")
			.text(function(d) { return d.value; });
		at_glance.exit().remove();
		// Set up scales
		var	min_time = d3.min(vis.data[params.data].trials, function (d) {
				return d3.min(d[cur_neuron_name], function (e) { return d3.min(e); })  - d[time_menu_value];
			}),
			max_time = d3.max(vis.data[params.data].trials, function (d) {
				return d3.max(d[cur_neuron_name], function (e) { return d3.max(e); }) - d[time_menu_value];
			}),
			xScale = d3.scale.linear()
					.domain([min_time, max_time])
					.range([0, width]);
		var	colorScale;
		switch (factor_sort_menu_value) {
		case "trial_id":
		case "stim_onset":
			colorScale = d3.scale.ordinal()
				.domain(0)
				.range(["#000"]);
			break;
		case "Rule":
			colorScale = d3.scale.ordinal()
				.domain(d3.range(2))
				.range(colorbrewer.RdBu[3]);
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

        plot_g.each(draw_spikes)
        plot_g.each(draw_event_lines);
        plot_g.each(append_axis);


		// Listen for changes on the drop-down menu
		factor_sort_menu
			.on("change", function () {
				vis.draw(params);
			});
		neuron_menu
			.on("change", function () {
				d3.selectAll(".trial")
					.remove();
				d3.selectAll(".axis")
					.transition()
					.duration(10)
					.ease("linear")
					.remove();
				vis.draw(params);
			});
		time_menu
			.on("change", function () {
				d3.selectAll(".axis")
					.transition()
					.duration(10)
					.ease("linear")
					.remove();
				vis.draw(params);
			});
		file_menu
			.on("change", function () {
				d3.selectAll(".axis")
					.transition()
					.duration(100)
					.ease("linear")
					.remove();
				var file_menu_value = file_menu.property("value");
				cur_file = file_menu_value;
				params.data = file_menu_value;
				vis.loaddata(params);
			});
// ******************** Draw Spikes Function ******************
        function draw_spikes(rule) {
            var cur_plot = d3.select(this);

            // Join the trial data to svg containers ("g")
            var	trial_select = cur_plot.selectAll(".trial")
                    .data(rule.values, function(d) {return d.trial_id; });

            // For each new data, append an svg container and set css class to trial
            // for each group, translate its location to its index location in the trial object
            trial_select
                .enter()
                .append("g")
                .attr("class", "trial")
                .attr("transform", function(d, i) {
                    return "translate(0," + rule.yScale(i) + ")";
                });
            trial_select
                .attr("transform", function(d, i) {
                    return "translate(0," + rule.yScale(i) + ")";
                });
            // For each new spike time, append circles that correspond to the spike times
            // Set the x-position of the circles to their spike time and the y-position to the size of the ordinal scale range band
            // that way the translate can move them to their appropriate position relative to the same coordinate system
            var spikes = trial_select.selectAll("circle.spikes")
                .data(function (d) { return d[cur_neuron_name]; });
            spikes
                .enter()
                .append("circle")
                .attr("class", "spikes");
            trial_select.selectAll("circle.spikes")
                .transition()
                .duration(1000)
                .style("opacity", .8)
                .attr("r", 2)
                .attr("cx", function (d) {return xScale(d - (this.parentNode.__data__[time_menu_value])); })
                .attr("cy", function (d) {return rule.yScale.rangeBand() / 2; });
            spikes.exit().remove();
            // For all the trials, move them to the appropriate position with a delay for each trial to better display the transition
            trial_select
                .transition()
                .duration(10)
                .delay(function(d, i) { return i; })
                .attr("transform", function(d, i) { return "translate(0," + rule.yScale(i) + ")"; })
                .style("fill", function (d) {
                    return colorScale(d[factor_sort_menu_value]);
                });

            // Remove trials that don't have matched data
            trial_select.exit().remove();
        }
// ******************** Event Line Function *******************
        function draw_event_lines(rule) {
            var cur_plot = d3.select(this),
                lines = [
                    {label: "Rule Onset", id: "rule_onset"},
                    {label: "Stimulus Onset", id: "stim_onset"},
                    {label: "Saccade", id: "react_time"}
                ],
                event_line = cur_plot
                    .selectAll(".event_line")
                    .data(lines, function(d) {return d.id;});
            // Append mean times for label position
            lines = lines.map(function(line) {
                return {
                    label: line.label,
                    id: line.id,
                    mean_stat: d3.mean(rule.values.map(function(d) {
                        return d[line.id] - d[time_menu_value];
                    }))
                };
            });
            // Plot lines corresponding to trial events
            event_line
                .enter()
                .append("path")
                .attr("class", "event_line")
                .attr("id", function(d) {return d.id;})
                .attr("d", function(line) {
                        return LineFun(rule.values, rule.yScale, line.id);
                });

            event_line
                .transition()
                .duration(1000)
                .ease("linear")
                .attr("d", function(line) {
                        return LineFun(rule.values, rule.yScale, line.id);
                });

            event_line.exit().remove();

            // Add labels corresponding to trial events

            event_label = cur_plot
                .selectAll(".event_label")
                .data(lines, function(d) {return d.id;});

            event_label
                .enter()
                .append("text")
                .attr("class", "event_label")
                .attr("id", function(d) {return d.id;})
                .attr("x", function(d) {
                        return xScale(d.mean_stat);
                })
                .attr("y", function(d) {return rule.yScale(0); })
                .attr("dx", "-2em")
                .attr("dy", "-0.25em")
                .text(function(d) {return d.label; })

            event_label
                .transition()
                .duration(1000)
                .ease("linear")
                .attr("x", function(d) {
                        return xScale(d.mean_stat);
                });

            event_label.exit().remove();

            function LineFun(values, scaleFun, line_name) {

                // Setup helper line function
                 var line = d3.svg.line()
                    .x(function (d) { return xScale(d[line_name] - d[time_menu_value]); })
                    .y(function (d, i) { return scaleFun(i); })
                    .interpolate("linear");

                return line(values);
            }
        }
// ******************** Axis Function *******************
        function append_axis(rule) {
            var cur_plot = d3.select(this),
                xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom");
            // Remove any prior axes
            cur_plot
                .selectAll(".axis")
                .remove();
            // Append the x-axis
            cur_plot
                .append("g")
                .attr("class", "axis")
                .attr("transform", function() {return "translate(0," + (height - plot_buffer)/2 + ")";})
                .call(xAxis);
            // Label x-axis
            cur_plot.selectAll(".xLabel")
                .data([{}])
                .enter()
                .append("text")
                .attr("class", "xLabel")
                .attr("text-anchor", "end")
                .attr("x", width - (width/2))
                .attr("transform", function() {return "translate(0," + (height - plot_buffer)/2 + ")";})
                .attr("dy", "2.50em")
                .text("Time (ms)");
            // Label y-axis
            cur_plot.selectAll(".yLabel")
                .data([{}])
                .enter()
                .append("text")
                .attr("class", "yLabel")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", 0 - ((height - plot_buffer)/4))
                .attr("y", 0)
                .attr("dx", "0.4em")
                .attr("dy", "-0.4em")
                .text("Trials");
        }
	};
})();
