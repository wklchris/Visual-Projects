// These Data are derived from the preprocess step
var genres_group = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
                    'Documentary', 'Drama', 'Family', 'Fantasy', 'Foreign',
                    'History', 'Horror', 'Music', 'Mystery', 'Romance',
                    'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western']
var genres_color = ["#F44336", "#E91E63", "#9C27B0", "#8366B7", "#3F51B5",
                    "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", 
                    "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", 
                    "#FF5722", "#795548", "#9E9E9E", "#607D8B", "#000000"];
var genres_flow = [
    [0,465,26,258,276,3,339,62,144,5,58,76,9,57,63,277,1,547,55,35],
    [465,0,114,223,56,2,183,211,190,2,27,20,7,37,66,205,0,203,30,22],
    [26,114,0,125,0,0,19,195,61,1,0,0,14,1,8,30,1,3,1,2],
    [258,223,125,0,180,11,576,299,166,9,11,78,84,27,484,109,4,113,8,17],
    [276,56,0,180,0,1,381,8,10,4,13,36,11,105,47,18,1,414,4,9],
    [3,2,0,11,1,0,7,5,0,2,6,1,15,1,0,0,0,1,0,0],
    [339,183,19,576,381,7,0,121,99,27,175,84,106,175,603,102,5,554,118,34],
    [62,211,195,299,8,5,121,0,149,3,1,1,32,6,52,58,3,7,0,3],
    [144,190,61,166,10,0,99,149,0,0,0,53,11,19,64,85,0,63,3,2],
    [5,2,1,9,4,2,27,3,0,0,3,0,0,0,9,0,0,3,1,0],
    [58,27,0,11,13,6,175,1,0,3,0,1,6,3,30,0,0,21,59,8],
    [76,20,0,78,36,1,84,1,53,0,1,0,3,91,15,95,1,291,1,1],
    [9,7,14,84,11,15,106,32,11,0,6,3,0,3,61,2,1,5,1,3],
    [57,37,1,27,105,1,175,6,19,0,3,91,3,0,24,47,0,242,3,2],
    [63,66,8,484,47,0,603,52,64,9,30,15,61,24,0,31,3,64,26,12],
    [277,205,30,109,18,0,102,58,85,0,0,95,2,47,31,0,0,211,2,1],
    [1,0,1,4,1,0,5,3,0,0,0,1,1,0,3,0,0,1,0,0],
    [547,203,3,113,414,1,554,7,63,3,21,291,5,242,64,211,1,0,24,7],
    [55,30,1,8,4,0,118,0,3,1,59,1,1,3,26,2,0,24,0,3],
    [35,22,2,17,9,0,34,3,2,0,8,1,3,2,12,1,0,7,3,0]
];

/* **
** Chord Diagram
** */

var width = {chord: 0.9 * window.innerHeight},
    height = {chord: 0.9 * window.innerHeight};
    radius = {chord_outer: width.chord / 2 - 20,
              chord_inner: width.chord / 2 - 50};
var svg_chord = d3.select("body").append("svg")
        .attr("id", "svg_chord")
        .attr("width", width.chord)
        .attr("height", height.chord);

// Set the chord layout
var chord_layout = d3.chord().padAngle(0.03);
var chord_ribbon = d3.ribbon().radius(radius.chord_inner);
var chord_graph = svg_chord.append("g")
        .datum(chord_layout(genres_flow))
        .attr("transform", "translate(" + width.chord/2 + "," + height.chord/2 + ")");
// Draw the arc region
var chord_groups = chord_graph.append("g")
            .attr("class", "chord_groups")
        .selectAll("g")
            .data(function(d) { return d.groups; })
            .enter().append("g");
chord_groups.append("path")
        .style("fill", function(d) { return d3.rgb(genres_color[d.index]); })
        .style("stroke", "white")
        .attr("class", "chordArc")
        .attr("id", function(d) { return "chordArc" + d.index; })
        .attr("d", d3.arc().innerRadius(radius.chord_inner).outerRadius(radius.chord_outer));

// Draw ticks
// var chord_ticks = chord_groups.selectAll(".chord_ticks")
//         .data(function(d) { return setChordTicks(d, 50); } )
//         .enter().append("g")
//             .attr("class", "chord_ticks")
//             .attr("transform", function(d) {
//                 return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + radius.chord_outer + ",0)";
//             });
// chord_ticks.append("line").attr("x2", 6);
// chord_ticks.filter(function(d) { return d.value != 0 && d.value % 400 === 0; })
//         .append("text")
//              .attr("x", 8).attr("dy", "0.35em")  // Vertical centre
//              .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null })
//              .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
//              .text(function(d) { return d.value; });

// function setChordTicks(arcs, step) {
//     var gap = (arcs.endAngle - arcs.startAngle) / arcs.value;
//     return d3.range(0, arcs.value, step).map(function(d) {
//         return {value: d, angle: +arcs.startAngle + (arcs.endAngle - arcs.startAngle) / arcs.value * d};
//     });
// }

// Draw ribbons
chord_graph.append("g").attr("class", "chord_ribbons")
        .selectAll("path")
        .data(function(d) { return d; }).enter()
    .append("path")
        .attr("class", "chordRibbon")
        .attr("source", function(d) { return d.source.index; })
        .attr("id", function(d) { return "chordRibbon" + d.source.index + "-" + d.target.index; })
        .attr("d", chord_ribbon)
        .style("fill", function(d) {
            var fillRibbons = d3.interpolateRgb(genres_color[d.source.index], genres_color[d.target.index]);
            return fillRibbons(0.5);
        })
        .style("stroke", "lightgray")

// Define mouse events
d3.selectAll(".chordArc")
        .on("mouseover", function(d, i) {
            //d3.selectAll(".chordArc:not(#" + this.id + ")").attr("visibility", "hidden");
            d3.selectAll(".chordRibbon").filter(function(x) { return x.source.index != i && x.target.index != i; })
                .attr("visibility", "hidden");
        })
        .on("mouseout", function(d, i) {
            d3.selectAll(".chordRibbon").attr("visibility", "visible");
        })
