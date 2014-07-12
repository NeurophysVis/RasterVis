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
        width = params.width || 960;
        height = params.height || 500;
        chart.selectAll("svg")
            .data([{width:width,height:height}]).enter()
            .append("svg");
        svg = d3.select("svg").attr({
            width:function(d) {return d.width},
            height:function(d) {return d.height}
        });
        // vis.init can be re-ran to pass different height/width values
        // to the svg. this doesn't create new svg elements.
 
        style = svg.selectAll("style").data([{}]).enter()
            .append("style")
            .attr("type","text/css");
        // this is where we can insert style that will affect the svg directly.
 
        defs = svg.selectAll("defs").data([{}]).enter()
            .append("defs");
        // this is used if it's necessary to define gradients, patterns etc.
 
        // the following will implement interaction around a slider and a
        // button. repeat/remove as needed.
        // note that this code won't cause errors if the corresponding elements
        // do not exist in the HTML. 
         
        slider = d3.select(params.slider || ".slider");
         
        if (slider[0][0]) {
            maxStep = slider.property("max");
            step = slider.property("value");
            slider.on("change", function() {
                vis.stop();
                step = this.value;
                vis.draw(params);})
            running = params.running || 0; // autorunning off or manually set on
        } else {
            running = -1; // never attempt auto-running
        }
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
            d3.csv(params.data || "data.csv", function(error,csv) {
                vis.data = csv;
                if(running > 0) {vis.start();} else {vis.draw(params);}
            })
        })
    }
     
    vis.play = function() {
        if(i === maxStep && !running){
            step = -1;
            vis.stop();
        }
        if(i < maxStep) {
            step = step + 1;
            running = 1;
            d3.select(".stop").html("Pause").on("click", vis.stop(params));
            slider.property("value",i);
        vis.draw(params);} else {vis.stop();}   
    }
 
    vis.start = function(params) {
        timer = setInterval(function() {vis.play(params)}, 50);
    }
 
    vis.stop = function (params) {
        clearInterval(timer);
        running = 0;
        d3.select(".stop").html("Play").on("click", vis.start(params));
    }
 
    vis.draw = function(params) {
        // make stuff here!
    }
})();