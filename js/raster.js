(function() {
	vis={};
	var width,height;
	var chart,svg;
	var defs, style;
	var slider, step, maxStep, running;
	var button;

	vis.init=function(params) {
		if (!params) {params = {}}
		chart = d3.select(params.chart||"#chart"); // placeholder div for svg
		
		margin = {top: 20, right: 20, bottom: 20, left: 20};
		padding = {top: 60, right: 60, bottom: 60, left: 60};
		var outerWidth = params.width || 960;
		var outerHeight = params.height || 500;
		var innerWidth = outerWidth - margin.left - margin.right;
		var innerHeight = outerHeight - margin.top - margin.bottom;
		
		width = innerWidth - padding.left - padding.right;
		height = innerHeight - padding.top - padding.bottom;
		
		chart.selectAll("svg")
		.data([{width:width + margin.left + margin.right,height:height + margin.top + margin.bottom}]).enter()
		.append("svg");
		svg = d3.select("svg").attr({
width:function(d) {return d.width + margin.left + margin.right},
height:function(d) {return d.height + margin.top + margin.bottom}
		})
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		// vis.init can be re-ran to pass different height/width values
		// to the svg. this doesn't create new svg elements.

		style = svg.selectAll("style").data([{}]).enter()
		.append("style")
		.attr("type","text/css");
		// this is where we can insert style that will affect the svg directly.

		defs = svg.selectAll("defs").data([{}]).enter()
		.append("defs");
		// this is used if it's necessary to define gradients, patterns etc.

		

		button = d3.select(params.button || ".button");
		if(button[0][0] && running> -1) {
			button.on("click", function() {
				if (running) {
					vis.stop();
				} else {
					vis.start();
				}
			})
		};
		vis.loaddata(params);
	}
	
	vis.loaddata = function(params) {
		if(!params) {params = {}}
		d3.text(params.style||"style.txt", function (error,txt) {
			// note that execution won't be stopped if a style file isn't found
			style.text(txt); // but if found, it can be embedded in the svg.
			d3.json(params.data || "data.json", function(error,json) {
				vis.data = json;
				if(running > 0) {vis.start();} else {vis.draw(params);}
			})
		})
	}
	

	vis.draw = function(params) {
		
		// Extract relevant trial and neuron information
		// Future versions will include option to select neuron, select the first one
		var neuron = vis.data.cc1.neurons[0];
		// var trials = d3.nest().key(function(d) {return d.trial_id;}).entries(vis.data.cc1.trials);
		var trials = vis.data.cc1.trials;
		
		var min_time = d3.min(neuron.spikes, function(d) {
			return d3.min(d.spike_times, function(e) { return d3.min(e); });
		});
		
		var max_time = d3.max(neuron.spikes, function(d) {
			return d3.max(d.spike_times, function(e) { return d3.max(e); });
		});
		
		var xScale = d3.scale.linear()
		.domain([min_time, max_time])
		.range([0, width]);
		
		var yScale = d3.scale.linear()
		.domain([1, neuron.spikes.length])
		.range([0, height]);
		
		var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom");
		
		var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left");
		
		// Match an as yet uncreated object .trial to the spike x trial data
		// and append an svg container("g")
		var trial = svg.selectAll(".trial")
		.data(neuron.spikes, function(d) { return d.trial_id; })
		.enter()
		.append("g");
		
		// for each create trial group, append circles that correspond to the spike times
		trial.selectAll("circle")
		.data(function(d) { return d.spike_times; })
		.enter()
		.append("circle")
		.attr("r", 2)
		.attr("cx", function(d) {return xScale(d); })
		.attr("cy", function(d, column_index, row_index) {return yScale(row_index); });
		
		//trial.sort(function() {return Math.random() - .5; })
		
		var nest = d3.nest()
		.key(function(d) { return d.prep_time; })
		.sortKeys(d3.ascending)
		.entries(trials);
			
		var circle = trial.selectAll("circle");
		
		circle.transition()
		.duration(5000)
		.attr("cy", function(d, column_index, row_index) {return yScale(row_index); });
		
		
		svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

		
	}
})();