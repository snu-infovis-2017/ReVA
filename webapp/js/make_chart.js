var chartViewWidth = 700;
var chartViewHeight = 400;
var hconcatWidth = 400;

function buildVlSpec(abstractedLogs, dataJson) {
    var StageSummaryList = abstractedLogs.map(function(d) { return d.stageSummary; });
    var InteractionList = abstractedLogs.map(function(d) { return d.interactions; })

    for (var i in StageSummaryList) {
        var Stages = StageSummaryList[i].split("->");
        var sub_Stages = Stages.map(function(d) { return d.split(":") });
        var Stage = sub_Stages.map(function(d) { return d[2]; });
        var Interaction = InteractionList[i];
        for (var j in Stage) {
            console.log(j, Interaction[j], InteractionList);
            Interaction[j].VlSpec = {
                "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
                "description": "A simple bar chart with embedded data.",
                "width": chartViewWidth,
                "height": chartViewHeight,
                // "data": { "url": "../data/" + dataFileName }, //data/dataFileName
                "data": { "values": dataJson },
                "layer": []
            };
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
    //makeChart(InteractionList[5][2].VlSpec);
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
        if (curr.chart == parent.VlSpec.hconcat[0].title) {
            position = curr.VlSpec.hconcat[0].layer;
        } else if (curr.chart == parent.VlSpec.hconcat[1].title) {
            position = curr.VlSpec.hconcat[1].layer;
        }
    }

    if (curr.interaction == "orderBy") {
        position[0].encoding.x["sort"] = {
            "order": curr.parameters.sort,
            "op": curr.parameters.param_function,
            "field": curr.parameters.param
        };
    } else if (curr.interaction == "changeColor") {
        if (position[0].mark == "line") {
            position[0].encoding["color"] = {
                "field": curr.parameters.param,
                "type": curr.parameters.param_type,
                "scale": { "scheme": curr.parameters.param_scheme }
            };
        } else {
            position[0].encoding["color"] = {
                "field": curr.parameters.param,
                "type": curr.parameters.param_type,
                "scale": { "scheme": curr.parameters.param_scheme },
                "legend": null
            };
        }
    } else if (curr.interaction == "addLabel") {
        position[1] = {};
        position[1].mark = { "type": "text", "align": "center", "baseline": "middle", "dy": -5 };
        position[1].encoding = {
            "x": position[0].encoding.x,
            "y": position[0].encoding.y,
            "text": { "aggregate": curr.parameters.param_function, "field": curr.parameters.param, "type": "quantitative" }
        };
    } else if (curr.interaction == "brush") {

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
        var copied_chart = parent.VlSpec.title;
        curr.VlSpec.hconcat = [];
        curr.VlSpec.hconcat.push({ "width": hconcatWidth, "layer": tmp, "title": curr.parameters.copied });
        curr.VlSpec.hconcat.push({ "width": hconcatWidth, "layer": tmp, "title": curr.parameters.copying });
    } else if (curr.interaction == "filterTop") {
        var params = curr.parameters;
        // TODO - NEEDS TO BE MODIFIED
        var topArray = getTopValues(params.field, curr.VlSpec.data.values, params.target, params.target_function, params.param, params.sort);

        position[0]["transform"] = [{
            "filter": { "field": params.field, "oneOf": topArray }
        }];
        position[1]["transform"] = [{
            "filter": { "field": "email", "oneOf": topArray }
        }];

    } else if (curr.interaction == "linechart") {
        curr.VlSpec.transform = null;
        position[0].mark = curr.parameters.mark;
        var color_data = curr.VlSpec.layer[0].transform[0].filter.field;
        position[0].encoding = {
            "x": { "field": curr.parameters.x, "type": curr.parameters.x_type, "timeUnit": "year", "axis": { "format": "%Y" } },
            "y": { "field": curr.parameters.y, "type": curr.parameters.y_type, "aggregate": curr.parameters.y_function },
            "color" :{"field" : color_data, "type" : "nominal"}
            //"text" : {"field" :curr.parameters.x, "type" : curr.parameters.x_type, "timeUnit": "year"}
        };
        var tmp = position[0];
        delete curr.VlSpec.layer;
        curr.VlSpec.layer = [tmp];
    } else if (curr.interaction == "addAverageLine") {
        /*
        var as = "count_id";
        curr.VlSpec["transform"] = [{ "aggregate": [{ "op": "count", "field": "id", "as": as }], "groupby": ["email"] }];
        position[0].encoding.y.field = as;
        position[0].encoding.y.aggregate = null;
        ///////
        position[0].encoding.x.sort.field = as;
        position[0].encoding.x.sort.op = "sum";
        ///////
        position[1].encoding.y.field = as;
        position[1].encoding.y.aggregate = null;
        position[1].encoding.text.field = as;
        position[1].encoding.text.aggregate = null;

        var rule = {
            "mark": "rule",
            "encoding": {
                "y": { "field": as, "type": "quantitative", "aggregate": "mean" },
                "color": { "value": "red" },
                "size": { "value": 3 }
            },
            "transform": position[0].transform
        };
        position.push(rule);
        */

    } else if (curr.interaction == "LikeInteraction") {
    }
    curr.VlSpec.title = curr.chart;
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
            "legend": null
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

function makeChart(VlSpec, paneName) {
    //
    //VlSpec = InteractionList[4][0].VlSpec; // numbering 바꾸면서 stage 확인
    var opt = {
        mode: "vega-lite",
        actions: false
    };
    vegaEmbed("#" + paneName, VlSpec, opt, function(error, result) { //chartpane
        var tooltipOption = {
            showAllFields: true,
        };
        vegaTooltip.vegaLite(result.view, VlSpec, tooltipOption);
    });
}

function vegaLiteThumbnailSpec(originSpec, width, height) {
    spec = jQuery.extend(true, {}, originSpec);
    if (spec.layer) {
        spec.width = width;
        spec.height = height;
        spec.title = null;
        if (spec.layer.length >= 2) {
            var tmp = JSON.parse(JSON.stringify(spec.layer));
            if (spec.layer[1].mark == "rule") {
                spec.layer[1].encoding.y["axis"] = null;
            } else {
                delete spec.layer;
                spec.layer = [tmp[0]];
            }
        }
        spec.layer[0].encoding.x["axis"] = null;
        //spec.layer[0].encoding.x["scale"] = {"rangeStep" : 100000};
        spec.layer[0].encoding.y["axis"] = null;
    } else if (spec.hconcat) {
        spec.title = null;
        var position0 = spec.hconcat[0];
        var position1 = spec.hconcat[1];
        position0.width = width / 2, position1.width = width / 2;
        position0.height = height, position1.height = height;
        position0.title = null, position1.title = null;
        if (position0.layer.length >= 2) {
            var tmp = JSON.parse(JSON.stringify(position0.layer));
            delete position0.layer;
            position0.layer = [tmp[0]];
        }
        if (position1.layer.length >= 2) {
            var tmp = JSON.parse(JSON.stringify(position1.layer));
            delete position1.layer;
            position1.layer = [tmp[0]];
        }
        position0.layer[0].encoding.x["axis"] = null;
        position0.layer[0].encoding.y["axis"] = null;
        position1.layer[0].encoding.x["axis"] = null;
        position1.layer[0].encoding.y["axis"] = null;
    }

    return spec;
}

function getTopValues(field, dataJson, target, targetFunction, rank, orderBy) {
    var fieldStat = {};

    // TODO - no target function case
    dataJson.forEach(function(d) {
        if (targetFunction !== undefined) {
            if (fieldStat[d[field]] === undefined) {
                fieldStat[d[field]] = { "cnt": 1, "sum": Number(d[target]) };
            } else {
                fieldStat[d[field]].cnt++;
                fieldStat[d[field]].sum += Number(d[target]);
            }
        }
    });
    // Create items array
    var items = Object.keys(fieldStat).map(function(key) {
        var value;
        switch (targetFunction) {
            case "sum":
                value = fieldStat[key].sum;
                break;
            case "count":
                value = fieldStat[key].cnt;
                break;
            case "mean":
                value = fieldStat[key].sum / fieldStat[key].cnt;
                break;
        }
        return [key, value];
    });

    // Sort the array based on the second element
    items.sort(function(first, second) {
        if (orderBy == "descending") return second[1] - first[1];
        else return first[1] - second[1];
    });

    var arr = [];
    items.slice(0, rank).forEach(function(d) {
        arr.push(d[0]);
    });
    return arr;
}