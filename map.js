// Create Map Object
var map = L.map('map', { center: [42.380754, -71.110236], zoom: 13 });

// Add Tile Layer from MAPC and MassGIS
L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png', {
    attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
    maxZoom: 17,
    minZoom: 9
}).addTo(map);

//custom icons
var rodent_icon = L.Icon.extend({
    options: {
        shadowUrl: "images/rodent_shadow.png",
        iconSize: [36, 36],
        shadowSize: [36, 36],
        iconAnchor: [18, 18],
        shadowAnchor: [18, 18],
        popupAnchor: [0, -6]
    }
});

var citedicons = new rodent_icon({ iconUrl: "images/rodent_open.png", });
var correctedicons = new rodent_icon({ iconUrl: "images/rodent.png", });

// Add Rodent Violation GeoJSON Data
var viopoints = null;

$.getJSON("data/rodent_violations.geojson", function(data) {
    viopoints = L.geoJSON(data, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup(feature.properties.address)
        },
        pointToLayer: function(feature, latlng) {
            if (feature.properties.status == "Cited") {
                var marker = L.marker(latlng, { icon: citedicons });
            } else {
                var marker = L.marker(latlng, { icon: correctedicons });
            }
            return marker;
        }
    }).addTo(map);

});

//polygons data of infested area
var polys = null;
$.getJSON("data/cambridge_neighborhoods.geojson", function(data) {
    polys = L.geoJSON(data, { style: style }).addTo(map);
});

//style the polygon data (choropleth map)
function setcolor(density) {
    return density > 85 ? '#a50f15' :
        density > 15 ? '#de2d26' :
        density > 8 ? '#fb6a4a' :
        density > 4 ? '#fcae91' :
        '#fee5d9';
}

function style(feature) {
    return {
        fillColor: setcolor(feature.properties.rodentDensity),
        fillOpacity: 0.7,
        weight: 2,
        color: "#ffffff",
        dashArray: "3"
    };
}

//legend
var legend = L.control({ position: "topright" });

legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += '<h3>Violation Density</h3>';
    div.innerHTML += '<p><h3>by Neighborhood</h3></p>';
    div.innerHTML += '<b>Violations/Sq. Mi.</b>';
    div.innerHTML += '<br /><i style="background: #a50f15"></i><p>85+</p>';
    div.innerHTML += '<br /><i style="background: #de2d26"></i><p>15-85</p>';
    div.innerHTML += '<br /><i style="background: #fb6a4a"></i><p>8-15</p>';
    div.innerHTML += '<br /><i style="background: #fcae91"></i><p>4-8</p>';
    div.innerHTML += '<br /><i style="background: #fee5d9"></i><p>0-4</p>';
    div.innerHTML += '<br /><hr><h3>Individual Violations</h3>';
    div.innerHTML += '<p><img src = "images/rodent_open.png">Cited</p><br />';
    div.innerHTML += '<p><img src = "images/rodent.png">Corrected</p>';

    return div;
};
legend.addTo(map);

//Add a scale bar
L.control.scale({ position: "bottomleft" }).addTo(map);