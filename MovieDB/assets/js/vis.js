var margin = {top: 60, bottom: 60, left: 80, right: 80},
    width = 0.8*window.innerWidth - margin.left - margin.right,
    height = 0.8*window.innerHeight - margin.top - margin.bottom;

// Set Axes Scalers
var xScale = d3.scaleBand()
        .range([margin.left, width])
        .padding(0.15);
var yScale = d3.scaleLinear()
        .range([height, 0]);

// Mouseover & MouseOut Settings
var hoverColor = "SandyBrown";

// Add a SVG element to <body>
var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(0," + margin.top + ")");
var mainGraph = svg.append("g");

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
    var target = JSON.parse(currentMovie[colname]);
    var s = [];
    target.forEach(function(d) {s.push(d.name);})
    s.sort();
    return s.join(", ") + ". ";
}

// Set Date Format
function parseDate(s) {
    if (s.indexOf("/") >= 0) {
        var dates = s.split("/");  // Raw format: MM/DD/YYYY
        if (+dates[0] < 10) {dates[0] = "0" + dates[0]}
        if (+dates[1] < 10) {dates[1] = "0" + dates[1]}
        return [dates[2], dates[0], dates[1]].join("-");
    }
    return s;
}

//
// Main: Read the CSV & Plotting
//
drawGraph();

function drawGraph() {
    d3.csv("data/jointtable.csv", function(error, data) {
        if (error) throw error;

        // Convert strings to numbers
        data.forEach(function(d) {
            d.budget = +d.budget;
            d.revenue = +d.revenue;
            d.vote_average = +d.vote_average;
            d.vote_count = +d.vote_count;
            d.popularity = +d.popularity;
        });

        // Detect the radio button selection
        var colorRadio = d3.select('input[name=colorby]:checked').attr('value');
        if (d3.select('input[name=sorted]').property("checked")) {
            if (d3.select('input[name=sortby]:checked').attr('value') === "sort_color") {
                data.sort(function(a, b) { return +b[colorRadio] - a[colorRadio]; });
            } else {
                data.sort(function(a, b) { return +b.revenue - a.revenue; });
            }
        }
        var vmin = d3.min(data, function(d) { return d[colorRadio]; }),
            vmax = d3.max(data, function(d) { return d[colorRadio]; });

        // Scaling domains
        xScale.domain(data.map(function(d) { return d.title; }));
        yScale.domain([0, d3.max(data, function(d) { return d.revenue; })]);

        // Add bar rectangles
        mainGraph.selectAll(".bar")
            .remove().exit()  // Enable update
            .data(data)
            .enter().append("rect")
            .attr("id", function(d, i) { return "rect" + i; })  // d: current datapoint
            .attr("class", "bar")
            .attr("fill", function(d) { return barColor(d); })
            .attr("x", function(d) { return xScale(d.title); })
            .attr("width", xScale.bandwidth())
            .attr("y", function(d) { return yScale(d.revenue); })
            .attr("height", function(d) { return height - yScale(d.revenue); })
            // Mouse Event
            .on("mouseover", function(d, i) {
                d3.select(this).attr("fill", hoverColor);
                movieInfo(d.movie_id);  // Read Movie Info
                textDiv.transition().duration(150)
                    .style("opacity", .9)
                    .style("background-color", "wheat")
                    .style("left", placeXDiv(d3.event.pageX, offsets.x) + "px")
                    .style("top", d3.event.pageY + offsets.y + "px");
            })
            .on("mousemove", function(d, i) {
                if (textDiv.style("opacity") > 0) { 
                    textDiv.style("left", placeXDiv(d3.event.pageX, offsets.x) + "px")
                        .style("top", d3.event.pageY + offsets.y + "px");
                }
            })
            .on("mouseout", function(d, i) {
                textDiv.style("opacity", 0)
                d3.select(this).transition().duration(300)
                    .attr("fill", barColor(d));
                textDiv.selectAll("h1").remove();
                textDiv.selectAll("p").remove();
            });
        
        // Color Theme by Radio Button
        function barColor(d) {
            var colorseq = d3.scaleLinear().domain([vmin, vmax])
                .range(["lightgray", "black"])
            return colorseq(d[colorRadio]);
        }

        // Display information of movie with id = #k
        function movieInfo(k) {
            var tempData = data.filter(function (row) {
                return row["movie_id"] == k;
            });
            currentMovie = tempData[0]
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
            textDiv.append("p").attr("style", "text-align:right;")
                .html("(<i>Click for details</i>)");
            // Add class for all these <p>
            textDiv.selectAll("p").attr("class", "tooltip");
        }

        // Add axes
        var drawYAxis = d3.axisLeft(yScale).tickFormat(d3.format(".2s"));

        var zY = svg.append("g")
            .style("font-size", "16px")
            .attr("transform", 
                "translate(" + margin.left + ",0)")
            .call(drawYAxis);
        svg.append("text").attr("class", "y-axis")
            .attr("x", 10)
            .attr("y", 15)
            .attr("text-anchor", "right")
            .text("Revenue");
    });
}
