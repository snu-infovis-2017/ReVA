function loadAnchorTree(abstractedLogs) {
    var g = new dagreD3.graphlib.Graph()
        .setGraph({})
        .setDefaultEdgeLabel(function() { return; });

    abstractedLogs.forEach(function(stage) {
        // g.setNode(stage.stage,  { label: "TOP",       class: "type-TOP" });
        console.log();
        var nodeHtml = buildAnchorGlyphs(stage);
        stage.thumbnailSvg = vegaLiteThumbnailSpec(stage.interactions[stage.interactions.length - 1].VlSpec);
        // var nodeHtml = "<div style='width:100px;height:80px;float:left;'><image width=50 src='../images/filter_stock_funnel_filters-512.png' /><b>" + stage.stage + "</b></div>";
        // var nodeHtml = buildAnchorGlyphs(stage);
        g.setNode(stage.stage, {
            labelType: "html",
            label: nodeHtml,
            style: "fill: #eee"
        });
    });
    g.nodes().forEach(function(v) {
        var node = g.node(v);
        // Round the corners of the nodes
        node.rx = node.ry = 5;
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
    console.log(d3.select("#nodeSvg1"));
    // add vega-lite thumbnail
    abstractedLogs.forEach(function(stage) {
        // stage.thumbnailSvg = stage.interactions[0].VlSpec; // deep copy
        if (stage.existThumbnail) {
            stage.thumbnailSvg = jQuery.extend(true, {}, stage.interactions[0].VlSpec);
            console.log(stage.thumbnailSvg);
            stage.thumbnailSvg.width = 100;
            stage.thumbnailSvg.height = 100;
            stage.thumbnailSvg.config = { "axis": null, "legend": null };
            stage.thumbnailSvg.title = null;
            stage.thumbnailSvg.legend = false;
            try {
                stage.thumbnailSvg.layer[0].encoding.x.axis = null;
                stage.thumbnailSvg.layer[0].encoding.y.axis = null;
            } catch (TypeError) {

            }
            console.log("nodeSvg" + stage.stage);

            stage.thumbnailSvg.width = 100;
            stage.thumbnailSvg.height = 100;
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

    svg.selectAll("g.node").on("click", function(id) {
        var _node = g.node(id);
        clickAnchor(abstractedLogs[id - 1]);
    });
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
        .style("stroke", "#eee");
    svg.select("#anchorNode" + nodeId)
        .select("rect")
        .style("stroke", "red");
}


function buildAnchorGlyphs(anchor) {
    var html = "<div style='width:100px;height:100px;float:left;'>";
    anchorInteraction = anchor.interactions[0];
    switch (anchorInteraction.category) {
        case "Arrange:Chart":
            html += "<svg width=100 height=100 id='nodeSvg" + anchor.stage + "'></svg><br/>";
            html += "x:";
            if (anchorInteraction.parameters.x_function !== undefined) html += "(" + anchorInteraction.parameters.x_function + ")";
            html += anchorInteraction.parameters.x;
            html += " y:";
            if (anchorInteraction.parameters.y_function !== undefined) html += "(" + anchorInteraction.parameters.y_function + ")";
            html += anchorInteraction.parameters.y;

            anchor.existThumbnail = true;
            break;
        case "Manipulate:Select":
            switch (anchorInteraction.interaction) {
                case "filterRange":
                    html += "<image width=50 src='../images/filter_stock_funnel_filters-512.png' />"
                    html += anchorInteraction.parameters.target;
                    break;
                case "filterDescendingTop":
                    html += "<image width=50 src='../images/filter_stock_funnel_filters-512.png' />";
                    html += "TOP " + anchorInteraction.parameters.param + " DESC";
                    break;
            }
            break;
        case "Facet:Juxtapose":
            html += "<svg width=100 height=80 id=nodeSvg" + anchor.stage + "></svg>";
            anchor.existThumbnail = true;
            break;
    }
    html += "</div>";
    return html;
}


function vegaLiteThumbnailSpec(spec) {
    // spec.width = 50;
    // spec.height = 40;
    // // remove 쓸데없는것들 (축. label 등);

    return undefined;
}