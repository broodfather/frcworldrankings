var express = require('express');
var app = express();
var http = require('http').Server(app);
var request = require('request');
var io = require('socket.io')(http);
var path = require("path");
var DM = require('./dataModel.js');
var mongoose = require('mongoose');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log("Connected to DB");
});

mongoose.connect('mongodb://datareaper:3t411Data5@ds031671.mongolab.com:31671/frcdata');



var dataModel = new DM();
console.log(dataModel.sayHi());

http.listen(8080, function(){
    console.log("Listening on port 1337");
});



app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/public/htmls/dataBreakdown.html'));
});

app.use("/public/stylesheets", express.static(path.join(__dirname, '/public/stylesheets')));
app.use("/public/javascripts", express.static(path.join(__dirname, '/public/javascripts')));

io.on('connection', function(socket){
    socket.emit('greet', { greeting: 'Hello World' });
    console.log("This is working?");

    socket.on('message', function(msg){
        console.log('message: ' + msg);
    });

    var giveWorldData = function(data){
        console.log("Giving World Data");
        socket.emit('worlddata', data);
    };

    socket.on('getworlddata', function(year){
        console.log("Requesting world data: " + year);

        waitForDataHere(giveWorldData);
        //worldDataCall(giveWorldData);
    });
});

worldDataCall(setDataHere);

function waitForDataHere(thenDoThis){
    if (thisData.length === 0){
        setTimeout(function(){
            waitForDataHere(thenDoThis);
        },250);
    } else {
        thenDoThis(thisData);
    }
};

var thisData = [];
function setDataHere(d){
    thisData = d;
};

var activeRequests = 1;

function worldDataCall(whenReady){
    var urlBase = "http://www.thebluealliance.com/api/v2/";
    var eventsMod = "events/";
    var eventMod = "event/";
    var whoami = "?X-TBA-App-Id=smallscalesolutions:frc_statistical_pages:v0.1.7";
    var year = "2015";
    var rankingsMod = "/rankings";
    var eventsUrl = urlBase + eventsMod + year + whoami;

    var events = [];
    var rankings = [];
    activeRequests = 1;

    request({
        url: eventsUrl,
        json: true
    }, function(error, response, data){
        if (!error && response.statusCode === 200){
            //console.log(data);

            data = getKeysFromEvents(data);

            //console.log(data);
            //console.log("number of events: " + data.length);

            rankings = [];
            activeRequests = data.length;

            for (var c = 0; c < data.length; c++){
                //console.log("Current URL: " + urlBase + eventMod + data[c] + rankingsMod + whoami);
                request({
                    url: urlBase + eventMod + data[c] + rankingsMod + whoami,
                    json: true
                }, function(error, response, ranks){
                    if (!error && response.statusCode === 200){
                        if (ranks !== 'undefined'){
                            //console.log("This is the size of these ranks: " + ranks.length);
                            ranks.shift();
                            rankings = rankings.concat(ranks);
                            //console.log("This is the size of the new rankings: " + rankings.length);
                        }
                    } else {
                        console.log("Event Rankings Error: " + error);
                    }
                }).on('end', function(){
                    activeRequests--;

                    if (activeRequests < 1) {
                        waitingToSend(whenReady, rankings);
                    }
                });
            }
        } else {
            console.log("Events Error: " + error);
        }
    });
};

function getKeysFromEvents(data){
    var keys = [];

    if (data !== 'undefined'){
        while (data.length > 0){
            keys.push(data[0]["key"]);
            data.shift();
        }
    }

    return keys;
};

var iterations = 1;

function waitingToSend(whenReady, d){
    setTimeout(function(){
        if (activeRequests < 1){
            console.log("Done with data! Time: " + iterations / 10 + " seconds.");

            d = trimWorldData(d);
            console.log("Rankings Size: " + d.length);

            d = mashWorldData(d);
            console.log("Trimmed Rankings Size: " + d.length);

            //TODO time to make individual rankings
            var autonomous = getAutonRanks(d);
            var container = getContainerRanks(d);
            var coopertition = getCoopRanks(d);
            var litter = getLitterRanks(d);
            var tote = getToteRanks(d);
            var noCoop = getNoCoopRanks(d);
            var overall = getOverallRanks(d);

            d = [
                autonomous,
                container,
                coopertition,
                litter,
                tote,
                noCoop,
                overall
            ];


            whenReady(d);
        } else {
            iterations++;
            waitingToSend(whenReady, d);
        }
    },1000);
};

function trimWorldData(d){
    for (var c = 0; c < d.length; c++){
        d[c] = [
            d[c][1],
            d[c][3],
            d[c][4],
            d[c][5],
            d[c][6],
            d[c][7],
            d[c][8]
        ];
    }

    return d;
};

function mashWorldData(d){
    d.sort(function(a, b){
        if (a[0] > b[0]){
            return 1;
        } return -1;
    });

    for (c = 0; c < d.length - 1; c++){
        if (d[c][0] === d[c + 1][0]){
            d[c][1] += d[c + 1][1];
            d[c][2] += d[c + 1][2];
            d[c][3] += d[c + 1][3];
            d[c][4] += d[c + 1][4];
            d[c][5] += d[c + 1][5];
            d[c][6] += d[c + 1][6];

            d.splice(c + 1, 1);
            c--;
        }
    }

    return d;
};

