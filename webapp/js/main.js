var abstractedLogs = [];

function loadScenario(fileName) {
    $.getJSON(fileName, function(scnJson) {
        $.getJSON("../data/" + scnJson.analysis_data_file, function(dataJson) {
            scnJson.IRs.forEach(function(d, i) {
                if (abstractedLogs[d.stage - 1] === undefined) {
                    var stageInteraction = { "stageSummary": d.category + ":" + d.interaction, interactions: [d] };
                    stageInteraction.interactions[0].favorite = false;
                    abstractedLogs[d.stage - 1] = stageInteraction;
                    stageInteraction.stage = d.stage;
                    stageInteraction.parent = d.parent;
                    stageInteraction.favorite = false;
                } else {
                    d.favorite = false;
                    abstractedLogs[d.stage - 1].interactions.push(d);
                    abstractedLogs[d.stage - 1].stageSummary += "->" + d.category + ":" + d.interaction;
                }
            });
            buildVlSpec(abstractedLogs, dataJson);
            loadAnchorTree(abstractedLogs);

            // load all vega views;
        });
    });
}
loadScenario("../data/scn1.json");