function loadAnchorTree(abstractedLogs) {
    var g = new dagreD3.graphlib.Graph()
        .setGraph({})
        .setDefaultEdgeLabel(function() { return; });

    abstractedLogs.forEach(function(stage) {
        // g.setNode(stage.stage,  { label: "TOP",       class: "type-TOP" });
        console.log();
        var nodeHtml = "<div style='width:100px;height:80px;float:left;'><image width=50 src='../images/filter_stock_funnel_filters-512.png' /><b>" + stage.stage + "</b></div>";
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
    });

    for (var fi = 0; fi < abstractedLogs.length; fi++) {
        var stage = abstractedLogs[fi];
        if (stage.parent != 0) {
            console.log(stage.stage, stage.parent);
            g.setEdge(stage.parent, stage.stage, { width: 25 });
        }
    }

    g.graph().rankDir = 'LR';
    var render = new dagreD3.render();
    var svg = d3.select("#anchorTreeSvg"),
        svgGroup = svg.append("g");

    render(d3.select("#anchorTreeSvg g"), g);

    svg.selectAll("g.node").on("click", function(id) {
        var _node = g.node(id);
        clickAnchor(abstractedLogs[id - 1]);
    });
}

function clickAnchor(anchor) {
    loadDetailInteraction(anchor.interactions);
    console.log("----");
    console.log(anchor.interactions);
    makeChart(anchor.interactions[anchor.interactions.length - 1].VlSpec);
}


function buildAnchorGlyphs(anchor) {
    var html;
    return html;
}