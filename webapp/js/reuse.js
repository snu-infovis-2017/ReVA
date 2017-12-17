$("#reuseButton").click(function() {
    document.getElementById("reuseFloatPane").style.visibility = "visible";
});
$("#hideReuse").click(function() {
    document.getElementById("reuseFloatPane").style.visibility = "hidden";
});


var prevReuseParams = ["email", "id", "date"];
$("#goReuse").click(function() {
    var paramNames = ["x", "y", "x_function", "y_function", "field", "param", "target_data", "target", "target_function", "param_function"];

    abstractedLogs.forEach(function(anchor) {
        anchor.refresh = false;
        anchor.interactions.forEach(function(interaction) {
            interaction.refresh = false;
            prevReuseParams.forEach(function(param, i) {
                paramNames.forEach(function(paramName) {
                    if (interaction.parameters[paramName] === param) {
                        var options = document.getElementById("reuse" + (i + 1)).options;
                        interaction.parameters[paramName] = options[options.selectedIndex].value;
                    }
                });
            });
        });
    });

    prevReuseParams.forEach(function(param, i) {
        var options = document.getElementById("reuse" + (i + 1)).options;
        prevReuseParams[i] = options[options.selectedIndex].value;
    });

    loadScenario("../data/scn1.json", "assembly.json");
    d3.selectAll("#detailInteractionSvg g").remove();
    d3.selectAll("#chartPane").remove();
    document.getElementById("reuseFloatPane").style.visibility = "hidden";
});

function appendOptionsToSelectBox(selectId, list) {
    var selectBox = document.getElementById(selectId);
    list.forEach(function(d) {
        selectBox.options.add(new Option(d, d));
    });
}

appendOptionsToSelectBox("reuse1", ["PROPOSER", "TITLE", "RESULT"]);
// appendOptionsToSelectBox("reuse2", ["count", "sum", "mean"]);
appendOptionsToSelectBox("reuse2", ["BILL_ID", "NUMBEROFASSEMBLY"]);
appendOptionsToSelectBox("reuse3", ["DATE"]);