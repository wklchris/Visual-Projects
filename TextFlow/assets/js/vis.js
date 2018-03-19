var margin = {top: 30, bottom: 20, left: 30, right: 30};
var width = {cloud: 480, timeline: 960, river: 1200, keywords: 540};
var height = {cloud: 400, timeline: 400, timeline_text: 20, river: 600, branch: 8};
var people = ["trump", "hillary", "ryan", "sanders"];
var dropdown_options = Array.from(new Array(10), (val, index) => "topic " + (index+1)).concat("all");
var months = ["Mar 2017", "Apr 2017", "May 2017", "Jun 2017", "Jul 2017", "Aug 2017",
              "Sep 2017", "Oct 2017", "Nov 2017", "Dec 2017", "Jan 2018", "Feb 2018"];
var months_dict = {"2017-03": 0.5, "2017-04": 1.5, "2017-05": 2.5, "2017-06": 3.5, "2017-07": 4.5, "2017-08": 5.5,
                   "2017-09": 6.5, "2017-10": 7.5, "2017-11": 8.5, "2017-12": 9.5, "2018-01": 10.5, "2018-02": 11.5};
var timeline_text_length = 15;
var topics = Array.from(new Array(10), (val, index) => index); // 0...9
function toName(d) { return d[0].toUpperCase() + d.slice(1); }


// Word Cloud

var div_top = d3.select("body").append("div").style("margin", "0 auto");
var div_cloud = div_top.append("div")
    .attr("id", "div_cloud")
    .style("display", "inline-block");
var div_cloud_dropdown = div_cloud.append("div");
div_cloud_dropdown.append("p").html("<b>Tag cloud</b> - Select a topic to see 20 most frequent tags:");
var dropdown_cloud = div_cloud_dropdown.append("select").attr("id", "dropdown")
        .on("change", function() {
            drawCloud(d3.select(this).property('value'));
            drawTimeline();
        });
dropdown_cloud.selectAll("option")
    .data(dropdown_options)
        .enter().append("option")
        .attr("value", function(d, i) { return d[0] == "t" ? i : -1; })
        .text(function(d, i) { return toName(d); });
var svg_cloud = div_cloud.append("svg")
        .attr("width", width.cloud)
        .attr("height", height.cloud);
var g_cloud = svg_cloud.append("g")
        .attr("transform", "translate(" + width.cloud/2 + "," + height.cloud/2 + ")");
var mousetext_cloud = div_cloud.append("div")
        .attr("class", "tooltip").style("visibility", "hidden");
mousetext_cloud.append("p");
var color_cloud = d3.scaleOrdinal()
    .domain(Array.from(new Array(10), (val, index) => index).concat(-1))
    .range(d3.schemeCategory10.concat("black"));
var num_included = 20;

d3.select("#dropdown").property('value', "-1");
drawCloud(d3.select("#dropdown").property('value'));

function drawCloud(topic_name) {
    d3.queue()
    .defer(d3.csv, "data/freq_topic.csv")
    .defer(d3.csv, "data/frequency_by_month.csv")
    .await(function(error, data_topics, data) {
        if (error) throw error;
    // d3.csv("data/frequency_by_month.csv", function(data) {
        data.forEach(function(d) { d.total = +d.total; d.topic = +d.topic; })
        var current_data = +topic_name >= 0 ? data.filter(function(d) { return  d.topic == topic_name; })
                                            : data_topics;
        var font_size = d3.scalePow().exponent(3)
            .domain(d3.extent(current_data.slice(0,num_included), function(d) { return d.total; }))
            .range([35, 75]);
        var layout_cloud = d3.layout.cloud()
            .size([width.cloud, height.cloud])
            .words(current_data.slice(0,num_included))
            .text(function(d) { return d.word; })
            .rotate(function() { return 0; })
            .fontSize(function(d) { return font_size(d.total); })
            .fontWeight("bold")
            .on("end", draw_cloud);

        layout_cloud.start();
        
        function draw_cloud(x) {
            g_cloud.selectAll("text").remove();
            g_cloud.selectAll("text").data(x).enter().append("text")
                .attr("class", "word")
                .attr("text-anchor", "middle")
                .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate +")"; })
                .style("fill", function(d) { return +topic_name >= 0 ? color_cloud(+d.topic) : "black"; })
                .style("font-size", function(d) { return font_size(d.total) + "px"; })
                .style("font-weight", function(d, i) { return i>9 ? "normal" : "bold"; })
                .text(function(d) { return d.word; })
                .on("mouseover", function(d, i) {
                    mousetext_cloud.select("p")
                        .html(freqText(d, topic_name === "all"))
                        .style("color", d3.select(this).style("fill"));
                    mousetext_cloud
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")
                        .style("visibility", "visible");
                })
                .on("mouseout", function(d, i) {
                    mousetext_cloud.style("visibility", "hidden");
                });
            
            function freqText(x, isAllCloud) {
                var t = '"<i>' + x.word + '</i>"<br />Frequency: ' + x.total;
                return t;
            }
        }
    });
}


