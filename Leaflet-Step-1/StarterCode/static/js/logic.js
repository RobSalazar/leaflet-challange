// URL for the json request below
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Performing a d3 request to the query URL above
d3.json(url).then(function(data) {
    createFeatures(data.features);
});

// This is the color array for the different depths (lighter for smaller depths and darker for larger)
function getColor(depth) {
    if (depth < 10) {
        return "#77FF33"
    } else if (depth < 30) {
        return "#6EAD2A"
    } else if (depth < 50) {
        return "#F6F92F"
    } else if (depth < 70) {
        return "#F9AC2F"
    } else if (depth < 90) {
        return "#F9471B"
    } else {
        return "#5D1200"
    }
};

// Creating a callable function for the earthquakeData to add features to the map such as popup 
function createFeatures(earthquakeData) {

    // Create a feature that makes earthquakes with higher magnitude will have bigger areas while smaller magnitudes will be smaller cirles in diameter
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Magnitude: ${feature.properties.mag}<h3><hr><p>Location: ${new Date(feature.properties.place)}</
        p>,p>Depth: ${(feature.geometry.coordinates[2])} km</p>`);
    }

    // Create the geoJSON layer and add formatting to the markers
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: feature.properties.mag * 4,
                fillOpacity: 0.8,
                stroke: true,
                color: 'green',
                weight: 1,
                fillColor: getColor(feature.geometry.coordinates[2])
            })
        }
    });

    // Call above function to run it in our map
    createMap(earthquakes);
}
// Creating the callable function to add a new tile layer in
function createMap(earthquakes) {

    //Create the base layers and add API key from config file
    var gray = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {  
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        accessToken: API_KEY,
        id: "mapbox/streets-v11"
    });

    // Adding legend to the map with corresponding colors
    var legend = L.control({
        position: "bottomright"
      });
    
      legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        label = ['<strong>Depth of Epicenter</strong>'];
        var grades = [0, 1, 2, 3, 4, 5];
        var colors = ["#77FF33", "#6EAD2A", "#F6F92F", "#F9AC2F","#F9471B", "#5D1200"];
    
    
      // loop through the intervals of colors to put it in the label
        for (var i = 0; i<grades.length; i++) {
          div.innerHTML +=
          "<li style= 'background: " + colors[i] + "'></li> " +
          grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    
      };
  
    // This will make the map open in a specific location based on coordinates below
    var myMap = L.map("map", {
        center: [
            37.0902, -110.7129
        ],
        zoom: 5

    });

    // Adding more formatting and legend to map
    gray.addTo(myMap);
    earthquakes.addTo(myMap);
    legend.addTo(myMap);
}