function loadScenario(fileName) {
    $.getJSON(fileName, function(scnJson) {
        var abstractedLogs = [];
        scnJson.IRs.forEach(function(d, i) {
            if (abstractedLogs[d.stage - 1] === undefined) {
                var stageInteraction = { "stageSummary": d.category + ":" + d.interaction, interactions: [d] };
                abstractedLogs[d.stage - 1] = stageInteraction;
                stageInteraction.stage = d.stage;
                stageInteraction.parent = d.parent;
            } else {
                abstractedLogs[d.stage - 1].interactions.push(d);
                abstractedLogs[d.stage - 1].stageSummary += "->" + d.category + ":" + d.interaction;
            }
        });
        buildVlSpec(abstractedLogs, scnJson.analysis_data_file);
        loadAnchorTree(abstractedLogs);

        // load all vega views;
    });
}

loadScenario("../data/scn1.json");