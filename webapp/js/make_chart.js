var chartViewWidth = 500;
var chartViewHeight = 400;
var hconcatWidth = 400;

function buildVlSpec(abstractedLogs, dataFileName) {
    var StageSummaryList = abstractedLogs.map(function(d) { return d.stageSummary; });
    var InteractionList = abstractedLogs.map(function(d) { return d.interactions; })
    console.log(abstractedLogs);
    for (var i in StageSummaryList) {
        var Stages = StageSummaryList[i].split("->");;
        var sub_Stages = Stages.map(function(d) { return d.split(":") });
        var Stage = sub_Stages.map(function(d) { return d[2]; });
        var Interaction = InteractionList[i];
        for (var j in Stage) {
            Interaction[j].VlSpec = {
                "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
                "description": "A simple bar chart with embedded data.",
                "width": chartViewWidth,
                "height": chartViewHeight,
                "data": { "url": "../data/" + dataFileName }, //data/dataFileName
                "layer": []
            };

            /////////////////exception 나중에 수정
            if (i == 0 && j == 4) { //brush 애매해서 빼둠.
                Interaction[4].VlSpec = Interaction[3].VlSpec;
            }
            //////////////////

            if (i == 0 && j == 0) Interaction[j].VlSpec = initiateVlSpec(Interaction[j]); //first make chart
            else if (j == 0) { //stage1을 제외한 가장 첫 stage case
                var parent;
                InteractionList.forEach(function(d) {
                    d.forEach(function(d1) {
                        if (d1.index == Interaction[j].p_index) {
                            parent = d1;
                            return d1;
                        }
                    })
                });
                Interaction[j].VlSpec = makeVlSpec(parent, Interaction[j]);
            } else Interaction[j].VlSpec = makeVlSpec(Interaction[j - 1], Interaction[j]); //detailed steps in stages
        }
    }
}

