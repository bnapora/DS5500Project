var Graph = function(opts) {

	// load agruments from config object
	this.data = opts.data;
	this.element = opts.element;
	this.width = opts.width;
	this.height = opts.height;
	this.xMax = 5;
	this.yMax = 1;
	this.lineColor = opts.lineColor;
	this.bestLineColor = opts.bestLineColor;
	this.name = opts.name;
	this.margin = opts.margin;
	this.best = opts.best;
	this.type = opts.type;
	// create the graph
	this.draw();
}

Graph.prototype.draw = function() {
	// store scope in temporary variable
	var _this = this;

	// set up SVG
	d3.select(this.element).html("");

	// add title and maximize
	d3.select(this.element).append("center").text(this.name);

	if(this.type == "thumb") {
		d3.select(this.element).append("center").text("[+]").attr("class", "plus").on("click", function() {
			dispatch.plusClicked(_this);
		});
	} else {
		d3.select(this.element).append("center").text("[-]").attr("class", "minus").on("click", function() {
			dispatch.minusClicked(_this);
		});
	}

	var svg = d3.select(this.element).append('svg');
	svg.style("position", "relative");
	svg.attr("width", this.width);
	svg.attr("height", this.height);

	// append <g>
	this.plot = svg.append("g")
		.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

	// add axes and lines
	this.createScales();
	this.addAxes();
	this.addLine();
}

Graph.prototype.createScales = function() {
	// margin
	var m = this.margin;

	// x and y extent
	var xExtent = [0, this.xMax];
	var yExtent = [0, this.yMax];

	this.xScale = d3.scale.linear()
        .range([0, this.width-m.right])
        .domain(xExtent);

    this.yScale = d3.scale.linear()
        .range([this.height-(m.top+m.bottom), 0])
        .domain(yExtent);
}

Graph.prototype.addAxes = function() {
	// margin
	var m = this.margin;

	// x and y axis
	var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("bottom")
        .ticks(2);
    var yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient("left")
        .ticks(2);

    // add the axis
    this.plot.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (this.height-(m.top+m.bottom)) + ")")
        .call(xAxis);
    this.plot.append("g")
        .attr("class", "y axis")
        .call(yAxis);
}

Graph.prototype.addLine = function() {
	// store scope in temporary variable
	var _this = this;

	var line = d3.svg.line()
        .x(function(d) {
            // ... so we can access it here
            return _this.xScale(d.x);
        })
        .y(function(d) {
            return _this.yScale(d.y);
        }).interpolate("basis");
    this.data.forEach(function(v, i) {
    	var strokeColor = _this.lineColor;
    	if(i == _this.best) {
    		strokeColor = _this.bestLineColor;
    	}

    	_this.plot.append('path')
        // use data stored in `this`
        .datum(v)
        .classed('line',true)
        .attr('d',line)
        .attr("fill", "none")
        .style("stroke", strokeColor)
        .attr("name", _this.name)
        .attr("index", i)
        .attr("stroke", strokeColor)
        .on("mouseover", function() {
        	d3.select(this).attr("stroke-width", 2);
        }).on("mouseout", function() {
        	d3.select(this).attr("stroke-width", 1);
        }).on("click", function() {
        	dispatch.lineClicked(_this, this);
        });
    });
}


// listeners
dispatch.on("lineClicked.graph", function(_this, element) {
	_this.best = d3.select(element).attr("index");
	d3.selectAll("[name=" + _this.name + "]")
		.style("stroke", _this.lineColor)
		.attr("stroke", _this.lineColor);
	d3.selectAll("[name=" + _this.name + "][index='" + _this.best +"']")
		.style("stroke", _this.bestLineColor)
		.attr("stroke", _this.bestLineColor);

	// dispatch
	dispatch.nodeClicked(_this);
});

dispatch.on("plusClicked.graph", function(_this) {
	d3.select(config.graph.parent).transition().style("opacity", 0.1);
	_this.width = config.graph.max.width;
	_this.height = config.graph.max.height;
	_this.element = config.graph.max.parent;
	_this.type = "max";
	var graph = new Graph(_this);
});

dispatch.on("minusClicked.graph", function(_this) {
	d3.select(_this.element).html("");
	d3.select(config.graph.parent).transition().style("opacity", 1)
});