// Timeline

var div_timeline = div_top.append("div")
    .attr("id", "div_timeline")
    .style("display", "inline-block");
var div_timeline_checked = div_timeline.append("div");
div_timeline_checked.append("p")
    .html("<b>Time Line</b> - Highest ranked twitters of each topic in last 12 months.");
var form_checked = div_timeline_checked.append("form");
form_checked.append("input").attr("id", "timeline_checkbox")
    .attr("type", "checkbox")
    .attr("name", "isShown").attr("value", "shown")
    .attr("checked", "checked")
    .on("change", function() {
        if (d3.select("#timeline_checkbox").property("checked")) {
            g_timeline.selectAll("text").text(function(d) { return d.cleaned_text; });
        } else {
            g_timeline.selectAll("text").text(function(d) { return d.text; });
        }
    });
form_checked.append("label").text("Show cleansed Twitter text");

var svg_timeline = div_timeline.append("svg")
        .attr("width", width.timeline)
        .attr("height", height.timeline);
var filter_timeline = svg_timeline.selectAll("defs")
    .data(d3.schemeCategory10).enter()
    .append("defs").append("filter")
        .attr("id", function(d, i) { return "filter_" + i; })
        .attr("x", 0).attr("y", 0)
        .attr("width", 1).attr("height", 1);
filter_timeline.append("feFlood")
    .attr("id", function(d, i) { return "feFlood_" + i; })
    .attr("flood-color", function(d) { return d; })
    .attr("flood-opacity", 0.5);
filter_timeline.append("feComposite").attr("in", "SourceGraphic");

var g_timeline = svg_timeline.append("g").attr("id", "g_timeline");
var cp_timeline = Array.from(new Array(11), (val, index) => index + 1);
var mousetext_timeline = div_timeline.append("div")
        .attr("class", "tooltip").style("visibility", "hidden");
mousetext_timeline.append("p");


var xScale_timeline = d3.scaleQuantize().domain([0, 12])
    .range(Array.from(new Array(12), (val, index) => (index) / 12 * width.timeline));
var yScale_timeline = d3.scaleOrdinal().domain(people)
    .range(Array.from(new Array(4), (val, index) => (index + 1) / 4 * (height.timeline - margin.bottom)));

drawTimeline();
function drawTimeline() {
    d3.csv("data/timeline_event.csv", function(data) {
        // X-axis
        var xAxis = svg_timeline.append("g")
            .call(d3.axisBottom(d3.scaleQuantize()
                .domain([0, 11])
                .range(Array.from(new Array(12), (val, index) => (index) / 12 * width.timeline + 8)))
            );
        xAxis.selectAll("text").data(months).style("text-anchor", "start")
            .text(function(d) { return d; });
        var guideline = xAxis.selectAll("line").attr("class", "xaxis")
            .attr("id", function(d, i) { return "gl_" + i; })
            .attr("y2", function(d, i) {
                return (i+1)/13 * height.timeline - height.timeline_text/2;
            })
            .attr("stroke-width", 10).attr("stroke-opacity", 0.5)
            .style("visibility", "hidden");
        
        // Main timeline
        data.forEach(function(d) { d.topic = +d.topic; d.score = +d.score; });
        var selected_topic = +d3.select("#dropdown").property('value');
        var current_data = data; // sorted by month, then score
        if (selected_topic >= 0) {
            current_data = data.filter(function(d) { return selected_topic == d.topic; });
            current_data = current_data.slice(0,12);
        } else {
            current_data = data.filter(function(d, i) { return i % 10 == 0; });
        }

        g_timeline.selectAll("text").remove();
        g_timeline.selectAll("text")
            .data(current_data).enter()
            .append("text").attr("class", "timeline_text")
            .attr("id", function(d, i) { return "tl_text_" + i; })
            .attr("filter", function(d, i) { return "url(#filter_" + d.topic + ")"; })
            .attr("x", function(d, i) {
                return width.timeline/48 * (i > 5 ? 33+i : i) + (i>5 ? 13 : 4);
            })
            .attr("y", function(d, i) { return (i+1)/13 * height.timeline; })
            .attr("dy", 0.3 + "em")
            .attr("text-anchor", function(d, i) { return i>5 ? "end" : "start"; })
            .text(function(d) {
                return d3.select("#timeline_checkbox").property("checked") ? d.cleaned_text : d.text;
            })
            .on("mouseover", function(d, i) {
                svg_timeline.select("#gl_" + i)
                    .attr("stroke", color_cloud(d.topic))
                    .style("visibility", "visible");
                svg_timeline.select("#tl_text" + i).style("opacity", 0.8);
                mousetext_timeline.select("p")
                    .html("<i>Highest ranked Twitter</i> (" + months[i] + ", "
                        + (selected_topic < 0 ? "all topics" : "topic "
                        + (selected_topic+1)) + "):<br /><br />" + d.text);
                mousetext_timeline
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + 30 + "px")
                    .style("visibility", "visible");
            })
            .on("mouseout", function(d) {
                svg_timeline.selectAll("line.xaxis").style("visibility", "hidden");
                mousetext_timeline.style("visibility", "hidden");
            });
    });
}


