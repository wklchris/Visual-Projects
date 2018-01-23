"use strict";
var margin = {top: 60, bottom: 30, left: 80, right: 80},
    margin_brush = {top: 120, bottom: 100, left: 80, right: 80},
    width = 0.8*window.innerWidth - margin.left - margin.right,
    height = 0.7*window.innerHeight - margin.top - margin.bottom,
    height_brush = 50, height_dummy = 15;

// Mouseover & MouseOut Settings
var hoverColor = "Gray";

// Add mainGraph/SVG element to <body>
var svg = d3.select("body").append("svg")
        .attr("class", "mainSVG")
        .attr("width", width + margin.left)
        .attr("height", height + margin.bottom);
var mainGraph = svg.append("g").attr("class", "mainGraph")
    .attr("transform", "translate(" + margin.left + ",0)");
// Add brushGraph/SVG element to <body>
var brushSvg = d3.select("body").append("svg")
        .attr("class", "brushSVG")
        .attr("width", width + margin_brush.left)
        .attr("height", height_brush);
var brushGraph = brushSvg.append("g")
        .attr("class", "brushGraph")
        .attr("transform", "translate(" + margin_brush.left + ",0)");
var Ytext = svg.append("text");
// Add colorBar
var colorTheme = ["#F94318", "#F97818", "#F99918", "#F9B218", "#F9C818",
                  "#F9DD18", "#F9F518", "#CBF017", "#9AE716", "#54D715"];
var colorSvg = d3.select("body").append("svg")
        .attr("class", "colorBar")
        .attr("width", width + margin_brush.left)
        .attr("height", height_brush / 4);
var colorBar = colorSvg.append("g")
    .attr("class", "colorBar");
colorBar.selectAll("rect").data(colorTheme)
        .enter().append("rect")
        .attr("x", function(d, i) {
            return (9-i) * width / 10 + margin_brush.left; 
        })
        .attr("y", 0)
        .attr("width", width / 10).attr("height", height_brush / 4)
        .attr("fill", function(d) { return d; })
        .attr("display", "none");
//
// Pop-up Textbox
//
var textDiv = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr("opacity", 0);
var offsets = {x: 50, y: -100};
var currentMovie = {};
// Where to put the pop-up textbox
function placeXDiv(ori_x, offset_x) {
    var leftside_x = ori_x - offset_x - textDiv.node().offsetWidth
    if (leftside_x < margin.left) {
        return ori_x + offset_x;
    }
    return leftside_x;
}

// Parse complex data from the CSV
function parseInfo(colname) {
    var target = [{name: "N/A"}];
    var s = [];
    try{
        target = JSON.parse(currentMovie[colname]);
    } catch(e) { throw e; }
    target.forEach(function(d) {s.push(d.name);})
    s.sort();
    return s.join(", ") + ". ";
}

// Set Date Format
function parseDate(s) {
    if (s.indexOf("/") >= 0) {
        var dates = s.split("/");  // Raw format: mm/dd/YYYY
        if (+dates[0] < 10) {dates[0] = "0" + dates[0]}
        if (+dates[1] < 10) {dates[1] = "0" + dates[1]}
        return [dates[2], dates[0], dates[1]].join("-");
    }
    return s;
}

// Read Percentiles (pre-processed) for coloring
var percentiles = {vote_average: [], popularity: [], year: []};
d3.csv("data/percentiles.csv", function(error, data) {
    if (error) throw error;
    data.forEach(function(d) {
        percentiles.vote_average.push(d.vote_average);
        percentiles.popularity.push(d.popularity);
        percentiles.year.push(d.year);
    })
});

//
// Main: Read the CSV & Plotting
//
drawGraph();

