function loadDetailInteraction(interactions) {
    var g = new dagreD3.graphlib.Graph()
        .setGraph({})
        .setDefaultEdgeLabel(function() { return; });

    interactions.forEach(function(interaction) {
        var nodeHtml = "<div id=detailNode" + interaction.index + " style='width:100%;height:30px;float:left;'><b>" + interaction.index + "</b></div>";
        g.setNode(interaction.index, {
            labelType: "html",
            label: nodeHtml,
            style: "fill: #eee"
        });
    });

    g.nodes().forEach(function(v) {
        var node = g.node(v);
        // Round the corners of the nodes
        node.rx = node.ry = 5;
        node.id = "detailNode" + v;
    });

    var prevIndex = 0;
    for (var fi = 0; fi < interactions.length; fi++) {
        if (fi !== 0) {
            var interaction = interactions[fi];
            g.setEdge(prevIndex, interaction.index, {

            });
        }
        prevIndex = interactions[fi].index;
    }

    g.graph().rankDir = 'TB';
    var render = new dagreD3.render();
    var svg = d3.select("#detailInteractionSvg");
    var svgGroup = svg.append("g");

    render(d3.select("#detailInteractionSvg g"), g);

    svg.selectAll("g.node").on("click", function(id) {
        var _node = g.node(id);
        for (var fi = 0; fi < interactions.length; fi++) {
            var interaction = interactions[fi];
            if (interaction.index == id) {
                highlightDetailNode(id);
                clickInteraction(interaction);
                break;
            }
        }
    });
}

// highlight detailNode
function highlightDetailNode(nodeId) {
    // reset
    var svg = d3.select("#detailInteractionSvg");
    svg.selectAll("rect")
        .style("stroke", "#eee");
    svg.select("#detailNode" + nodeId)
        .select("rect")
        .style("stroke", "red");
}

function clickInteraction(interaction) {
    makeChart(interaction.VlSpec, "chartPane");
}