// River
var div_river = d3.select("body").append("div").attr("id", "div_river");
var div_river_checked = div_river.append("div");
div_river_checked.append("p")
    .html("<b>River Flow</b> - Rivers of topics in the last 12 months.");
var form_river_checked = div_river_checked.append("form");
form_river_checked.append("input").attr("id", "river_checkbox")
    .attr("type", "checkbox")
    .attr("name", "isShown").attr("value", "shown")
    .attr("checked", "checked")
    .on("change", resetRiverView);
form_river_checked.append("label").text("Hide subdivided flow");

var svg_river = div_river.append("svg")
    .attr("width", width.river)
    .attr("height", height.river)
    .style("display", "inline-block");
var color_river = d3.scaleOrdinal()
    .domain(Array.from(new Array(10), (val, index) => index))
    .range(d3.schemeCategory10);
var div_keywords = div_river.append("div")
    .attr("width", width.keywords)
    .style("display", "inline-block")
    .style("vertical-align", "top");
div_keywords.append("p").html("Multiselect key words below:").style("display", "block");
var form_keywords = div_keywords.append("form").attr("id", "form_keyword")
    .selectAll("input").data(["a", "b", "c"]).enter().append("div");
form_keywords.append("input").attr("type", "checkbox")
    .attr("name", "isShown").attr("value", "shown")
    .attr("checked", "checked");
form_keywords.append("label").text(function(d) { return d; })

var mousetext_river = div_river.append("div")
    .attr("class", "tooltip").style("visibility", "hidden");
mousetext_river.append("p").html("Hello");

var xScale_river = d3.scaleQuantize().domain([0,12])
    .range(Array.from(new Array(12), (val, index) => (index+0.5) / 12 * width.river));
var yScale_river = d3.scaleOrdinal().domain(topics)
    .range(Array.from(new Array(10), (val, index) => (index+0.5) / 10 * height.river));

drawRiver();
function drawRiver() {
    svg_river.selectAll("g").remove();
    // X-Axis
    var xAxis = svg_river.append("g").attr("transform", "translate(0," + 9 + ")")
    .call(d3.axisBottom(
        d3.scaleQuantize().domain([0,11])
            .range(Array.from(new Array(12), (val, index) => (index+0.5) / 12 * width.river))
    ));
    xAxis.selectAll("text").data(months).style("text-anchor", "middle")
        .text(function(d) { return d; });
    xAxis.selectAll("line").attr("y2", height.river - 9);
    xAxis.selectAll("text").attr("y", -9);
    // River Graph
    for (var topic_ind of topics) {     
        draw_single_river(topic_ind);
    }
}