function getAutonRanks(d){
    var rank = [];
    for (var c = 0; c < d.length; c++){
        if (d[c][1] !== 0){
            rank.push([d[c][0], d[c][1], d[c][6], parseFloat((d[c][1] / d[c][6]).toFixed(2))]);
        }
    }
    if (rank.length > 1){
        rank.sort(function(a, b){
            if (a[3] > b[3]){
                return -1;
            } else if (a[3] === b[3]){
                if (a[1] > b[1]) {
                    return -1;
                } else if (a[1] === b[1] && a[0] < b[0]){
                    return -1;
                }
            } return 1;
        });
    }

    return rank;
};

function getContainerRanks(d){
    var rank = [];
    for (var c = 0; c < d.length; c++){
        if (d[c][2] !== 0){
            rank.push([d[c][0], d[c][2], d[c][6], parseFloat((d[c][2] / d[c][6]).toFixed(2))]);
        }
    }
    if (rank.length > 1){
        rank.sort(function(a, b){
            if (a[3] > b[3]){
                return -1;
            } else if (a[3] === b[3]){
                if (a[1] > b[1]) {
                    return -1;
                } else if (a[1] === b[1] && a[0] < b[0]){
                    return -1;
                }
            } return 1;
        });
    }

    return rank;
};

function getCoopRanks(d){
    var rank = [];
    for (var c = 0; c < d.length; c++){
        if (d[c][3] !== 0){
            rank.push([d[c][0], d[c][3], d[c][6], parseFloat((d[c][3] / d[c][6]).toFixed(2))]);
        }
    }
    if (rank.length > 1){
        rank.sort(function(a, b){
            if (a[3] > b[3]){
                return -1;
            } else if (a[3] === b[3]){
                if (a[1] > b[1]) {
                    return -1;
                } else if (a[1] === b[1] && a[0] < b[0]){
                    return -1;
                }
            } return 1;
        });
    }

    return rank;
};

function getLitterRanks(d){
    var rank = [];
    for (var c = 0; c < d.length; c++){
        if (d[c][4] !== 0){
            rank.push([d[c][0], d[c][4], d[c][6], parseFloat((d[c][4] / d[c][6]).toFixed(2))]);
        }
    }
    if (rank.length > 1){
        rank.sort(function(a, b){
            if (a[3] > b[3]){
                return -1;
            } else if (a[3] === b[3]){
                if (a[1] > b[1]) {
                    return -1;
                } else if (a[1] === b[1] && a[0] < b[0]){
                    return -1;
                }
            } return 1;
        });
    }

    return rank;
};

function getToteRanks(d){
    var rank = [];
    for (var c = 0; c < d.length; c++){
        if (d[c][5] !== 0){
            rank.push([d[c][0], d[c][5], d[c][6], parseFloat((d[c][5] / d[c][6]).toFixed(2))]);
        }
    }
    if (rank.length > 1){
        rank.sort(function(a, b){
            if (a[3] > b[3]){
                return -1;
            } else if (a[3] === b[3]){
                if (a[1] > b[1]) {
                    return -1;
                } else if (a[1] === b[1] && a[0] < b[0]){
                    return -1;
                }
            } return 1;
        });
    }

    return rank;
};

function getNoCoopRanks(d){
    var rank = [];
    for (var c = 0; c < d.length; c++){
        if (d[c][1] + d[c][2] + d[c][4] + d[c][5] !== 0){
            rank.push([d[c][0], d[c][1] + d[c][2] + d[c][4] + d[c][5], d[c][6], parseFloat(((d[c][1] + d[c][2] + d[c][4] + d[c][5]) / d[c][6]).toFixed(2))]);
        }
    }
    if (rank.length > 1){
        rank.sort(function(a, b){
            if (a[3] > b[3]){
                return -1;
            } else if (a[3] === b[3]){
                if (a[1] > b[1]) {
                    return -1;
                } else if (a[1] === b[1] && a[0] < b[0]){
                    return -1;
                }
            } return 1;
        });
    }

    return rank;
};

function getOverallRanks(d){
    var rank = [];
    for (var c = 0; c < d.length; c++){
        if (d[c][1] + d[c][2] + d[c][3] + d[c][4] + d[c][5] !== 0){
            rank.push([d[c][0], d[c][1] + d[c][2] + d[c][3] + d[c][4] + d[c][5], d[c][6], parseFloat(((d[c][1] + d[c][2] + d[c][3] + d[c][4] + d[c][5]) / d[c][6]).toFixed(2))]);
        }
    }
    if (rank.length > 1){
        rank.sort(function(a, b){
            if (a[3] > b[3]){
                return -1;
            } else if (a[3] === b[3]){
                if (a[1] > b[1]) {
                    return -1;
                } else if (a[1] === b[1] && a[0] < b[0]){
                    return -1;
                }
            } return 1;
        });
    }

    return rank;
};

function checkingThis(){

};