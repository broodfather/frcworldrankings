//This module is the application's interface to accessing all FRC data from thebluealliance (TBA)

//current displays flagged here
var displayDashboard = true;
var displayEvent = false;
var displayTeam = false;

/**
 * @description displays the dashboard
 */
function showDashboard(){
    var tagLink = document.getElementById("mithril-scroll-tag");
    var container = document.getElementById("mithril-stuff");

    var rowBreaker;
    var rows = [];
    var cells;

    var tagLinks = [];
    var linkRows = [];

    var myDate = '2000-01-01';

    var compDate1;
    var compDate2;

    var tagCount = 0;

    var monthDay;

    // Do the following `numberOfRows` times:
    for (var i = 1; i < events.length; i++) {

        compDate1 = new Date(events[i]['start_date'].replace(/-/g, "/"));
        compDate2 = new Date(myDate.replace(/-/g, "/")).getTime() + (4 * 86400000);

        //console.log(new Date(events[i]['start_date'].replace(/-/g, "/")));
        //console.log(new Date(myDate.replace(/-/g, "/")) + 4);
        if (compDate1 > +compDate2){
            if (tagCount == 0){
                tagLinks = [];
                tagLinks.push(m('div', { class: 'col-xs-1 no-border' }, ''));
            }

            myDate = events[i]['start_date'];

            monthDay = compDate1.getUTCMonth() + 1 + ' / ' + compDate1.getUTCDate();

            rowBreaker = m('div', { class: 'col-xs-2 text-center text-danger bg-info', id: myDate }, 'Start Date: ' + monthDay);
            rows.push(m('div', { class: 'row top-buffer' }, rowBreaker));

            tagLinks.push(m('a', { class: 'col-xs-1 text-center text-danger bg-info border-please', href: '#' + myDate }, monthDay));

            tagCount += 1;

            if (tagCount == 3){
                tagCount = 0;
                linkRows.push(m('div', { class: 'row' }, tagLinks));
            }
        }


        // - create a row (an array of mithril cells) and add a header cell to it;
        cells = [];

        cells.push(m('button[type=button]', { class: 'col-xs-8 bigger-font', onclick: 'sayHi()' }, '' + events[i]["name"]));

        // - when the row is ready, push it to our table.
        rows.push(m('div', { class: 'row' }, cells));
    }

    // When the table has been populated, render it in the live DOM.
    var eventLinks = m('div', { class: 'container-fluid' }, rows);
    m.render(tagLink, linkRows, true);
    m.render(container, eventLinks, true);
}

function sayHi(){
    alert('hi');
}

/**
 * @description displays the event
 */
function showEvent(){

}

/**
 * @description displays the teams
 */
function showTeam(){

}

/**
 * @description generating generic display for current display flag
 */
function generateGenericDisplay(){
    if (displayDashboard){
        showDashboard();
    } else if (displayEvent){
        showEvent();
    } else if (displayTeam){
        showTeam();
    }
}

//specific data request
function getEventsData(year){
    if (!year || year == 0){
        year = new Date().getFullYear();
    }
    console.log("Getting event list for year " + year);
    var url = baseurl + "events/" + year + whoAmI;

    console.log('getting data from url: ' + url);
    m.request({
        method: "GET",
        url: url
    }).then(function(data){
        eventsReadyFlag = true;
        data = sortData(data);

        console.log("Logging sorted data");

        logDataKeys(data);

        console.log("Returning data for last request.");

        events = data;
    });
}


//TBA provided URL API actions
var baseurl = "http://www.thebluealliance.com/api/v2/";
var whoAmI = "?X-TBA-App-Id=smallscalesolutions:frc_statistical_pages:v0.0.3";

//global variables for data that exists
var events = 'undefined';
var eventsReadyFlag = false;
var readyEvents = function(isReady){
    eventsReadyFlag = true;
};


//initialize basic data from the start
function initLoader(){

}

//locking disables the elements
function lockDataModules(){

}
function lockDataModule(){

}

//unlocking enables the elements
function unlockDataModules(){

}
function unlockDataModule(){

}

/**
 * @description will pull all of the data from thebluealliance (TBA)
 */
function allDataPuller(){
    //getEventList(2015, readyEvents);
    events = getEventsData(2015);


    //check if all data is ready
    //migrate to a ready list later
    checkReady();
}

/**
 * @description checks for all data ready
 *
 */
function checkReady(){
    console.log("Checking Ready?");
    if (eventsReadyFlag){
        console.log("Data is ready at this point.");

        generateGenericDisplay();
    } else {
        console.log("Not Ready");
        setTimeout(function(){
            checkReady();
        }, 500);
    }
}

/**
 * @param url
 * @event request
 * @event then
 *
 * @description this is the base function for requesting data from thebluealliance (TBA)
 */
function dataRequest(url, readyItem){
    console.log('getting data from url: ' + url);
    m.request({
        method: "GET",
        url: url
    }).then(function(data){
        console.log("Returning data for last request.");

        /*
        data = sortData(data);
        logDataKeys(data);
        */

        return data;
    }).then(function(){
        readyItem(true);
    });
}

function sortData(data){
    console.log('Sorting the data');

    var dataArray = [];

    for (var i in data) {
        //console.log(i);
        //console.log(data[i]["start_date"] + " " + data[i]["name"] + " " + data[i]["key"]);
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

function logDataKeys(data){
    console.log('logging data keys of returned data with length: ' + data.length);

    for (var i = 0; i < data.length; i++) {
        console.log(data[i]["start_date"] + " " + data[i]["name"] + " " + data[i]["key"]);
    }
}

/**
 * @param year
 * @property events
 *
 * @description this function will populate the events variable using dataRequest(url)
 */
function getEventList(year, readyItem){
    if (!year || year == 0){
        year = new Date().getFullYear();
    }
    console.log("Getting event list for year " + year);
    var url = baseurl + "events/" + year + whoAmI;

    events = dataRequest(url, readyItem);
}