var baseURL = "http://www.thebluealliance.com/api/v2/";
var whoAmI = "?X-TBA-App-Id=smallscalesolutions:frc_statistical_pages:v0.1.0";
var baseYear = "2015";
var baseEvent = "ohcl";

//requests
function eventListURLMod(){
    return "events/" + baseYear + whoAmI;
}
function eventURLMod(){
    return "event/" + baseYear + baseEvent + whoAmI;
}
function eventMatchesURLMod(){
    return "event/" + baseYear + baseEvent + "/matches" + whoAmI;
}
function eventRankingsURLMod() {
    return "event/" + baseYear + baseEvent + "/rankings" + whoAmI;
}

//ready flags
var eventListReady = false;
var eventReady = false;
var eventMatchesReady = false;
var eventRankingsReady = false;

//datas
var eventList = null;
var event = null;
var eventMatches = null;
var eventRankings = null;
var teamActivity = [];

function getEventList(){
    dataPullerService(baseURL + eventListURLMod(), setEventList);
}
function setEventList(data){
    eventList = sortEventList(data);
    //dataLoggerService(eventList);
    eventListReady = true;
}
function getEvent(){
    dataPullerService(baseURL + eventURLMod(), setEvent);
}
function setEvent(data){
    event = data;
    //dataLoggerService(event);
    eventReady = true;
}
function getMatches(){
    dataPullerService(baseURL + eventMatchesURLMod(), setMatches);
}
function setMatches(data){
    eventMatches = data;
    //dataLoggerService(eventMatches);
    if (eventMatches == 'undefined' || eventMatches == null){
        eventMatches = eventMatchesStored;
    }
    if (eventMatches != 'undefined' && eventMatches != null){
        for (var c = 0; c < eventMatches.length; c++){
            eventMatches[c]["alliances"]["red"]["teams"][0] = eventMatches[c]["alliances"]["red"]["teams"][0].substring(3);
            eventMatches[c]["alliances"]["red"]["teams"][1] = eventMatches[c]["alliances"]["red"]["teams"][1].substring(3);
            eventMatches[c]["alliances"]["red"]["teams"][2] = eventMatches[c]["alliances"]["red"]["teams"][2].substring(3);
            eventMatches[c]["alliances"]["blue"]["teams"][0] = eventMatches[c]["alliances"]["blue"]["teams"][0].substring(3);
            eventMatches[c]["alliances"]["blue"]["teams"][1] = eventMatches[c]["alliances"]["blue"]["teams"][1].substring(3);
            eventMatches[c]["alliances"]["blue"]["teams"][2] = eventMatches[c]["alliances"]["blue"]["teams"][2].substring(3);
        }
    }
    eventMatchesReady = true;
}
function getEventRankings(){
    dataPullerService(baseURL + eventRankingsURLMod(), setEventRankings);
}
function setEventRankings(data){
    eventRankings = data;
    //dataLoggerService(eventRankings);
    eventRankingsReady = true;
}
function invalidateAllData(){
    eventListReady = true;
    eventReady = true;
    eventMatchesReady = false;
    eventRankingsReady = true;
}
//TODO this team activity getter will just return the index
function getTeamActivity(team){
    if (teamActivity != 'undefined' && teamActivity != null && team > 0){
        for (var c = 0; c < teamActivity.length; c++){
            if (teamActivity[c]["team"] == team){
                return c;
            }
        }
    }
    return -1;
}
function setTeamActivity(){
    if (eventMatches != 'undefined'){
        for (var c = 0; c < eventMatches.length; c++){
            addTeamMatchData(c);
        }
        setAveragesAndCounts();
    }
}
//TODO insert match date here for whatever team happens to be added..
function getTeamWithScore(idx, order){
    var newAll = "blue";
    if (order > 2){ order -= 3; newAll = "red"; }
    var returnMe = { team: 0, scores: [] };

    returnMe.team = eventMatches[idx]["alliances"][newAll]["teams"][order];
    returnMe.scores.push(eventMatches[idx]["alliances"][newAll]["score"]);
    return returnMe;
}
function addTeamMatchData(idx){
    var teamDex = -1;
    var curr = {};

    for (var c = 0; c < 6; c++){
        curr = getTeamWithScore(idx, c);
        teamDex = getTeamActivity(curr.team);
        if(curr.scores[0] != -1) {
            if (teamDex != -1) {
                teamActivity[teamDex].scores.push(curr.scores[0]);
            } else {
                teamActivity.push({team: curr.team, scores: curr.scores});
            }
        }
    }

    if (teamActivity != 'undefined' && teamActivity != null){
        sortTeamActivity();
    }
}

function sortTeamActivity(){
    teamActivity.sort(function(a, b) {
        return a - b;
    });
}

