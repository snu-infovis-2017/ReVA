var abstractedLogs = [];

function loadScenario(fileName) {
    $.getJSON(fileName, function(scnJson) {
        $.getJSON("../data/" + scnJson.analysis_data_file, function(dataJson) {
            abstractedLogs.data = dataJson;
            scnJson.IRs.forEach(function(d, i) {
                if (abstractedLogs[d.stage - 1] === undefined) {
                    var anchor = { "stageSummary": d.category + ":" + d.interaction, interactions: [d] };
                    anchor.interactions[0].favorite = false;
                    abstractedLogs[d.stage - 1] = anchor;
                    anchor.stage = d.stage;
                    anchor.parent = d.parent;
                    anchor.parentStage = abstractedLogs[d.parent - 1];
                    anchor.refresh = false;
                    anchor.favorite = false;
                } else {
                    d.favorite = false;
                    abstractedLogs[d.stage - 1].interactions.push(d);
                    abstractedLogs[d.stage - 1].stageSummary += "->" + d.category + ":" + d.interaction;
                }
            });
            buildVlSpec(abstractedLogs, dataJson);
            loadAnchorTree(abstractedLogs);
        });
    });
}

function recoverCurrentDetailOnly(interaction) {
    interaction.refresh = true;
    buildVlSpec(abstractedLogs, abstractedLogs.data);
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
        if (abstractedLogs[fi].parentStage.refresh) {
            abstractedLogs[fi].refresh = true;
            abstractedLogs[fi].interactions.forEach(function(d) { d.refresh = true; });
        }
    }

    buildVlSpec(abstractedLogs, abstractedLogs.data);
    loadAnchorTree(abstractedLogs);
    clickAnchor(abstractedLogs[interaction.stage - 1]);
    clickInteraction(interaction);
}

// function rebuildAllVlSpec() {
//     var interactionMap = {};
//     abstractedLogs.forEach(function(anchor, i) {
//         anchor.interactions.forEach(function(interaction) {
//             interactionMap[interaction.index] = interaction;
//         });
//     });

//     abstractedLogs.forEach(function(anchor) {
//         anchor.interactions.forEach(function(interaction) {
//             if (interaction.refresh) {
//                 interaction.VlSpec = makeVlSpec(interactionMap[interaction.parent], interaction);
//                 console.log("redraw", interaction);
//             }
//         });
//     });
// }

function resetAllRefresh() {
    abstractedLogs.forEach(function(anchor) {
        anchor.refresh = false;
        anchor.interactions.forEach(function(interaction) {
            interaction.refresh = false;
        });
    });
}

loadScenario("../data/scn1.json");