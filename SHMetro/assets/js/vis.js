var height = {main: 1200};
var width = {main: 1200, tooltip: 200};
var margin = {main: 30};
var version = "0.01-a"

var page_info = d3.select("body").append("div")
    .append("p")
    .html("<b>上海地铁时间图 Web 版 v" + version +'</b> by @wklchris @方包子, 更新日志请前往：<a href="https://github.com/wklchris/Visual-Projects/tree/master/SHMetro">Github 页面</a>。'
    + "<br /><br /><b>- 1 号线时间戳测试。(截至北京时间 26 日早 10 点)</b>");

var div = d3.select("body").append("div");
var svg = div.append("svg")
    .attr("width", width.main)
    .attr("height", height.main);
// Mouseover
var div_tooltip  = div.append("div")
    .attr("class", "tooltip")
    //.style("width", width.tooltip + "px")
    .style("visibility", "hidden");
div_tooltip.append("p").style("display", "inline-block");

// Bottom Info
d3.select("body").append("p").attr("class", "comment")
    .html("使用高分辨率设备浏览以获得较好体验。<br />本页面由 @wklchris 维护。");

drawMetro();
function drawMetro() {
    d3.csv("data/Coord-v3.1.csv", function(error, data) {
        if (error) throw error;

        data.forEach(function(d) {
            d.x = +d.x;
            d.y = +d.y;
            d.is_open = (d.is_open == "1" ? true : false);
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
            .attr("line", function(d) { return d.line; })
            .attr("cx", function(d) { return xScale(d.x); })
            .attr("cy", function(d) { return yScale(d.y); })
            .attr("r", 6)
            .style("fill", function(d) { return d.is_open ? "black" : "lightgray" })
            .on("mouseover", function(d) {
                // Show text
                div_tooltip.select("p")
                    .html(showStationInfo(d))
                    .style("color", d.is_open ? "black" : "gray");
                div_tooltip
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px")
                    .style("visibility", "visible");
                // Highlight all stations on this line
                d3.selectAll("circle")
                    .filter(function(x) { return x.line == d.line; })
                    .style("fill", "red");
            })
            .on("mouseout", function() {
                div_tooltip.style("visibility", "hidden");
                d3.selectAll("circle")
                    .style("fill", function(d) { return d.is_open ? "black" : "lightgray" });
            });
    });
}

function showStationInfo(d) {
    var s = d.type == "single" ? "" : "换乘站：";
    s += d.name + "（" + d.line + "）";
    s += " " + d.time;
    return s;
}