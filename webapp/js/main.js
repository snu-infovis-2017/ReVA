var abstractedLogs = [];
var originDataJson;

function loadScenario(fileName, dataFileName) {
    if (dataFileName === undefined) {
        $.getJSON(fileName, function(scnJson) {
            $.getJSON("../data/" + scnJson.analysis_data_file, function(dataJson) {
                originDataJson = dataJson;
                scnJson.IRs.forEach(function(d, i) {
                    if (abstractedLogs[d.stage - 1] === undefined) {
                        if (d.interaction == "LikeInteraction") {
                            abstractedLogs[d.stage - 1].favorite = true;
                        }
                        var anchor = { "stageSummary": d.category + ":" + d.interaction, interactions: [d] };
                        anchor.interactions[0].favorite = false;
                        abstractedLogs[d.stage - 1] = anchor;
                        anchor.stage = d.stage;
                        anchor.parent = d.parent;
                        anchor.parentStage = abstractedLogs[d.parent - 1];
                        anchor.refresh = false;
                        anchor.favorite = false;
                    } else {
                        if (d.interaction == "LikeInteraction") {
                            abstractedLogs[d.stage - 1].favorite = true;
                            abstractedLogs[d.stage - 1].interactions.forEach(function(d) {
                                if (d.index == i) d.favorite = true;
                            });
                        } else {
                            d.favorite = false;
                            abstractedLogs[d.stage - 1].interactions.push(d);
                            abstractedLogs[d.stage - 1].stageSummary += "->" + d.category + ":" + d.interaction;
                        }
                    }
                });
                buildVlSpec(abstractedLogs, dataJson);
                loadAnchorTree(abstractedLogs);
            });
        });
    } else {
        $.getJSON("../data/" + dataFileName, function(dataJson) {
            originDataJson = dataJson;
            buildVlSpec(abstractedLogs, dataJson);
            loadAnchorTree(abstractedLogs);
        });
    }
}

function recoverCurrentDetailOnly(interaction) {
    interaction.refresh = true;
    clickAnchor(abstractedLogs[interaction.stage - 1]);
    clickInteraction(interaction);
}

function recoverAll(interaction) {
    var currentStage = abstractedLogs[interaction.stage - 1];

    var refStart = false;
    currentStage.interactions.forEach(function(d, i) {
        if (d === interaction) refStart = true;
        if (refStart) d.refresh = true;
    });

    currentStage.refresh = true;
    var parentStageIndex = interaction.stage;
    for (var fi = interaction.stage; fi < abstractedLogs.length; fi++) {
        if (abstractedLogs[fi].parentStage.refresh === true) {
            abstractedLogs[fi].refresh = true;
            abstractedLogs[fi].interactions.forEach(function(d) { d.refresh = true; });
        }
    }
    buildVlSpec(abstractedLogs, originDataJson);
    loadAnchorTree(abstractedLogs);
    clickAnchor(abstractedLogs[interaction.stage - 1]);
    clickInteraction(interaction);
}


loadScenario("../data/scn1.json");