function draw_single_river(t) {
    d3.queue()
    .defer(d3.csv, "data/topic_transform.csv")
    .defer(d3.csv, "data/all_theme_with_y.csv")
    .await(function(error, data_transf, data) {
        if (error) throw error;

        // Topic data
        var current_data = data.filter(function(d) {
            return d.topic_index == t;
        });
        current_data.forEach(function(d) {
            d.number = +d.number;
            d.topic_index = +d.topic_index;
        });

        var transf_data = data_transf.filter(function(d) {
            return d.topic1 == t;
        });
        transf_data.forEach(function(d) {
            d.topic1 = +d.topic1;
            d.topic2 = +d.topic2;
            d.Num = +d.Num;
        });

        // Draw Branch Rivers from current topic
        var g_branch = svg_river.append("g")
            .attr("id", "g_branch"+t)
            .attr("class", "g_branch");
        g_branch.selectAll("path")
            .data(transf_data).enter()
            .append("path")
            .attr("class", "branch")
            .attr("from", t).attr("to", function(d) { return d.topic2; })
            .attr("d", function(d) {
                var origin_river = current_data.filter(function(x) {
                    return x.time == d.month;
                })[0];
                var next_month = Object.keys(months_dict)[Object.keys(months_dict).indexOf(d.month) + 1];
                var dest_river = data.filter(function(x){
                    return x.time == next_month && x.topic_index == d.topic2;
                })[0];
                var x1 = xScale_river(months_dict[d.month]),
                    x2 = xScale_river(months_dict[next_month]);
                var y10 = origin_river.y0, y11 = origin_river.y1,
                    y20 = +dest_river.y0, y21 = +dest_river.y1;
                // Gradient Color
                var gc = g_branch.append("defs").append("linearGradient")
                    .attr("id", "lg" + d.topic1 + "to" + d.topic2)
                    .attr("x1", "0%").attr("x2", "0%")
                    .attr("y1", "0%").attr("y2", "100%");
                gc.append("stop").attr("offset", "0%").style("stop-color", color_river(topics.indexOf(t)));
                gc.append("stop").attr("offset", "100%")
                    .style("stop-color", color_river(topics.indexOf(d.topic2)));
                var gc_vert = g_branch.append("defs").append("linearGradient")
                    .attr("id", "lg_vert" + d.topic1 + "to" + d.topic2)
                    .attr("x1", "0%").attr("x2", "0%")
                    .attr("y1", "100%").attr("y2", "0%");
                gc_vert.append("stop").attr("offset", "0%").style("stop-color", color_river(topics.indexOf(t)));
                gc_vert.append("stop").attr("offset", "100%")
                    .style("stop-color", color_river(topics.indexOf(d.topic2)));

                if (d.topic1 < d.topic2) {
                    return "M" + x1+","+(y11-height.branch)
                        + "C" + x2+","+y11 +","+ x1+","+y20 +","+ x2+","+y20
                        + "L" + x2+","+(y20+height.branch)
                        + "C" + x1+","+(y20+height.branch) +","+ x2+","+y11 +","+ x1+","+y11
                        + "Z";
                } else {
                    return "M" + x1+","+y10
                        + "C" + x2+","+y10 +","+ x1+","+(y21-height.branch) +","+ x2+","+(y21-height.branch)
                        + "L" + x2+","+y21
                        + "C" + x1+","+y21 +","+ x2+","+(y11+height.branch) +","+ x1+","+(y11+height.branch)
                        + "Z";
                }
            })
            .attr("fill", function(d) {
                return d.topic1 < d.topic2 ? "url(#lg" + d.topic1 + "to" + d.topic2 + ")"
                            : "url(#lg_vert" + d.topic1 + "to" + d.topic2 + ")";
            });
        resetRiverView(true);
        
        // Draw Main Rivers
        var area = d3.area()
            .curve(d3.curveCardinal)
            .x(function(d) { return xScale_river(months_dict[d.time]); })
            .y1(function(d, i) { return d.y1; })
            .y0(function(d, i) { return d.y0; });
        
        var g_river = svg_river.append("g")
            .attr("class", "g_river")
            .attr("id", "g_river" + t);
        g_river.datum(current_data);
        g_river.append("path").attr("class", "river")
            .attr("id", "path_river" + t)
            .attr("d", area)
            .attr("fill", color_river(t))
            .on("click", function(d) {
                d3.select("#dropdown").property('value', d[0].topic_index);
                dropdown_cloud.dispatch("change");
            })
            .on("mouseover", function(d) {
                // Show text
                mousetext_river.select("p")
                    .style("color", d3.select(this).style("fill"))
                    .html("<i>Top Words of Topic " + (t+1) + ":</i><br /><br />" + d[0].content);
                mousetext_river
                    .style("left", d3.event.pageX + 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("visibility", "visible");
                // Fade out other rivers
                svg_river.selectAll(".g_branch").style("visibility", "hidden");
                svg_river.select("#g_branch" + d[0].topic_index)
                    .style("visibility", "visible").style("opacity", 0.8);
                svg_river.selectAll(".river")
                    .style("opacity", 0.7);
                d3.select(this).style("opacity", 1);
             })
            .on("mouseout", function(d) {
                mousetext_river.style("visibility", "hidden");
                resetRiverView();
             });
    });
}

function resetRiverView() {
    svg_river.selectAll(".g_branch")
        .style("visibility", d3.select("#river_checkbox").property("checked") ? 
                                "hidden" : "visible");
    svg_river.selectAll(".river").style("opacity", 1);
    svg_river.selectAll(".g_branch").style("opacity", 0.15);
}