//TODO AVERAGES HERE TODO
var totalMatchPoints = 0;
var averageMatchScore = 0;
var numberOfMatches = 0;
//TODO
function setAveragesAndCounts(){
    if (eventMatches != 'undefined' && eventMatches != null){
        for (var c = 0; c < eventMatches.length; c++){
            if (eventMatches[c]["alliances"]["blue"]["score"] > -1 && eventMatches[c]["alliances"]["red"]["score"] > -1) {

                totalMatchPoints += eventMatches[c]["alliances"]["blue"]["score"];
                totalMatchPoints += eventMatches[c]["alliances"]["red"]["score"];

                numberOfMatches += 2;
            }
        }

        averageMatchScore = totalMatchPoints / numberOfMatches;

        console.log(eventMatches.length + ":     " + totalMatchPoints + " / " + numberOfMatches + " = " + averageMatchScore);
    }
}

function loadAllData(){
    invalidateAllData();

    //getEventList();
    //getEvent();
    getMatches();
    //getEventRankings();

    dataReadyWait();
}

//sorters if needed
function sortEventList(data){
    console.log("Data size: " + data.length);
    var dataArray = [];

    for (var i in data) {
        dataArray.push(data[i]);
    }

    return dataArray.sort(
        function(a,b){
            if (a["start_date"] < b["start_date"]){
                return -1;
            } else if (a["start_date"] > b["start_date"]){
                return 1;
            } else {
                if (a["name"].localeCompare(b["name"]) == -1){
                    return -1;
                } else if (a["name"].localeCompare(b["name"]) == 1){
                    return 1;
                }
                return 0;
            }
        }
    );
}

//TODO
// dynamic data pulling function
function dataPullerService(url, setter){
    /*
    try {
        m.request({
            method: "GET",
            url: url
        }).then(function (data) {
            setter(data);
        });
    } catch (e){
        console.log("no net");
        setter('undefined');
    }
    */
    setter('undefined');
}

//TODO
//dynamic data key logger
function dataLoggerService(data){
    console.log("Data length: " + data.length);
    for (var i = 0; i < data.length; i++) {
        console.log(data[i]["key"]);
    }
}

//TODO
//wait for all data ready
function dataReadyWait(){
    console.log("Starting this");
    setTimeout(function(){
        if (eventListReady == false || eventReady == false || eventMatchesReady == false || eventRankingsReady == false){
            console.log("Waiting");
            dataReadyWait();
        } else {
            console.log("Time to sort data");
            console.log("Success!");
            //dataDashboardRedirect();

            //TODO setting the team activity here so that we can use refined data.
            setTeamActivity();

            makeScoresPlot();
            makeScoresWayAboveAveragePie();
            makeScoresAboveAveragePie();
            //teamClicked('2252');
            teamClicked('379');
            //teamClicked('4269');
            //teamClicked('5413');
            //teamClicked('48');
            //teamClicked('4145');
            //teamClicked('4085');
            teamClicked('1592');
            //teamClicked('3260');
            //teamClicked('2655');
            //teamClicked('3819');
            //teamClicked('910');
            //teamClicked('1987');
            //teamClicked('3511');
            //teamClicked('930');
            //teamClicked('156');
        }
    },1000);
}

function clickStuff(){
    var team = document.getElementById('teamInput').value;
    if (team != 'undefined' && team != null && team.trim() != null && isNaN(team) == false){
        teamClicked(team);
    }
}

//TODO
//TODO
//TODO
//TODO
//view controllers
var welcomeView = {};
welcomeView.vm = {};  //view-model
welcomeView.controller = function() { //controller
    welcomeView.vm.greeting1 = "FRC Competition data (powered by thebluealliance.com)";
    welcomeView.vm.script = "loadAllData();";
};
welcomeView.view = function(vm) { //view
    return [
        m("h3", welcomeView.vm.greeting1),
        m("div", { class: 'row' },
            [
                m('div', { class: 'col-xs-1 no-border' }),
                m("input[type=text]", { id: 'teamInput', class: 'col-xs-2' }),
                m("div", { onclick: clickStuff }, "Load Team")
            ]),
        m("div", { class: 'row' }, m('div', { id: 'chart_div', class: ' charts col-xs-6' })),
        m('script', welcomeView.vm.script)
    ];
};


//TODO
//model functions for match modifiers
var quals = "qm";
var quarters = "qf";
var semis = "sf";
var finals = "f";
var worlds = "ef";

