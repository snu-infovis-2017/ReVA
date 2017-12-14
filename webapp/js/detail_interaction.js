var detailNodeWidth = 275;

function loadDetailInteraction(interactions) {
    var g = new dagreD3.graphlib.Graph()
        .setGraph({})
        .setDefaultEdgeLabel(function() { return; });

    interactions.forEach(function(interaction) {
        var nodeHtml = buildDetailNodeHtml(interaction);
        g.setNode(interaction.index, {
            labelType: "html",
            label: nodeHtml,
            style: "fill: " + nodeBackgroundColor + ";stroke:" + nodeDefaultStrokeColor + ";stroke-width:3px"
        });
    });

    g.nodes().forEach(function(v) {
        var node = g.node(v);
        // Round the corners of the nodes
        node.rx = node.ry = 5;
        node.id = "detailNode" + v;
        node.width = detailNodeWidth;
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
        .style("stroke", nodeDefaultStrokeColor)
        .style("stroke-width", "1px");
    svg.select("#detailNode" + nodeId)
        .select("rect")
        .style("stroke", "#ffcc00")
        .style("stroke-width", "3px");
}

function clickInteraction(interaction) {
    makeChart(interaction.VlSpec, "chartPane");
}

function buildDetailNodeHtml(interaction) {
    var nodeHtml = "<div id=detailNode" + interaction.index + " style='width:" + detailNodeWidth + "px;height:50px;float:left;display:table;'>";
    // nodeHtml += "<div style='width:50%;float:left;height:100%;display:table-cell;vertical-align:middle;' align=right>";
    nodeHtml += "<div style='width:50%;height:100%;display:table-cell;vertical-align:middle;padding-right:10px' align=right>";
    nodeHtml += "<b>" + interaction.interaction + "</b><br />";
    nodeHtml += "[" + interaction.category + "]";
    nodeHtml += "</div>";
    nodeHtml += "<div style='width:50%;height:100%;display:table-cell;vertical-align:middle;padding-left:10px' align=left>";
    // nodeHtml += "<div style='width:50%;float:right;height:100%;display:table-cell;vertical-align:middle;' align=left>";
    var p = "";

    var params = interaction.parameters;
    switch (interaction.interaction) {
        case "barchart":
            p += "x: ";
            if (params.x_function !== undefined) p += params.x_function + "(";
            p += params.x;
            if (params.x_function !== undefined) p += ")";
            p += "<br />";
            p += "y: ";
            if (params.y_function !== undefined) p += params.y_function + "(";
            p += params.y;
            if (params.y_function !== undefined) p += ")";
            break;
        case "linechart":
            p += "x: ";
            if (params.x_function !== undefined) p += params.x_function + "(";
            p += params.x;
            if (params.x_function !== undefined) p += ")";
            p += "<br />";
            p += "y: ";
            if (params.y_function !== undefined) p += params.y_function + "(";
            p += params.x;
            if (params.y_function !== undefined) p += ")";
            if (params.color !== undefined) p += "color: " + param.color.field;
            break;
        case "changeColor":
            p += params.param + ": <br />";
            p += params.param_scheme;
            break;
        case "orderBy":
            if (params.param_function !== undefined) p += params.param_function + "(";
            p += params.param;
            if (params.param_function !== undefined) p += ")";
            p += ": <br />";
            p += params.sort;
            break;
        case "addLabel":
            if (params.param_function !== undefined) p += params.param_function + "(";
            p += params.param;
            if (params.param_function !== undefined) p += ")";
            break;
        case "filterRange":
            console.log(">>>", params);
            if (params.target !== undefined) p += params.target + "(";
            p += params.target_data;
            if (params.target !== undefined) p += ")";
            p += ": </br>";
            p += params.start + " ~ " + params.end;
            break;
        case "copyAndJuxtapose":
            console.log(">>>", params);
            p += params.concat;
            break;
    }

    nodeHtml += p;
    nodeHtml += "</div>";
    nodeHtml += "</div>";
    return nodeHtml;
}