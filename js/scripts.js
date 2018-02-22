
// Initialize the map, slightly off center of BK for sidebar
const BKLatLng = [40.6546199, -74.0105805];

var map = L.map('redlining-map', {zoomControl: false}).setView(BKLatLng, 12);

L.tileLayer('https://b.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attribution">CARTO</a>'
}).addTo(map);

// After initially diabling zoom-control, add it back in different location
L.control.zoom({position:'topright'}).addTo(map);


const lookupGradeColor = (grade) => {
  switch (grade) {
    case 'A': return '#6F9929'
    case 'B': return '#94B1B8'
    case 'C': return '#E6DD55'
    case 'D': return '#CF4C5B'
  };
};

// Create this before listeners, reassign after.
let geojsonHOLC;

// The layer that was last clicked
let selected = null;

const highlightStyle = {
  weight: 4,
  opacity: 1,
  fillOpacity: 0.9
};

const populatePane = (e) => {
  const layer = e.target;

  const previous = selected;
  selected = layer;

  if (previous) geojsonHOLC.resetStyle(previous);

  selected.setStyle(highlightStyle);

  // expand the side pane
  const isCollapsed = $('#pane-container').hasClass("pane-collapsed");
  if (isCollapsed) $('#pane-toggle-button').trigger('click');

  // add area description to side pane
  const areaDesciptionData = selected.feature.properties.area_description_data;
  console.log(areaDesciptionData);

  const areaName = areaDesciptionData['6']
    .replace(/\d/g, '')
    .replace(/\b[ABCD]\b/g, '')
    .replace(/[bB]rooklyn/g, '')
    .replace(/^[\s-,+]+/g, '')
    .replace(/[\s-,+]+$/g, '')



  $('#title-inhabitants').text('Inhabitants:');
  $('#title-description').text('Description:');

  $('#area-name').text(areaName);
  $('#area-inhabitants').text(areaDesciptionData['2e']);
  $('#area-description').text(areaDesciptionData['5']);

};

const highlightFeature = (e) => {
  const layer = e.target;
  layer.setStyle(highlightStyle);
}

const resetHighlight = (e) => {
  const layer = e.target;
  if (selected === null || selected._leaflet_id !== layer._leaflet_id) {
    geojsonHOLC.resetStyle(layer);
  }
}


$.getJSON('data/bk_boundary.geojson', function(bk_boundary) {
  L.geoJSON(bk_boundary, {
    style: {
      weight: 1,
      color: 'black',
      fillOpacity: 0,
    }
  }).addTo(map);
});

$.getJSON('data/HOLC_Brooklyn.geojson', function(holc) {

  // 'geojson' created before listeners, now reassign after (http://leafletjs.com/examples/choropleth/)
  geojsonHOLC = L.geoJSON(holc, {
    style: (feature) => {
      return {
        color: lookupGradeColor(feature.properties.holc_grade),
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.7
      };
    },
    onEachFeature: function(feature, layer) {
      // console.log(feature.properties);

      layer.on({
        'click': populatePane,
        'mouseover': highlightFeature,
        'mouseout': resetHighlight
      });
    }
  });

  geojsonHOLC.addTo(map);

  // There are two sets of overlapping polygons. Loop over all the layers, if
  // the layer is one fo the smaller covered ones, bring it to the front
  Object.entries(geojsonHOLC._layers).forEach((e) => {
    const layer = e[1];
    if (['C2', 'D15'].includes(layer.feature.properties.holc_id)) {
      layer.bringToFront();
    }
  });

});


// Disable leaflet events on elements in front
$('#pane-container').on('mouseover', () => {
  map.dragging.disable();
});
$('#pane-container').on('mouseout', () => {
  map.dragging.enable();
});

// Side pane collapse control
$('#pane-toggle-button').click(() => {

  $('#pane-container').toggleClass("pane-collapsed");

  const isCollapsed = $('#pane-container').hasClass("pane-collapsed");

  if (isCollapsed) {
    $('#pane-toggle-icon').attr('class', 'ion-chevron-right')
  } else {
    $('#pane-toggle-icon').attr('class', 'ion-chevron-left')
  }
});
