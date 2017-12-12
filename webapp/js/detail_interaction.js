function loadDetailInteraction(interactions) {
    var g = new dagreD3.graphlib.Graph()
        .setGraph({})
        .setDefaultEdgeLabel(function() { return; });

    interactions.forEach(function(interaction) {
        // g.setNode(stage.stage,  { label: "TOP",       class: "type-TOP" });
        console.log();
        g.setNode(interaction.index, { label: interaction.index, style: "fill: #afa" });
    });

    g.nodes().forEach(function(v) {
        var node = g.node(v);
        // Round the corners of the nodes
        node.rx = node.ry = 5;
    });

    var prevIndex = 0;
    for (var fi = 0; fi < interactions.length; fi++) {
        if (fi !== 0) {
            var interaction = interactions[fi];
            g.setEdge(prevIndex, interaction.index, {
                style: "stroke: #f66; stroke-dasharray: 3, 3;",
                arrowheadStyle: "fill: #f66"
            });
        }
        prevIndex = interactions[fi].index;
    }

    g.graph().rankDir = 'LR';
    var render = new dagreD3.render();
    var svg = d3.select("#detailInteractionSvg");
    var svgGroup = svg.append("g");

    render(d3.select("#detailInteractionSvg g"), g);

    svg.selectAll("g.node").on("click", function(id) {
        var _node = g.node(id);
        console.log(_node);
        clickInteraction(interactions[id - 1]);
    });
}

function clickInteraction(interaction) {
    makeChart(interaction.VlSpec);
}