function makeVlSpec(parent_interaction, current_interaction) {
    var curr = current_interaction;
    var parent = parent_interaction;
    curr.VlSpec = JSON.parse(JSON.stringify(parent.VlSpec));
    var position = findAddPosition(curr.VlSpec); //initiate
    var parent_hconcatNum = 0;

    if (parent.VlSpec.hconcat) {
        parent_hconcatNum = Object.keys(parent.VlSpec.hconcat).length;
    }
    if (parent_hconcatNum == 2) {
        console.log(parent);
        if (curr.chart == parent.VlSpec.hconcat[0].title) {
            position = curr.VlSpec.hconcat[0].layer;
        } else if (curr.chart == parent.VlSpec.hconcat[1].title) {
            position = curr.VlSpec.hconcat[1].layer;
        }
    }

    if (curr.interaction == "orderBy") {
        position[0].encoding.x["sort"] = {
            "op": curr.parameters.param_function,
            "field": curr.parameters.param,
            "order": curr.parameters.sort
        };
    } else if (curr.interaction == "changeColor") {
        position[0].encoding["color"] = {
            "field": curr.parameters.param,
            "type": curr.parameters.param_type,
            "scale": { "scheme": curr.parameters.param_scheme }
        };
    } else if (curr.interaction == "addLabel") {
        position[1] = {};
        position[1].mark = { "type": "text", "align": "center", "baseline": "middle", "dy": -5 };
        position[1].encoding = {
            "x": position[0].encoding.x,
            "y": position[0].encoding.y,
            "text": { "aggregate": curr.parameters.param_function, "field": curr.parameters.param, "type": "quantitative" }
        };
    } else if (curr.interaction == "filterRange") {
        curr.VlSpec.data["format"] = { "parse": { "date": "utc:'%Y-%m-%d'" } };
        position[0]["transform"] = [{
            "filter": {
                "timeUnit": curr.parameters.target,
                "field": curr.parameters.target_data,
                "range": [curr.parameters.start, curr.parameters.end]
            }
        }];
        position[1]["transform"] = [{
            "filter": {
                "timeUnit": curr.parameters.target,
                "field": curr.parameters.target_data,
                "range": [curr.parameters.start, curr.parameters.end]
            }
        }];
    } else if (curr.interaction == "copyAndJuxtapose") {
        var tmp = JSON.parse(JSON.stringify(curr.VlSpec.layer));
        delete curr.VlSpec.layer;
        console.log(curr);
        console.log(parent.VlSpec);
        var copied_chart = parent.VlSpec.title;
        curr.VlSpec.hconcat = [];
        //curr.VlSpec.hconcat.push({"layer" : tmp});
        //curr.VlSpec.hconcat.push({"layer" : tmp});
        curr.VlSpec.hconcat.push({"width" : hconcatWidth, "layer": tmp, "title": curr.parameters.copied });
        curr.VlSpec.hconcat.push({"width" : hconcatWidth, "layer": tmp, "title": curr.parameters.copying });
    } else if (curr.interaction == "filterDescendingTop") {
    
        position[0]["transform"] = [{
            "filter": { "field": "email", "oneOf": ["mbostock@gmail.com", "jason@jasondavies.com", "kmonisit@gmail.com"] }
        }];
        position[1]["transform"] = [{
            "filter": { "field": "email", "oneOf": ["mbostock@gmail.com", "jason@jasondavies.com", "kmonisit@gmail.com"] }
        }];

    } else if (curr.interaction == "linechart") {
        position[0].mark = curr.parameters.mark;
        position[0].encoding = {
            "x": { "field": curr.parameters.x, "type": curr.parameters.x_type, "timeUnit": "year", "axis": { "format": "%Y" } },
            "y": { "field": curr.parameters.y, "type": curr.parameters.y_type, "aggreagate": curr.parameters.y_function },
            //"text" : {"field" :curr.parameters.x, "type" : curr.parameters.x_type, "timeUnit": "year"}
        };
        var tmp = position[0];
        delete curr.VlSpec.layer;
        curr.VlSpec.layer = [tmp];
    } else if (curr.interaction == "addAverageLine") {
        position[1] = {
            "mark": "rule",
            "encoding": {
                "y": { "aggregate": curr.parameters.param_function, "field": curr.parameters.param, "type": curr.parameters.param_type },
                "color": { "value": "red" },
                "size": { "value": 3 }
            }
        };
    }
    curr.VlSpec.title = "<" + curr.chart + ">";
    return curr.VlSpec;
}


function initiateVlSpec(current_interaction) {
    var VlSpec = current_interaction.VlSpec;
    var position = findAddPosition(VlSpec);
    var parameters = current_interaction.parameters;
    position.push({
        "mark": parameters.mark,
        "encoding": {
            "x": { "field": parameters.x, "type": parameters.x_type, "aggregate": parameters.x_function },
            "y": { "field": parameters.y, "type": parameters.y_type, "aggregate": parameters.y_function },
            "tooltip": { "field": parameters.y, "type": parameters.y_type, "aggregate": parameters.y_function }
        }
    });
    VlSpec.title = current_interaction.chart;
    return VlSpec;

}

function findAddPosition(curr_VlSpec) {
    if (curr_VlSpec.hconcat) {
        return curr_VlSpec.hconcat;
    } else if (curr_VlSpec.layer) {
        return curr_VlSpec.layer;
    } else return curr_VlSpec;
}

function dynamicallyLoadScript(url_name, fn) {
    var script = document.createElement("script");
    script.onload = fn;
    script.src = url_name + ".js";
    //script.async=true;
    document.head.appendChild(script);
}

function makeChart(VlSpec) {

    //VlSpec = InteractionList[4][0].VlSpec; // numbering 바꾸면서 stage 확인
    console.log(VlSpec);
    var opt = {
        mode: "vega-lite",
        actions: false
    };
    vegaEmbed("#chartpane", VlSpec, opt, function(error, result) { //chartpane
        var tooltipOption = {
            showAllFields: true,
        };
        vegaTooltip.vegaLite(result.view, VlSpec, tooltipOption);
    });
}