function getMatchModelStyle(comp_level){
    if (comp_level == quals){
        return "Unknown";
    } else if (comp_level == quarters){
        return "Unknown";
    } else if (comp_level == semis){
        return "Unknown";
    } else if (comp_level == finals){
        return "Unknown";
    } else if (comp_level == worlds){
        return "Unknown";
    } else {
        return "Unknown";
    }
}
function getMatchModelText(comp_level){
    if (comp_level == quals){
        return "Qualifier";
    } else if (comp_level == quarters){
        return "Quarter";
    } else if (comp_level == semis){
        return "Semi";
    } else if (comp_level == finals){
        return "Final";
    } else if (comp_level == worlds){
        return "World";
    } else {
        return "Unknown";
    }
}


//TODO
//chart maker
function makeScoresPlot(){
    google.load("visualization", "1", {packages:["corechart"], callback: drawChart});
    function drawChart() {
        var firstData = [];

        for (var i = 0; i < eventMatches.length; i++) {
            if (eventMatches[i]["alliances"]["blue"]["score"] > -1 && eventMatches[i]["alliances"]["red"]["score"] > -1) {
                firstData.push(
                    [
                        (eventMatches[i]["alliances"]["blue"]["score"]),
                        (eventMatches[i]["alliances"]["red"]["score"]),
                        (getMatchModelText(eventMatches[i]["comp_level"]) +
                        ' ' + eventMatches[i]["match_number"] +
                        ' | Blue ' + eventMatches[i]["alliances"]["blue"]["score"] +
                        ': ' + eventMatches[i]["alliances"]["blue"]["teams"][0] + ' ' +
                        eventMatches[i]["alliances"]["blue"]["teams"][1] + ' ' +
                        eventMatches[i]["alliances"]["blue"]["teams"][2] + ' ' +
                        '| Red ' + eventMatches[i]["alliances"]["red"]["score"] +
                        ': ' + eventMatches[i]["alliances"]["red"]["teams"][0] + ' ' +
                        eventMatches[i]["alliances"]["red"]["teams"][1] + ' ' +
                        eventMatches[i]["alliances"]["red"]["teams"][2])
                    ]
                );
            }
        }

        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Red');
        data.addColumn('number', 'Blue');
        data.addColumn({ type: 'string', role: 'tooltip' });
        //alert(firstData);
        data.addRows(firstData);

        var options = {
            title: 'Red/Blue Scores Plot',
            hAxis: {title: 'Blue Score', min: 0, max: 400},
            vAxis: {title: 'Red Score', min: 0, max: 400},
            legend: 'none',
            trendlines: {0:{ type: 'exponential' }},
            //trendlines: {0:{ type: 'linear' }}
            animation: {startup: true, duration: 250, easing: 'out'}
        };

        var chart = new google.visualization.ScatterChart(document.getElementById('scores_plot_div'));
        chart.draw(data, options);
    }
}

//TODO
//makes the bar graph for higher than average scores
function makeScoresWayAboveAveragePie(){
    google.load("visualization", "2", {packages:["corechart"], callback: drawChart});

    function drawChart() {
        var specificData = [];
        var added = false;

        for (var c = 0; c < teamActivity.length; c++){
            added = false;
            for (var i = 0; i < teamActivity[c].scores.length; i++){
                if (teamActivity[c].scores[i] > averageMatchScore){
                    if (added == true){
                        specificData[specificData.length - 1][1] += 1;
                    } else {
                        specificData.push([teamActivity[c].team, 1]);
                        added = true;
                    }
                }
            }
            //make sure this number isn't one
            if (specificData != 'undefined' && specificData != null && specificData.length != 0) {
                if (specificData[specificData.length - 1][1] < 4) {
                    specificData.splice(specificData.length - 1, 1);
                }
            }
        }

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Team');
        data.addColumn('number', '> Avg');
        data.addRows(specificData);

        var options = {
            title: 'Way Above Average Match Score Occurrences: ' + averageMatchScore,
            is3D: true
        };

        var chart = new google.visualization.PieChart(document.getElementById('three_above_average_pie_div'));
        chart.draw(data, options);
    }
}

//TODO
//makes the bar graph for higher than average scores
function makeScoresAboveAveragePie(){
    google.load("visualization", "2", {packages:["corechart"], callback: drawChart});

    function drawChart() {
        var specificData = [];
        var added = false;

        for (var c = 0; c < teamActivity.length; c++){
            added = false;
            for (var i = 0; i < teamActivity[c].scores.length; i++){
                if (teamActivity[c].scores[i] > averageMatchScore){
                    if (added == true){
                        specificData[specificData.length - 1][1] += 1;
                    } else {
                        specificData.push([teamActivity[c].team, 1]);
                        added = true;
                    }
                }
            }
        }

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Team');
        data.addColumn('number', '> Avg');
        data.addRows(specificData);

        var options = {
            title: 'Above Average Match Score Occurrences: ' + averageMatchScore,
            is3D: true
        };

        var chart = new google.visualization.PieChart(document.getElementById('scores_above_average_pie_div'));
        chart.draw(data, options);
    }
}

