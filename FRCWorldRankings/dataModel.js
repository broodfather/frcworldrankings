//TODO This is the data model that the whole application send/receive will use
/**
 *
 * scope:
 *  year, event, team
 *
 * data:
 *  dashboard, //TODO more specific things later
 *
 *
 */

//These are the request URL
var urlObj = {
    _baseURL: "http://www.thebluealliance.com/api/v2/",
    _whoAmI: "?X-TBA-App-Id=smallscalesolutions:frc_statistical_pages:v0.1.5",
    _eventsMod: "events/",
    _eventMod: "event/",
    _matchesMod: "/matches",
    _rankingsMod: "/rankings",
    _teamsMod: "/teams",
    _statsMod: "/stats",

    _eventListURL: function(baseYear, baseEvent){
        console.log("I am giving this one");
        return this._baseURL + this._eventsMod + baseYear + this._whoAmI;
    },
    _eventURL: function(baseYear, baseEvent){
        return this._baseURL + this._eventMod + baseYear + baseEvent + this._whoAmI;
    },
    _eventMatchesURL: function(baseYear, baseEvent){
        return this._baseURL + this._eventMod + baseYear + baseEvent + this._matchesMod + this._whoAmI;
    },
    _eventRankingsURL: function(baseYear, eventKey) {
        return this._baseURL + this._eventMod + eventKey + this._rankingsMod + this._whoAmI;
    },
    _eventTeamsURL: function(baseYear, baseEvent){
        return this._baseURL + this._eventMod + baseYear + baseEvent + this._teamsMod + this._whoAmI;
    },
    _eventStatsURL: function(baseYear, baseEvent){
        return this._baseURL + this._eventMod + baseYear + baseEvent + this._statsMod + this._whoAmI;
    },

    _urlMap: [
        { key: "events",
            url: function(y, e){
                return urlObj._eventListURL(y, e);
            }
        },
        { key: "event",
            url: function(y, e){
                return urlObj._eventURL(y, e);
            }
        },
        { key: "eventMatches",
            url: function(y, e){
                return urlObj._eventMatchesURL(y, e);
            }
        },
        { key: "eventRankings",
            url: function(y, e){
                return urlObj._eventRankingsURL(y, e);
            }
        },
        { key: "eventTeams",
            url: function(y, e){
                return urlObj._eventTeamsURL(y, e);
            }
        },
        { key: "eventStats",
            url: function(y, e){
                return urlObj._eventStatsURL(y, e);
            }
        }
    ]
};

//this is the node interface
module.exports = function(){
    this.sayHi = function(){
        return "Hello";
    };

    this.getDataURL = function(k, y, e){
        for (var c = 0; c < urlObj._urlMap.length; c++){
            if (urlObj._urlMap[c].key == k){
                console.log(k + " " + y + " " + e);
                console.log("Going to return this URL: " + urlObj._urlMap[c].url(y, e));
                return urlObj._urlMap[c].url(y, e);
            }
        }
    };
};
