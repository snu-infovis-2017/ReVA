var scn1 = '{"ScenarioName":"시나리오1","AnalysisData":"csv file이름?","IR":[{"index":1,"p_index":0,"stage":1,"category":"Arrange:Chart","interaction":"barchart","parameters":{"mark" : "bar","x":"email","x_type":"ordinal","y":"id","y_type":"quantitative","y_function":"count"},"chart":"chart1"},{"index":2,"p_index":1,"stage":1,"category":"Arrange:Order","interaction":"orderBy","parameters":{"param":"id","param_function":"count","sort":"descending"},"chart":"chart1"},{"index":3,"p_index":2,"stage":1,"category":"Map:Color","interaction":"changeColor","parameters":{"param":"email","param_type":"nominal","param_scheme":"category20b"},"chart":"chart1"},{"index":4,"p_index":3,"stage":1,"category":"Map:Label","interaction":"addLabel","parameters":{"param":"id","param_function":"count","label":"text"},"chart":"chart1"},{"index":5,"p_index":4,"stage":1,"category":"Manipulate:Select","interaction":"brush","parameters":{"type":"single","email":["mbostock@gmail.com","jason@jasondavies.com"]},"chart":"chart1"},{"index":6,"p_index":5,"stage":2,"category":"Manipulate:Select","interaction":"filterRange","parameters":{"target_data":"date","target":"year","start":"2011","end":"2012"},"chart":"chart1"},{"index":7,"p_index":6,"stage":3,"category":"Facet:Juxtapose","interaction":"copyAndJuxtapose","parameters":{"concat":"horizontal","copied":"chart1","copying":"chart2"},"chart":"chart3"},{"index":8,"p_index":7,"stage":4,"category":"Manipulate:Select","interaction":"filterRange","parameters":{"target_data":"date","target":"year","start":"2013","end":"2014"},"chart":"chart2"},{"index":9,"p_index":5,"stage":5,"category":"Manipulate:Select","interaction":"filterDescendingTop","parameters":{"sort":"descending","param":"3","target":"id","target_function":"count"},"chart":"chart2"},{"index":10,"p_index":9,"stage":6,"category":"Arrange:Chart","interaction":"linechart","parameters":{"mark": "line","x":"date","x_axis":"%Y","y":"id","y_function":"count","x_type":"temporal","y_type":"quantitative"},"chart":"chart4"},{"index":11,"p_index":10,"stage":6,"category":"Map:Color","interaction":"changeColor","parameters":{"param":"email","param_type":"nominal","param_scheme":"category20b"},"chart":"chart4"},{"index":12,"p_index":11,"stage":6,"category":"Arrange:Express","interaction":"addAverageLine","parameters":{"param":"id","param_function":"count","param_type":"quantitative"},"chart":"chart4"}]}';
var IRs = JSON.parse(scn1).IR;

var abstractedLogs = [];
IRs.forEach( function (d, i) {
    if (abstractedLogs[d.stage-1] === undefined) {
        var stageInteraction = {"stageSummary":d.category + ":" + d.interaction, interactions:[d]};
        abstractedLogs[d.stage-1] = stageInteraction;
    } else {
        abstractedLogs[d.stage-1].interactions.push(d);
        abstractedLogs[d.stage-1].stageSummary += "->" + d.category + ":" + d.interaction
    }
});

//console.log(abstractedLogs);