//TODO
//this is a basic class for averages
function averageClass(team, num){
    return [team, num];
}

//TODO
//this is how we find things
function findByTeam(source, team) {
    for (var i = 0; i < source.length; i++) {
        if (source[i][0] == team) {
            return i;
        }
    }
    return -1;
}

//TODO add data buttons for each team by current rank
function callSankeyBuilder(team, dontMatchPlease, prefix){
    //TODO
    //TODO create want to pair sequence
    //initial weight = 2
    //less than average score == -1
    //way less than average score == -2
    //above average score == +1
    //way above average score == +2
    var avg = averageMatchScore;
    var init = 2;
    var little = 1;
    var big = 2;

    //generate win and loss lists
    var teamList = [];
    var aboveList = [];
    var belowList = [];

    var teamIndex = -1;
    var isRed = 1;
    var isBlue = 1;
    var isWhat = 0;
    var tmpTeam = 0;

    var scoreMod = 0;
    var scoreSwitch = 0;

    var listModder = function(idx, teamDex, color){
        if (eventMatches[c]["alliances"][color]["score"] > avg) {
            scoreSwitch = 1;
            if (eventMatches[c]["alliances"][color]["score"] > (avg * 1.5)) {
                scoreMod = big;
            } else {
                scoreMod = little;
            }
        } else {
            scoreSwitch = -1;
            if (eventMatches[c]["alliances"][color]["score"] < (avg * 1.5)) {
                scoreMod = big;
            } else {
                scoreMod = little;
            }
        }
        for (var x = 0; x < 3; x++){
            if (x != teamDex){
                tmpTeam = eventMatches[c]["alliances"][color]["teams"][x];
                if (tmpTeam != dontMatchPlease) {
                    if (teamList.indexOf(prefix + tmpTeam) == -1) {
                        teamList.push({team: prefix + tmpTeam, points: (init + scoreMod)});
                    } else {
                        teamList[teamList.indexOf(prefix + tmpTeam)].points += scoreMod;
                    }
                    if (scoreSwitch == -1) {
                        if (belowList.indexOf(prefix + tmpTeam) == -1) {
                            belowList.push(prefix + tmpTeam);
                        }
                    } else {
                        if (aboveList.indexOf(prefix + tmpTeam) == -1) {
                            aboveList.push(prefix + tmpTeam);
                        }
                    }
                }
            }
        }
    };

    //get teams played with
    if (eventMatches != 'undefined' && eventMatches != null) {
        for (var c = 0; c < eventMatches.length; c++) {
            teamIndex = -1;
            isWhat = 0;

            if (eventMatches[c]["alliances"]["blue"]["score"] > -1){
                teamIndex = eventMatches[c]["alliances"]["blue"]["teams"].indexOf(team);
                if (teamIndex != -1){
                    isWhat = isBlue;
                }
                if (isWhat == 0){
                    teamIndex = eventMatches[c]["alliances"]["red"]["teams"].indexOf(team);
                    if (teamIndex != -1){
                        isWhat = isRed;
                    }
                }
                //match found
                if (isWhat != 0){
                    if (isWhat == isRed){
                        listModder(c, teamIndex, "red");
                    } else {
                        listModder(c, teamIndex, "blue");
                    }
                }
            }
        }
    }

    if(teamList != 'undefined' && teamList != null) {
        for (c = 0; c < teamList.length; c++) {
            sankeyData.push([team, teamList[c].team, teamList[c].points]);
        }
    }

    buildThisTeamSankey();
}

function teamClicked(team){
    callSankeyBuilder(team, 0, '');

    var teams = [];

    if(sankeyData != 'undefined' && sankeyData != null) {
        for (var c = 0; c < sankeyData.length; c++) {
            teams.push(sankeyData[c][1]);
        }
    }

    for (c = 0; c < teams.length; c++){
        callSankeyBuilder(teams[c], team, '_');
    }
}

var sankeyData = [];

//TODO
//chart for the sankey
function buildThisTeamSankey(){

    google.load("visualization", "1.1", {packages:["sankey"], callback: drawChart});

    function drawChart() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Pivot');
        data.addColumn('string', 'Select');
        data.addColumn('number', 'Benefit');
        data.addRows(sankeyData);

        var options = {
            title: 'Above Average Match Score Occurrences: ' + averageMatchScore,
            is3D: true
        };

        var chart = new google.visualization.Sankey(document.getElementById('sankey_basic'));
        chart.draw(data, options);
    }
}




