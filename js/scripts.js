
// Initialize the map, slightly off center of BK for sidebar

const BKLatLng = [40.6546199, -74.0105805];

var map = L.map('redlining-map', {zoomControl: false}).setView(BKLatLng, 12);

L.tileLayer('https://b.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// After initially diabling zoom-control, add it back in different location
L.control.zoom({position:'topright'}).addTo(map);

$('#pane-toggle-button').click(() => {

  $('#pane-container').toggleClass("pane-collapsed")

  const isCollapsed = $('#pane-container').hasClass("pane-collapsed");

  if (isCollapsed) {
    $('#pane-toggle-icon').attr('class', 'ion-chevron-right')
  } else {
    $('#pane-toggle-icon').attr('class', 'ion-chevron-left')
  }

});
