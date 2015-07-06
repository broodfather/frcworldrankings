//global mithril data view element
var container = document.getElementById("mithril-stuff");

//route stuff so we don't hit the server moar than we need to
m.route(container, "/", {
    "/": welcomeView
});