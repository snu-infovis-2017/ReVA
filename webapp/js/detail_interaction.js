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
            style: "fill: " + (interaction.refresh ? nodeRefreshBackgroundColor : nodeBackgroundColor) + ";stroke:" + nodeDefaultStrokeColor + ";stroke-width:3px"
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
                clickInteraction(interaction);
                break;
            }
        }
    });
    findFavoriteNode(interactions);
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
    highlightDetailNode(interaction.index);
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
            p += buildFunctionLabel(params.x_function, params.x);
            p += "<br />";
            p += "y: ";
            p += buildFunctionLabel(params.y_function, params.y);
            break;
        case "linechart":
            p += "x: ";
            p += buildFunctionLabel(params.x_function, params.x);
            p += "<br />";
            p += "y: ";
            p += buildFunctionLabel(params.y_function, params.y);
            if (params.color !== undefined) p += "color: " + param.color.field;
            break;
        case "changeColor":
            schemes = ["category20", "category20b", "category20c"];
            p += params.param + ": <br />";
            p += buildSelectBox(schemes, "interaction" + interaction.index, params.param_scheme);
            addChangeEvent("interaction" + interaction.index, interaction, true);
            break;
        case "orderBy":
            orders = ["ascending", "descending"];
            p += buildFunctionLabel(params.param_function, params.param);
            p += ": <br />";
            p += buildSelectBox(orders, "interaction" + interaction.index, params.sort);
            addChangeEvent("interaction" + interaction.index, interaction, false);
            break;
        case "addLabel":
            p += buildFunctionLabel(params.param_function, params.param);
            break;
        case "filterRange":
            p += buildFunctionLabel(params.target, params.target_data);
            p += ": </br>";
            p += params.start + " ~ " + params.end;
            break;
        case "copyAndJuxtapose":
            p += params.concat;
            break;
        case "filterTop":
            console.log(">>>", params);
            p += buildSelectBox(["ascending", "descending"], "interaction" + interaction.index + "_1", params.sort);
            p += buildSelectBox([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "interaction" + interaction.index + "_2", params.param);
            addChangeEvent("interaction" + interaction.index + "_1", interaction, true);
            addChangeEvent("interaction" + interaction.index + "_2", interaction, true);
            break;
    }

    nodeHtml += p;
    nodeHtml += "</div>";
    nodeHtml += "</div>";
    return nodeHtml;
}

function buildSelectBox(list, id, defaultValue) {
    var p = "";
    p += "<select class=form-control id=" + id + ">";
    list.forEach(function(d) {
        p += "<option " + (String(d) == defaultValue ? "selected" : "");
        p += ">" + d + "</option>";
    });
    p += "</select>";
    return p;
}

function addChangeEvent(id, interaction, isAll) {
    $(document).on('change', "#" + id, function() {
        if (isAll) recoverAll(interaction);
        else recoverCurrentDetailOnly(interaction);
    });
}

function buildFunctionLabel(paramFunction, param) {
    var p = "";
    if (paramFunction !== undefined) p += paramFunction + "(";
    p += param;
    if (paramFunction !== undefined) p += ")";
    return p;
}

function findFavoriteNode(interactions){
    interactions.forEach(function(d){
        if(d.favorite == true){
            addFavoritetoNode(d.index);
        }
    })
}
function addFavoritetoNode(nodeId){
    var svg = d3.select("#detailInteractionSvg");
    
    svg.select("#detailNode" + nodeId)
        .append("circle")
        .attr("cx", -detailNodeWidth/2)
        .attr("cy", -25)
        .attr("r", 10)
        .style("fill", "red");
}