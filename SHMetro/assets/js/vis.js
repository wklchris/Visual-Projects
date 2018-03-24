var height = {main: 750};
var width = {main: 750};
var margin = {main: 30};

var div = d3.select("body").append("div");
var svg = div.append("svg")
    .attr("width", width.main)
    .attr("height", height.main);
// Mouseover
var div_tooltip  = div.append("div")
    .attr("class", "tooltip").style("visibility", "hidden");
div_tooltip.append("p");


drawMetro();
function drawMetro() {
    d3.csv("data/Coord-v3.1.csv", function(error, data) {
        if (error) throw error;

        data.forEach(function(d) {
            d.x = +d.x;
            d.y = +d.y;
        });

        var xScale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.x; }))
            .range([margin.main, width.main - margin.main]);
        var yScale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.y; }))
            .range([height.main - margin.main, margin.main]);
        
        svg.selectAll("circle")
            .data(data).enter()
          .append("circle")
            .attr("cx", function(d) { return xScale(d.x); })
            .attr("cy", function(d) { return yScale(d.y); })
            .attr("r", 5)
            .style("stroke", "black")
            .on("mouseover", function(d) {
                console.log(d);
                div_tooltip.select("p").html(d.name)
                div_tooltip
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px")
                    .style("visibility", "visible");
            });
    });
}