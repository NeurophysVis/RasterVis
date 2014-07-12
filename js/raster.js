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
			d3.json(params.data  + ".json" + "#" + Math.random(), function (error, json) {
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
				neuron_menu
						.select("select")
						.select("option")
						.attr("selected", "selected");
				
				// Draw visualization			
				
				vis.draw(params);
			});
		});
	};
	vis.draw = function (params) {
		// Extract relevant trial and neuron information
		// Future versions will include option to select neuron, select the first one
		var neuron_menu = d3.select("#neuron_menu select"),
			cur_neuron_name = neuron_menu.property("value"),
			time_menu = d3.select("#time_menu select"),
			time_menu_value = time_menu.property("value"),
			factor_sort_menu = d3.select("#factor_sort_menu select"),
			factor_sort_menu_value = factor_sort_menu.property("value"),
			neuron = vis.data[params.data].neurons.filter(function (d) {return d.Name === cur_neuron_name; }), // == does type conversion before equality, === does not do type conversion
			trial = vis.data[params.data].trials,
			at_glance = d3.select("#at_glance")
				.selectAll("table")
				.data(neuron, function (d) {return d.Name;});
		// Sort Data
		trial
			.sort(function (a, b) {
				return d3.ascending(a.stim_onset, b.stim_onset);
			})
			.sort(function (a, b) {
				return d3.ascending(a[factor_sort_menu_value], b[factor_sort_menu_value]);
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
		var	min_time = d3.min(trial, function (d) {
				return d3.min(d[cur_neuron_name], function (e) { return d3.min(e); })  - d[time_menu_value];
			}),
			max_time = d3.max(trial, function (d) {
				return d3.max(d[cur_neuron_name], function (e) { return d3.max(e); }) - d[time_menu_value];
			}),
			xScale = d3.scale.linear()
					.domain([min_time, max_time])
					.range([0, width]),
		// For categorical variables, use selection.map to map categorical variable to an index starting at 1
		// Use rangeBands or rangeRoundBands to divide the chart area into evenly-spaced, evenly-sized bands
			yScale = d3.scale.ordinal()
				.domain(d3.range(trial.length))
				.rangeBands([0, height]);
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
		// Set up Axes
		var	xAxis = d3.svg.axis()	
				.scale(xScale)
				.orient("bottom"),
			yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left"),
		// Join the trial data to svg containers ("g")
			trial_select = svg.selectAll(".trial")
				.data(trial, function (d) { return d.trial_id; });
		// For each new data, append an svg container and set css class to trial
		// for each group, translate its location to its index location in the trial object
		trial_select
			.enter()
			.append("g")
			.attr("class", "trial")
			.attr("transform", function(d, i) {
				return "translate(0," + yScale(i) + ")";
			});
		// For each new spike time, append circles that correspond to the spike times
		// Set the x-position of the circles to their spike time and the y-position to the size of the ordinal scale range band
		// that way the translate can move them to their appropriate position relative to the same coordinate system
		trial_select.selectAll("circle")
			.data(function (d, i) { 
				return d[cur_neuron_name]; 
			})
			.enter()
			.append("circle");
		trial_select.selectAll("circle")
				.transition()
				.duration(1000)
				.style("opacity", .8)
				.attr("class", "spikes")
				.attr("r", 2)
				.attr("cx", function (d) {return xScale(d - (this.parentNode.__data__[time_menu_value])); })
				.attr("cy", yScale.rangeBand() / 2);
		// For all the trials, move them to the appropriate position with a delay for each trial to better display the transition	
		trial_select
			.transition()
			.duration(10)
			.delay(function(d, i) { return i; })
			.attr("transform", function(d, i) { return "translate(0," + yScale(i) + ")"; })
			.style("fill", function (d) {
				return colorScale(d[factor_sort_menu_value]);
			});			
		// Draw a line corresponding to the stimulus onset time
		var stimLineFun = d3.svg.line()
				.x(function (d) { return xScale(d.stim_onset - d[time_menu_value]); })
				.y(function (d, i) { return yScale(i); })
				.interpolate("basis");
		// wrap trial object in array so that there's only one data point to join with selection
		var stimOnset_line = svg.selectAll("#stimOnset_line")
			.data([trial]);		
		stimOnset_line
			.enter()
			.append("path")
			.attr("class", "line")
			.attr("id", "stimOnset_line")
			.attr("d", stimLineFun);		
		stimOnset_line
			.transition()
			.duration(1000)
			.ease("linear")
			.attr("d", stimLineFun);
		// Add a label for stimulus onset
		var stimOnset_label = svg.selectAll("#stimOnset_label")
				.data([trial[0].stim_onset - trial[0][time_menu_value]]);				
		stimOnset_label
			.enter()
			.append("text")
			.attr("id", "stimOnset_label");		
		stimOnset_label
			.transition()
			.duration(1000)
			.ease("linear")
			.attr("x", function (d) {return xScale(d); })
			.attr("y", yScale(0))
			.attr("dx", "-3em")
			.attr("dy", "-0.25em")
			.text("Stimulus Onset");		
		// Draw a line corresponding to the rule onset time
		var ruleLineFun = d3.svg.line()
				.x(function(d) { return xScale(d.rule_onset - d[time_menu_value]); })
				.y(function(d, i) { return yScale(i); })
				.interpolate("basis");
		var ruleOnset_line = svg.selectAll("#ruleOnset_line")
			.data([trial]);
		ruleOnset_line
			.enter()
			.append("path")
			.attr("class", "line")
			.attr("id", "ruleOnset_line")
			.attr("d", ruleLineFun);
		ruleOnset_line
			.transition()
			.duration(1000)
			.ease("linear")
			.attr("d", ruleLineFun);
		// Add a label for rule onset
		var ruleOnset_label = svg.selectAll("#ruleOnset_label")
				.data([0 - (trial[0][time_menu_value]) ]);
		ruleOnset_label
			.enter()
			.append("text")
			.attr("id", "ruleOnset_label");
		ruleOnset_label
			.transition()
			.duration(1000)
			.ease("linear")
			.attr("x", function (d) {return xScale(d); })
			.attr("y", yScale(0))
			.attr("dx", "-2em")
			.attr("dy", "-0.25em")
			.text("Rule Onset");
		// Append the x-axis
		svg
			.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
		var xLabel = svg.selectAll(".xLabel")
			.data(["Time (ms)"], String);
		xLabel
			.enter()
			.append("text")
			.attr("class", "xLabel")
			.attr("text-anchor", "end")
			.attr("x", width - (width/2))
			.attr("y", height)
			.attr("dy", "2.50em")
			.text("Time (ms)");
		var yLabel = svg.selectAll(".yLabel")
			.data(["Trials"], String);
		yLabel
			.enter()
			.append("text")
			.attr("class", "yLabel")
			.attr("text-anchor", "middle")
			.attr("transform", "rotate(-90)")
			.attr("x", 0 - (height/2))
			.attr("y", 0)
			.attr("dy", "-0.4em")
			.text("Trials");
		// Remove trials that don't have matched data
		trial_select.exit().remove();
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
	};
})();