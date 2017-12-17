var nodeWidth = 200;
var nodeHeight = 150;
var thumbnailWidth = 180;
var thumbnailHeight = 100;
var nodeBackgroundColor = "#f8f3e6";
var nodeRefreshBackgroundColor = "#e9c77b";
var nodeDefaultStrokeColor = "#cccccc";

function loadAnchorTree(abstractedLogs) {
    var g = new dagreD3.graphlib.Graph()
        .setGraph({})
        .setDefaultEdgeLabel(function() { return; });

    abstractedLogs.forEach(function(stage) {
        // g.setNode(stage.stage,  { label: "TOP",       class: "type-TOP" });
        var nodeHtml = buildAnchorGlyphs(stage);

        g.setNode(stage.stage, {
            labelType: "html",
            label: nodeHtml,
            style: "fill: " + (stage.refresh ? nodeRefreshBackgroundColor : nodeBackgroundColor)
        });
    });
    g.nodes().forEach(function(v) {
        var node = g.node(v);
        // Round the corners of the nodes
        node.rx = node.ry = 5;
        node.width = nodeWidth;
        node.height = nodeHeight;
        node.id = "anchorNode" + v;
    });

    for (var fi = 0; fi < abstractedLogs.length; fi++) {
        var stage = abstractedLogs[fi];
        if (stage.parent != 0) {
            g.setEdge(stage.parent, stage.stage, { width: 25 });
        }
    }

    g.graph().rankDir = 'LR';
    var render = new dagreD3.render();
    var svg = d3.select("#anchorTreeSvg"),
        svgGroup = svg.append("g");

    render(d3.select("#anchorTreeSvg g"), g);
    // add vega-lite thumbnail
    abstractedLogs.forEach(function(stage) {
        if (stage.existThumbnail) {
            stage.thumbnailSvg = vegaLiteThumbnailSpec(stage.interactions[stage.interactions.length - 1].VlSpec, thumbnailWidth, thumbnailHeight);
            console.log(stage.thumbnailSvg);
            var opt = {
                mode: "vega-lite",
                actions: false,
                renderer: 'svg'
            };
            vegaEmbed("#nodeSvg" + stage.stage, stage.thumbnailSvg, opt, function(error, result) { //chartpane
                var tooltipOption = {
                    showAllFields: true,
                };
                vegaTooltip.vegaLite(result.view, stage.thumbnailSvg, tooltipOption);
            });
        }
    });

    var svg_marks = document.getElementsByClassName('marks');
    svg_marks[0].setAttribute("viewBox", "0 0 200 130");
    svg_marks[1].setAttribute("viewBox", "0 0 240 130");
    svg_marks[2].setAttribute("viewBox", "0 0 200 130");

    svg.selectAll("g.node").on("click", function(id) {
        var _node = g.node(id);
        clickAnchor(abstractedLogs[id - 1]);
    });

    d3.select("#anchorNode1").attr("transform", "translate(115,195)");
    d3.select("#anchorNode2").attr("transform", "translate(405,85)");
    d3.select("#anchorNode3").attr("transform", "translate(700,85)");
    d3.select("#anchorNode4").attr("transform", "translate(995,85)");
    findFavoriteAnchor(abstractedLogs);
}

function clickAnchor(anchor) {
    loadDetailInteraction(anchor.interactions);
    makeChart(anchor.interactions[anchor.interactions.length - 1].VlSpec, "chartPane");
    highlightAnchorNode(anchor.stage);
    highlightDetailNode(anchor.interactions[anchor.interactions.length - 1].index);
}

// highlight detailNode
function highlightAnchorNode(nodeId) {
    // reset
    var svg = d3.select("#anchorTreeSvg");
    svg.selectAll("rect")
        .style("stroke", nodeBackgroundColor)
        .style("stroke-width", "3px");

    svg.select("#anchorNode" + nodeId)
        .select("rect")
        .style("stroke", "#ab3e16")
        .style("stroke-width", "7px");
}


function buildAnchorGlyphs(anchor) {
    var html = "<div style='vertical-align:top'>";
    anchorInteraction = anchor.interactions[0];
    switch (anchorInteraction.category) {
        case "Arrange:Chart":
            html += "<div align=left>&nbsp;x: ";
            if (anchorInteraction.parameters.x_function !== undefined) html += "(" + anchorInteraction.parameters.x_function + ")";
            html += anchorInteraction.parameters.x;
            html += "<br/>&nbsp;y: ";
            if (anchorInteraction.parameters.y_function !== undefined) html += "(" + anchorInteraction.parameters.y_function + ")";
            html += anchorInteraction.parameters.y;
            html += "</div><Br/><svg style='background-color: #fff;' width=" + thumbnailWidth + " height=" + thumbnailHeight + " id='nodeSvg" + anchor.stage + "'></svg><br/>";
            anchor.existThumbnail = true;
            break;
        case "Manipulate:Select":
            html += "<div style='height:80px;vertical-align:middle'>";
            switch (anchorInteraction.interaction) {
                case "filterRange":
                    html += "BY " + anchorInteraction.parameters.target_data.toUpperCase();
                    html += "<image width=100 src='../images/Filter-2-icon.png' />";
                    break;
                case "filterTop":
                    html += "<div style='width:50%;float:left;'><br/><br/>";
                    html += "TOP \"" + anchorInteraction.parameters.param.toUpperCase() + "\"<br />" + anchorInteraction.parameters.sort.toUpperCase();
                    html += "</div><div style='width:50%;float:right;'>";
                    html += "<image width=100 src='../images/Filter-2-icon.png' />";
                    html += "</div><div style='width:50%;float:right;'>";
                    html += "</div>";
                    break;
            }
            html += "</div>";
            break;
        case "Facet:Juxtapose":
            html += "Copy&Juxtapose<br/><br />";
            html += "<svg style='background-color: #fff;' width=" + thumbnailWidth + " height=" + thumbnailHeight + " id=nodeSvg" + anchor.stage + "></svg>";
            anchor.existThumbnail = true;
            break;
    }
    html += "</div>";
    return html;
}

function findFavoriteAnchor(abstractedLogs) {
    abstractedLogs.forEach(function(stage) {
        if (stage.favorite == true) {
            addFavoritetoAnchor(stage.stage);
        }
    })
}

function addFavoritetoAnchor(anchorId) {
    var svg = d3.select("#anchorTreeSvg");
    svg.select("#anchorNode" + anchorId)
        .append("svg:image")
        .attr("x", -nodeWidth / 2 - 20)
        .attr("y", -95)
        .attr("width", 40)
        .attr("height", 40)
        .attr("xlink:href", "./images/star2.png")
        /*   
        svg.select("#anchorNode" + anchorId)
            .append("circle")
            .attr("cx", -nodeWidth/2)
            .attr("cy", -80)
            .attr("r", 10)
            .style("fill", "red");
            */
}