function drawGraph() {
    d3.csv("data/jointtable.csv", function(error, data) {
        if (error) throw error;

        // Detect the radio button selection
        var colorRadio = d3.select('input[name=colorby]:checked').attr('value');

        // Convert strings to numbers
        data.forEach(function(d) {
            d.budget = +d.budget;
            d.revenue = +d.revenue;
            d.vote_average = +d.vote_average;
            d.vote_count = +d.vote_count;
            d.popularity = +d.popularity;
        });
        
        // Filtering & Sorting Data
        if (d3.select('input[name=sorted]').property("checked")) {
            var selectedColumn = d3.select('input[name=sortby]:checked').attr('value');
            if (selectedColumn === "sort_name") {
                data.sort(function(a, b) { return d3.ascending(a.title, b.title) });
            }
            else if (selectedColumn === "sort_color" || selectedColumn === "year") {
                data.sort(function(a, b) { return +b[colorRadio] - a[colorRadio]; });
            } else {
                data.sort(function(a, b) { return +b.revenue - a.revenue; });
            }
        }

        // Set Axes Scalers
        var xScale = d3.scaleBand()
            .domain(data.map(function(d) { return d.title; }))
            .range([0, width]).padding(0.15);
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d.revenue; })])
            .range([height, 0]); 

        // Add bar rectangles
        drawBars();
        function drawBars() {
            mainGraph.selectAll("rect").remove().exit()
                .data(data.filter(function (d) { return xScale.domain().indexOf(d.title) > -1; }))
                // Add bars
                .enter().append("rect")
                .attr("id", function(d, i) { return "rect" + i; })
                .attr("class", "bar")
                .attr("fill", function(d) { return barColor(d); })
                .attr("x", function(d) { return xScale(d.title); })
                .attr("width", xScale.bandwidth())
                .attr("y", function(d) { return yScale(d.revenue); })
                .attr("height", function(d) { return height - yScale(d.revenue) + height_dummy; })
                // Mouse Event
                .on("mouseover", handleMouseOver)
                .on("mousemove", handleMouseMove)
                .on("mouseout", handleMouseOut);
        }
        
        // Color Theme by Radio Button Selection
        function barColor(d) {
            var colorseq = d3.scaleThreshold()
                .domain(percentiles[colorRadio])
                .range(colorTheme); 
            return colorseq(d[colorRadio]);
        }

        // Mouse Events
        function handleMouseOver(d, i) {
            d3.select(this).attr("fill", hoverColor);
            movieInfo(d.movie_id);  // Read Movie Info
            textDiv.transition().duration(150)
                .style("opacity", .9)
                .style("background-color", "wheat")
                .style("left", placeXDiv(d3.event.pageX, offsets.x) + "px")
                .style("top", d3.event.pageY + offsets.y + "px");
        }

        function handleMouseMove(d, i) {
            if (textDiv.style("opacity") > 0) { 
                textDiv.style("left", placeXDiv(d3.event.pageX, offsets.x) + "px")
                    .style("top", d3.event.pageY + offsets.y + "px");
            }
        }

        function handleMouseOut(d, i) {
            textDiv.style("opacity", 0)
            d3.select(this).transition().duration(300)
                .attr("fill", barColor(d));
            textDiv.selectAll("h1").remove();
            textDiv.selectAll("p").remove(); 
        }

        // Display information of movie with id = #k
        function movieInfo(k) {
            var tempData = data.filter(function (row) {
                return row["movie_id"] == k;
            });
            currentMovie = tempData[0];
            // Add text to the textbox
            textDiv.append("h1").text(currentMovie.title)
                .attr("class", "tooltip");
            textDiv.append("p").html("<b>Genres:</b> " + parseInfo("genres"));
            textDiv.append("p").html('<b>Year:</b> '
                + parseDate(currentMovie.release_date) + ", <b>Popularity:</b> "
                + Math.round(+currentMovie.popularity * 100) / 100);
            var dolarFormat = d3.format(",.4r");
            textDiv.append("p").html("<b>Budget:</b>  "
                + dolarFormat(currentMovie.budget));
            textDiv.append("p").html("<b>Revenue:</b> "
                + dolarFormat(currentMovie.revenue));
            textDiv.append("p").html("<b>Rate:</b> " + currentMovie.vote_average
                + " (" + currentMovie.vote_count + " votes)");
            // Add class for all these <p>
            textDiv.selectAll("p").attr("class", "tooltip");
        }

        // Draw X-axis brushbar
        var xScale_brush = d3.scaleBand()
            .domain(data.map(function(d) { return d.title; }))
            .range([0, width]).padding(0.15);
        var yScale_brush = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d.revenue; })])
            .range([height_brush, 0]);
        var brush = d3.brushX().extent([[0, 0], [width, height_brush]])
            .on("brush", brushed);
        
        var brushedBars = brushGraph.selectAll("rect")
            .remove().exit()
            .data(data)
            .enter().append("rect")
            .attr("fill", function(d) { return barColor(d); })
            .attr("x", function(d) { return xScale_brush(d.title); })
            .attr("width", xScale_brush.bandwidth())
            .attr("y", function(d) { return yScale_brush(d.revenue);})
            .attr("height", function(d) { return height_brush - yScale_brush(d.revenue); })
        brushGraph.call(brush)
            .call(brush.move, [0, width/120]);  // Brush Initialization

        function brushed() {
            var s = d3.event.selection,
                selectedBars = {title: [], y: []};
            data.forEach(function (d) {
                if (xScale_brush(d.title) > s[0] && xScale_brush(d.title) < s[1]) {
                    selectedBars.title.push(d.title);
                    selectedBars.y.push(d.revenue);
                }
            });
            // Update domains
            xScale.domain(selectedBars.title);
            yScale.domain([0, d3.max(selectedBars.y)]);
            // Update Graph
            drawBars();
            drawAxes();
        }
        
        // Add axes
        drawAxes(); 
        function drawAxes() {
            svg.selectAll("g.yAxis").remove();
            var drawYAxis = d3.axisLeft(yScale).tickFormat(d3.format(".2s"));
            
            var zY = svg.append("g")
                .attr("class", "yAxis")
                .style("font-size", "16px")
                .attr("transform", 
                    "translate(" + margin.left + ",0)")
                .call(drawYAxis);
            
            Ytext.attr("text-anchor", "middle")
                .attr("dy", "0.35em")  // vertical centre the text
                .attr("transform", "translate(15," + svg.attr("height")/2 + ")rotate(-90)")
                .text("Revenue");
        }

        // Display colorbar
        colorBar.selectAll("rect").attr("display", "inline");
    });
}
    