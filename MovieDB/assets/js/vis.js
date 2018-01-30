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
var info_strs = ["title", "genres", "popularity", "budget", "revenue",
                 "release_date", "vote_average", "vote_count", "runtime", 
                 "production_companies", "tagline"];

var width = {
        textbox: 200,
        chord: Math.max(0.65 * window.innerHeight, 400),
        bar: 0.95*window.innerWidth
    };
var height_brush = 50;
var height = {textbox: 100, chord: width.chord,
              bar: 0.95*window.innerHeight - width.chord - height_brush};
    radius = {chord_outer: width.chord / 2 - 20,
              chord_inner: width.chord / 2 - 50};
height.parcoords = height.chord - 300;

d3.csv("data/data.csv", function(error, csvdata) {
    if (error) throw error;
    
    csvdata.forEach(function(d) {
        d.budget = +d.budget;
        d.revenue = +d.revenue;
        d.vote_average = +d.vote_average;
        d.vote_count = +d.vote_count;
        d.popularity = d3.format(".2f")(+d.popularity);
        d.runtime = +d.runtime > 0 ? d.runtime + " minutes" : "Unknown";
    });
    var current_data = csvdata;

    /* **
    ** Chord Diagram
    ** */

    var svg_chord = d3.select("body").append("div")
            .attr("id", "div_chord")
            .style("width", width.chord + 200 + "px")  // 200: Legend width
            .style("height", height.chord)
            .style("display", "inline-block")
        .append("svg").attr("id", "svg_chord")
            .attr("width", width.chord + 200).attr("height", height.chord);
    // Initialize the pop-up textbox
    var movieInfoTextbox = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")
            .style("background-color", "wheat")
            .style("width", width.textbox + "px")
            .style("left", width.chord/2 - width.textbox/2 + "px")
            .style("top", height.chord/2 - height.textbox/2 + "px");
    movieInfoTextbox.append("p").attr("id", "chord_info")
            .style("text-align", "center");

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

    // Draw the color legend
    var legend_chord = svg_chord.append("g")
            .selectAll("g").data(genres_color).enter()
            .append("g");
    legend_chord.append("rect")
            .attr("fill", function(d) { return d; })
            .attr("x", width.chord + 10)
            .attr("y", function(d, i) { return height.chord/2 - height.chord/30*(10-i); })
            .attr("width", 30).attr("height", height.chord/40);
    legend_chord.append("text")
            .attr("class", "legend_text")
            .attr("id", function(d, i) {return "legend" + i; })
            .attr("alignment-baseline", "middle")
            .attr("x", width.chord + 50)
            .attr("y", function(d, i) { return height.chord /80*41 - height.chord/30*(10-i); })
            .text(function(d, i) { return genres_group[i]; });

    // Define mouse events
    var chord_clicked = {source: -1, target: -1, stage: 0};  // stage: 0 for neither, 1 for source, 2 for both.
    d3.selectAll(".chordArc")
        .on("mouseover", function(d, i) {
            showMovieInfo(chord_clicked.stage == 0 ? i : chord_clicked.source,
                chord_clicked.stage == 0 ? chord_clicked.source : i);
            if (chord_clicked.stage == 2) { return; }
            chord_clicked.stage == 0 ? showSourceRibbons(i) : showBothRibbons(i);
            d3.selectAll("#legend" + i).attr("font-weight", "800");
        })
        .on("mouseout", function(d, i) {
            movieInfoTextbox.style("visibility", "hidden");
            if (chord_clicked.stage == 0) {
                d3.selectAll(".chordRibbon").attr("visibility", "visible");
            } else if (chord_clicked.stage == 1) {
                showSourceRibbons(chord_clicked.source);
            } else { showBothRibbons(chord_clicked.target); }
            d3.selectAll("#legend" + i).attr("font-weight", 
                i == chord_clicked.source || i == chord_clicked.target ? "800" : "normal");
        })
        .on("click", function(d, i) {
            if (chord_clicked.stage == 0) {
                d3.selectAll("#legend" + i).attr("font-weight", "800");
                chord_clicked.source = i;
                chord_clicked.stage = 1;
            } else if (chord_clicked.stage == 1) {
                d3.selectAll("#legend" + i).attr("font-weight", "800");
                chord_clicked.target = i;
                chord_clicked.stage = 2;
            } else {
                d3.selectAll(".legend_text").attr("font-weight", "normal");
                chord_clicked.source = -1;
                chord_clicked.target = -1;
                chord_clicked.stage = 0;
            }
            updateSelection();
            updateBrushParcoords();
        });

    function showSourceRibbons(i) {
        d3.selectAll(".chordRibbon").attr("visibility", "visible");
        d3.selectAll(".chordRibbon")
            .filter(function(x) { return x.source.index != i && x.target.index != i; })
            .attr("visibility", "hidden");
    }

    function showBothRibbons(i) {
        d3.selectAll(".chordRibbon").attr("visibility", "visible");
        d3.selectAll(".chordRibbon")
            .filter(function(x) {
                return !((x.source.index == chord_clicked.source && x.target.index == i)
                    || (x.target.index == chord_clicked.source && x.source.index == i));
            })
            .attr("visibility", "hidden");
    }

    // Side Textbox
    function showMovieInfo(s, t) {
        movieInfoTextbox.style("visibility", "visible");
        var count = 0;
        if (chord_clicked.stage == 0) {
            csvdata.forEach(function(d) { 
                if (d.genres.split(", ").indexOf(genres_group[s]) > -1) {
                    count = count + 1;
                }
            })
            movieInfoTextbox.select("#chord_info")
                .html("Movies under <b>" + genres_group[s] + "</b>: "
                    + count
                    + "<br /><br /><i>(Click for detail views)</i>");
        } else if (chord_clicked.stage == 1) {
            movieInfoTextbox.select("#chord_info")
                .html("<i>(Click to view movies with both " + genres_group[s]
                      + " and " + genres_group[t] + " genres)</i>");
        } else {
            movieInfoTextbox.select("#chord_info")
                .html("<i>(Click any genre to reset selection)</i>");
        }
    }

    /* **
    ** Parellal Coordinates & Bar Diagram
    ** */

    var aside = d3.select("body").append("div")
        .attr("class", "tooltip")
        .attr("id", "div_aside")
        .style("display", "inline-block")
        .style("width", 0.95*window.innerWidth - width.chord - 200 + "px")
        .style("height", height.chord + "px");
    var parcoords_width = +aside.style("width").slice(0, -2);
    var parcoords_graph = aside.append("div")
            .style("width", "100%")
            .style("height", height.chord - 300 + "px")
        .append("svg").attr("id", "svg_parcoords")
            .style("width", parcoords_width + "px");
    var info_detail = aside.append("div")
        .style("background-color", "wheat")
        .style("width", "100%");
    info_detail.selectAll("p").data(info_strs)
        .enter().append("p").attr("class", "tooltip");
    var svg_bar = d3.select("body").append("div")
            .attr("id", "div_bar")
            .style("width", width.bar + "px")
        .append("svg").attr("id", "svg_bar")
            .style("width", width.bar + "px")
            .style("height", height.bar + "px");
    var bar_graph = svg_bar.append("g").attr("id", "g_bar");
    var bar_color = {normal: "orange", hover: "gray"};
    var bar_xScale = d3.scaleBand()
        .domain(csvdata.map(function(d) { return d.title; }))
        .range([0, width.bar]).padding(0.12);
    var bar_yScale = d3.scaleLinear()
        .domain([0, d3.max(csvdata, function(d) { return +d.popularity; })])
        .range([height.bar, 0]);
    var dummy_height = 10;  // For easy mouse-on


    // Draw X-axis brushbar
    var brush_graph = d3.select("#div_bar")
            .style("width", width.bar + "px")
            .style("height", height_brush + "px")
        .append("svg").attr("id", "svg_brushbar")
            .style("width", width.bar + "px")
            .style("height", height_brush + "px")
        .append("g");
    var brush_text = d3.select("#svg_brushbar").append("text")
        .attr("x", width.bar - 2).attr("y", 15).attr("font-size", 12)
        .style("text-anchor", "end");
    var xScale_brush = d3.scaleBand()
        .domain(csvdata.map(function(d) { return d.title; }))
        .range([0, width.bar]);
    var yScale_brush = d3.scaleLinear()
        .domain([0, d3.max(csvdata, function(d) { return +d.popularity; })])
        .range([height_brush, 0]);
    var brush = d3.brushX().extent([[0, 0], [width.bar, height_brush]])
        .on("brush", brushed);

    /* **
    ** Parallel Coordinates Diagram
    ** */

    var budget_xScale = d3.scaleLinear()
        .domain([0, d3.max(csvdata, function(d) { return +d.budget; })])
        .range([0, parcoords_width]);
    var revenue_xScale = d3.scaleLinear()
        .domain([0, d3.max(csvdata, function(d) { return +d.revenue; })])
        .range([0, parcoords_width]);
    var parcoords_yScale = {
            budget: height.parcoords/4,
            revenue: height.parcoords/4*3
        };
    var budget_text = parcoords_graph.append("text")
        .attr("x", parcoords_width - 2).attr("y", 15)
        .attr("font-size", 14)
        .style("text-anchor", "end");
    var revenue_text = parcoords_graph.append("text")
        .attr("x", parcoords_width - 2).attr("y", 15 + height.parcoords/2)
        .attr("font-size", 14)
        .style("text-anchor", "end");
    // Draw 2 Parallel Coordinates
    var brush_budget_graph = parcoords_graph.append("g")
        .attr("id", "brush_budget")
        .style("height", height.parcoords);
    var brush_revenue_graph = parcoords_graph.append("g")
        .attr("id", "brush_revenue")
        .style("height", height.parcoords);
    var budget_brush = d3.brushX()
        .extent([[0, height.parcoords/4 - 15],
                 [parcoords_width, height.parcoords/4 + 15]])
        .on("brush", parcoords_brushed);
    var revenue_brush = d3.brushX()
        .extent([[0, height.parcoords/4*3 - 15],
            [parcoords_width, height.parcoords/4*3 + 15]])
        .on("brush", parcoords_brushed);
    // Lines between
    var brush_line_graph = parcoords_graph.append("g").attr("id", "brush_line");
    var brush_selection = {budget: [0, parcoords_width], revenue: [0, parcoords_width]};

    // Final Initialization
    updateBrushParcoords();
    updateInfo("init");

    /* Functions */

    function updateBrushBar() {
        brush_graph.selectAll("rect")
            .remove().exit()
            .data(csvdata.filter(function(d) {
                return bar_xScale.domain().indexOf(d.title) > -1;
            }))
            .enter().append("rect")
            .attr("fill", bar_color.normal)
            .attr("x", function(d) { return xScale_brush(d.title); })
            .attr("width", xScale_brush.bandwidth())
            .attr("y", function(d) { return yScale_brush(+d.popularity);})
            .attr("height", function(d) { return height_brush - yScale_brush(+d.popularity); })
        brush_graph.call(brush)
            .call(brush.move, [0, current_data.length > 200 ? width.bar/20 : 0.8*width.bar]);
    }
    
    function brushed() {
        var s = d3.event.selection,
            selectedBars = {title: [], y: []};
        current_data.forEach(function (d) {
            if (xScale_brush(d.title) > s[0]
                    && xScale_brush(d.title) < s[1]) {
                selectedBars.title.push(d.title);
                selectedBars.y.push(+d.popularity);
            }
        });
        // Update domains
        bar_xScale.domain(selectedBars.title);
        bar_yScale.domain([0, d3.max(selectedBars.y)]);
        // Update Graph
        updateBar();
    }
    
    function updateSelection() {
        // Selection by chord
        if (chord_clicked.stage == 0) {
            current_data = csvdata;
        } else {
            current_data = csvdata.filter(function(d, i) {
                var k = d.genres.split(", ");
                if (chord_clicked.stage == 1) {
                    if (k.indexOf(genres_group[chord_clicked.source]) > -1) { return d; }
                } else {
                    if (k.indexOf(genres_group[chord_clicked.source]) > -1 
                        && k.indexOf(genres_group[chord_clicked.target]) > -1) { return d;}
                }
            });
        }

        // Update bar_xScale (global)
        var s = [];
        current_data.forEach(function(d) { s.push(d.title); });
        bar_xScale.domain(s);
        bar_yScale.domain([0, d3.max(current_data, function(d) { return d.popularity; })]);

        // Update brushbar graph
        xScale_brush.domain(s);
        yScale_brush.domain([0, d3.max(current_data, function(d) { return +d.popularity; })]);
    }

    function updateBar() {
        bar_graph.selectAll("rect").remove();
        bar_graph.selectAll("rect")
            .data(csvdata.filter(function (d) {
                return bar_xScale.domain().indexOf(d.title) > -1;
            }))
            .enter().append("rect")
            .attr("id", function(d, i) { return "barrect" + i; })
            .attr("fill", bar_color.normal)
            .attr("x", function(d) { return bar_xScale(d.title); })
            .attr("y", function(d) { return bar_yScale(+d.popularity); })
            .attr("width", bar_xScale.bandwidth())
            .attr("height", function(d) { return height.bar - bar_yScale(+d.popularity) + dummy_height; })
            .attr("transform", "translate(0," + (-dummy_height) + ")")  // Reserved space
            .on("mouseover", updateInfo);
    }

    function updateInfo(movie) {
        bar_graph.selectAll("rect").attr("fill", bar_color.normal);
        if (movie === "init") {
            movie = current_data[0];
        } else { d3.select(this).attr("fill", bar_color.hover); } 
        info_detail.style("visibility", "visible")
            .style("background-color", "wheat")
        info_detail.selectAll("p")
            .html(function(d, i) {
                var s = info_strs[i].split("_").join(" ");
                s = s[0].toUpperCase() + s.slice(1) ;
                if (d == "budget" || d == "revenue") {  }
                return "<b>" + s + ": </b>" + (d == "budget" || d == "revenue"
                                                ? d3.format(".3s")(movie[d])
                                                : movie[d]);
                    
            });
    }

    function updateBrushParcoords(rebrush=true) {
        var tempdata = current_data.filter(function(d) {
            return bar_xScale.domain().indexOf(d.title) > -1;
        });
        budget_xScale.domain([0, d3.max(tempdata, function(d) { return +d.budget; })]);
        revenue_xScale.domain([0, d3.max(tempdata, function(d) { return +d.revenue; })]);
        brush_line_graph.selectAll(".brushline").remove();
        brush_line_graph.selectAll("line")
            .data(tempdata).enter()
            .append("line")
            .attr("class", "brushline")
            .style("stroke", "black")
            .style("opacity", 0.2)
            .attr("x1", function(d) { return budget_xScale(d.budget); })
            .attr("y1", function(d) { return parcoords_yScale.budget; })
            .attr("x2", function(d) { return revenue_xScale(d.revenue); })
            .attr("y2", function(d) { return parcoords_yScale.revenue; });
        brush_budget_graph.selectAll(".budget")
            .remove().exit()
            .data(tempdata)
            .enter().append("circle")
            .attr("class", "budget")
            .attr("stroke", "black")
            .attr("cx", function(d) { return budget_xScale(d.budget); })
            .attr("r", 5)
            .attr("cy", function(d) { return parcoords_yScale.budget; });
        brush_revenue_graph.selectAll(".revenue")
            .remove().exit()
            .data(tempdata)
            .enter().append("circle")
            .attr("class", "revenue")
            .attr("stroke", "black")
            .attr("cx", function(d) { return revenue_xScale(d.revenue); })
            .attr("r", 5)
            .attr("cy", function(d) { return parcoords_yScale.revenue; });
        if (rebrush) {
            brush_budget_graph.call(budget_brush)
                .call(budget_brush.move, [parcoords_width/4, parcoords_width/4*3]);
            brush_revenue_graph.call(revenue_brush)
                .call(revenue_brush.move, [parcoords_width/4, parcoords_width/4*3]);
        }
    }
    
    function parcoords_brushed() {
        var s = []; 
        brush_selection[this.id.slice(6)] = [d3.event.selection[0], d3.event.selection[1]];
        
        function filter_func(d) {
            if (budget_xScale(d.budget) >= brush_selection.budget[0]
            && budget_xScale(d.budget) <= brush_selection.budget[1]
            && revenue_xScale(d.revenue) >= brush_selection.revenue[0]
            && revenue_xScale(d.revenue) <= brush_selection.revenue[1]) {
                s.push(d.title);
                return d;
            }
        }

        updateSelection();
        current_data = current_data.filter(filter_func);
        bar_xScale.domain(s);
        bar_yScale.domain([0, d3.max(current_data, function(d) { return d.popularity; })]);
        xScale_brush.domain(s);
        yScale_brush.domain([0, d3.max(current_data, function(d) { return +d.popularity; })]);

        // Draw lines between coordinates
        d3.selectAll(".brushline").style("visibility", "hidden");
        var selectedlines = d3.selectAll(".brushline")
            .filter(filter_func);  // Do NOT use "s" below
        selectedlines.style("visibility", "visible");
        
        // Update parcoords
        budget_text.text("Budget: from "
            + d3.format(".3s")(budget_xScale.invert(brush_selection.budget[0]))
            + " to " + d3.format(".3s")(budget_xScale.invert(brush_selection.budget[1])));
        revenue_text.text("Revenue: from "
            +  d3.format(".3s")(revenue_xScale.invert(brush_selection.revenue[0]))
            + " to " +  d3.format(".3s")(revenue_xScale.invert(brush_selection.revenue[1])));
        
        // Update detailed view barchart
        brush_text.text("Popularity Bar Diagram. Total " + current_data.length + " movies under current filters.");
        updateBrushBar();
    }
});
