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
		
		var trials = vis.data.cc1.trials;
		var cur_data = vis.data.cc1.neurons[1].SpikeTimes;
		
		var xScale = d3.scale.linear()
			.domain([d3.min(cur_data, function(d) { return d[1]; }), d3.max(cur_data, function(d) { return d[1]; })])
			.range([0, width]);
		
		var yScale = d3.scale.linear()
			.domain([d3.min(cur_data, function(d) { return d[0]; }), d3.max(cur_data, function(d) { return d[0]; })])
			.range([0, height])
			.nice();
			
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom");
			
		var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left");
		
		var circle = svg.selectAll("circle")
			.data(cur_data)
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return xScale(d[1]);
				})
			.attr("cy", function(d) {
				return yScale(d[0]);
				})
			.attr("r", 2);
		
		
		svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
			
			d3.select("p")
				.on("click", function() {
					// d3.nest().key(function(d) {return d.prep_time; }).sortKeys(d3.ascending).entries(vis.data.cc1.trials)
					// d3.nest().key(function(d) {return d.Rule; }).key(function(d) {return d.prep_time; }).sortKeys(d3.ascending).entries(vis.data.cc1.trials)
					
				});
		
    }
})();