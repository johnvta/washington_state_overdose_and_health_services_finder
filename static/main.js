// Initialize the map centered on Washington State
var map = L.map('map').setView([47.5, -120.7401], 7);

// Add base layer from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 15,
        minZoom: 5
    }).addTo(map);

/* BEGINNING OF HEALTH SITES SECTION */ 

// Variables to hold health sites data
var hospitalLayer = L.layerGroup();
var emsLayer = L.layerGroup();
var otpLayer = L.layerGroup();
var nonOpioidLayer = L.layerGroup();        
var harmReductionLayer = L.layerGroup();

// Variable to hold the currently highlighted circle marker
let highlightedCircleMarker;        

// Function to generate the popup table content for health sites
function healthPopupTable(feature) {
    const lat = feature.geometry.coordinates[1].toFixed(5);
    const lon = feature.geometry.coordinates[0].toFixed(5);

    return `
        <div>
            <h2 class="health-popup-title">${feature.properties.name}</h2>
            <table class="health-popup-table">
                <tr>
                    <td><strong>Type</strong></td>
                    <td>${feature.properties.amenity}</td>
                </tr>
                <tr>
                    <td><strong>Address</strong></td>
                    <td>${feature.properties.address}</td>
                </tr>
                <tr>
                    <td><strong>City</strong></td>
                    <td>${feature.properties.city}</td>
                </tr>
                <tr>
                    <td><strong>State</strong></td>
                    <td>${feature.properties.state}</td>
                </tr>
                <tr>
                    <td><strong>Zipcode</strong></td>
                    <td>${feature.properties.zipcode}</td>
                </tr>
                <tr>
                    <td><strong>County</strong></td>
                    <td>${feature.properties.county}</td>
                </tr>
                <tr>
                    <td><strong>Coordinates</strong></td>
                    <td>${lat}, ${lon}</td>
                </tr>
            </table>
        </div>
    `;
}     

// Load health sites data from GeoJSON file and display as a GeoJSON point layer
// For each health site, create a marker on the map with a specific icon based on the 'amenity' type
// Popups show information like the health site's type, name, and city
fetch('/health_sites')
    .then(res => res.json()) // Parse the response as JSON
    .then(data => {
    // Create a GeoJSON layer for the health sites data
    L.geoJson(data, {
        // Function to bind a popup to each feature displaying health site information
        onEachFeature: function(feature, layer) {
            layer.bindPopup(healthPopupTable(feature), {
                className: 'health-popup-wrapper',
                offset: L.point(0, -15)
            });
        },
        // Function to define how to display each feature (GeoJSON point) on the map
        pointToLayer: function(feature, latlng) {
            var marker;
            if (feature.properties.amenity === "Hospital"){ 
                marker = L.marker(latlng, {icon: hospitalIconInstance});
                hospitalLayer.addLayer(marker);
            } else if (feature.properties.amenity === "Emergency Medical Services") {
                marker = L.marker(latlng, {icon: emsIconInstance});
                emsLayer.addLayer(marker);
            } else if (feature.properties.amenity === "Opioid Treatment Programs") {
                marker = L.marker(latlng, {icon: otpIconInstance});
                otpLayer.addLayer(marker);
            } else if (feature.properties.amenity === "Non-Opioid Rehab Facility") {
                marker = L.marker(latlng, {icon: nonOpioidIconInstance});
                nonOpioidLayer.addLayer(marker);
            } else {
                marker = L.marker(latlng, {icon: harmReductionIconInstance});
                harmReductionLayer.addLayer(marker);
            }
            // Add click event to draw a circle around the marker
            marker.on('click', function() {
                // Remove any existing circle
                if (highlightedCircleMarker) {
                    map.removeLayer(highlightedCircleMarker);
                }
                // Create a new circle around the clicked marker
                highlightedCircleMarker = L.circleMarker(latlng, {
                    fillColor: '#EFF9F2',
                    fillOpacity: 0.9,
                    color: 'white', 
                    weight: 1, 
                    radius: 20
                }).addTo(map);
            }); 
            return marker;
        }
    });
});

// Create custom icons for different health sites
var hospitalIcon = L.Icon.extend({ 
    options:{ iconUrl: '/static/icons/hospital.png', iconSize: [24,24] }
});
var hospitalIconInstance = new hospitalIcon();

var emsIcon = L.Icon.extend({ 
    options:{ iconUrl: '/static/icons/ambulance.png', iconSize: [24,24] }
});   
var emsIconInstance = new emsIcon();

var otpIcon = L.Icon.extend({ 
    options:{ iconUrl: '/static/icons/opioid.png', iconSize: [24,24] }
});   
var otpIconInstance = new otpIcon();  

var nonOpioidIcon = L.Icon.extend({ 
    options:{ iconUrl: '/static/icons/nonopioid.png', iconSize: [24,24] }
});   
var nonOpioidIconInstance = new nonOpioidIcon();

var harmReductionIcon = L.Icon.extend({ 
    options:{ iconUrl: '/static/icons/harmreduction.png', iconSize: [24,24] }
});   
var harmReductionIconInstance = new harmReductionIcon(); 

/* BEGINNING OF FATAL OVERDOSE SECTION */

// Variables to hold layer groups for fatal overdose count per county for different time periods
var fatalOverdoseLayer2003 = L.layerGroup();
var fatalOverdoseLayer2013 = L.layerGroup();
var nonFatalOverdoseLayer2003 = L.layerGroup();
var nonFatalOverdoseLayer2013 = L.layerGroup();

// Function to generate the popup table content for overdoses
function overdosePopupTable(feature) {
    const props = feature.properties;
    // Choose which field to display
    const count = props.dataType === 'fatal'
        ? (props.timePeriod === '2003-2007' ? props.fatal_count_2003_07 : props.fatal_count_2013_17)
        : (props.timePeriod === '2003-2007' ? props.nonfatal_count_2003_07 : props.nonfatal_count_2013_17);

    const capita = props.dataType === 'fatal'
        ? (props.timePeriod === '2003-2007' ? props.fatal_capita_2003_07 : props.fatal_capita_2013_17)
        : (props.timePeriod === '2003-2007' ? props.nonfatal_capita_2003_07 : props.nonfatal_capita_2013_17);    

    return `
        <div>
            <h2 class="overdose-popup-title">${props.county}</h2>
            <table class="overdose-popup-table">
                <tr>
                    <td><strong>Population</strong></td>
                    <td>${props.population.toLocaleString()}</td>
                </tr>
                <tr>
                    <td><strong>Overdose Count</strong></td>
                    <td>${count}</td>
                </tr>
                <tr>
                    <td><strong>Per Capita Rate</strong></td>
                    <td>${capita}</td>
                </tr>
            </table>
        </div>
    `;
}

// 
function loadOverdoseLayer({
    url,
    timePeriod,
    type,
    layerGroup
}) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            data.features.forEach(feature => {
                feature.properties.timePeriod = timePeriod; // '2003-2007' or '2013-2017'
                feature.properties.dataType = type; // 'fatal' or 'nonfatal'
            });

            L.geoJson(data, {
                style: function(feature) {
                    return (type === 'fatal') ? fatalStyle(feature) : nonFatalStyle(feature);
                },
                onEachFeature: function(feature, layer) {
                    layer.bindPopup(overdosePopupTable(feature), {
                        className: 'overdose-popup-wrapper'
                    });
                }
            }).addTo(layerGroup);
        });
}

// 
loadOverdoseLayer({
    url: '/county_overdose',
    timePeriod: '2003-2007',
    type: 'fatal',
    layerGroup: fatalOverdoseLayer2003
});

loadOverdoseLayer({
    url: '/county_overdose',
    timePeriod: '2013-2017',
    type: 'fatal',
    layerGroup: fatalOverdoseLayer2013
});

loadOverdoseLayer({
    url: '/county_overdose',
    timePeriod: '2003-2007',
    type: 'nonfatal',
    layerGroup: nonFatalOverdoseLayer2003
});

loadOverdoseLayer({
    url: '/county_overdose',
    timePeriod: '2013-2017',
    type: 'nonfatal',
    layerGroup: nonFatalOverdoseLayer2013
});

// Function to set color classification based on fatal overdose count
// This function assigns a color to each county's polygon based on the number of fatal overdoses
// Higher overdose counts will have darker green shades, while lower counts will have lighter green shades
function fatalSetColor(x){
    return x > 228 ? '#006d2c' :   // Very High
            x > 91 ? '#2ca25f' :   // High
            x > 32 ? '#66c2a4' :   // Medium
            x >= 9 ? '#99d8c9' :   // Low
                        '#eff3ff' ;   // Very Low
}

// Function to set style for the fatal overdose layers
function fatalStyle(feature) {
    // Use the appropriate fatal count based on the time period
    let fatalCount = feature.properties.timePeriod === '2003-2007' 
                    ? feature.properties.fatal_count_2003_07 
                    : feature.properties.fatal_count_2013_17;
    return {
        fillColor: fatalSetColor(fatalCount),
        fillOpacity: 0.8,
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '0'
    };
}

// Function to set color classification based on non-fatal overdose count
// This function assigns a color to each county's polygon based on the number of non-fatal overdoses
// Higher non-fatal overdose counts will have darker blue shades, while lower counts will have lighter blue shades
function nonFatalSetColor(x){
    return x > 1994 ? '#08519c' :   // Very High
            x > 957 ? '#3182bd' :   // High
            x > 166 ? '#6baed6' :   // Medium
            x > 46 ? '#bdd7e7' :   // Low
                        '#eff3ff' ;   // Very Low
}

// Function to set style for the non-fatal overdose layers
function nonFatalStyle(feature) {
    let nonFatalCount = feature.properties.timePeriod === '2003-2007' 
        ? feature.properties.nonfatal_count_2003_07 
        : feature.properties.nonfatal_count_2013_17; // ← this was flipped before
    return {
        fillColor: nonFatalSetColor(nonFatalCount),
        fillOpacity: 0.8,
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '0'
    };
}

/* BEGINNING OF LAYERS CONTROL SECTION */

// Define base layers for overdose data, categorized by time periods and severity (fatal and non-fatal overdoses)
const baseLayers = {
    "<b>Fatal Overdoses <i style='color: #3d3b3b'>(2003-2007)": fatalOverdoseLayer2003,
    "<b>Fatal Overdoses <i style='color: #3d3b3b'>(2013-2017)": fatalOverdoseLayer2013,
    "<b>Non-Fatal Overdoses <i style='color: #3d3b3b'>(2003-2007)": nonFatalOverdoseLayer2003,
    "<b>Non-Fatal Overdoses <i style='color: #3d3b3b'>(2013-2017)": nonFatalOverdoseLayer2013
};

// Define overlay layers for health services, represented with custom icons for each service
const overlayLayers = {
    "<img src='icons/hospital.png' style='width: 15px; height: 15px; vertical-align: middle;'> Hospitals": hospitalLayer,
    "<img src='icons/ambulance.png' style='width: 15px; height: 15px; vertical-align: middle;'> Emergency Medical Services": emsLayer,
    "<img src='icons/opioid.png' style='width: 15px; height: 15px; vertical-align: middle;'> Opioid Treatment Programs": otpLayer,
    "<img src='icons/nonopioid.png' style='width: 15px; height: 15px; vertical-align: middle;'> Non-Opioid Rehab Facility": nonOpioidLayer,
    "<img src='icons/harmreduction.png' style='width: 15px; height: 15px; vertical-align: middle;'> Harm Reduction Services": harmReductionLayer
};

// Create the control layer to the map, allowing users to toggle between base layers and overlay layers
const controlLayer = new L.control.layers(baseLayers, overlayLayers, { collapsed: false,  position: 'topright' }).addTo(map);

// Add title for base layers
const baseTitle = document.createElement('div');
baseTitle.innerHTML = '<div class="control-title"><span style="font-size:16pt"><b>Overdose Data</b></span>';
baseTitle.style.textAlign = 'center';
document.querySelector('.leaflet-control-layers-base').insertAdjacentElement('beforebegin', baseTitle);

// Add title for overlay layers
const overlayTitle = document.createElement('div');
overlayTitle.innerHTML = '<div class="control-title"><span style="font-size:16pt"><b>Health Sites</b></span>';
overlayTitle.style.textAlign = 'center';
document.querySelector('.leaflet-control-layers-overlays').insertAdjacentElement('beforebegin', overlayTitle);


/* BEGINNING OF LEGEND SECTION */

// Create a Leaflet control object for the fatal overdose legend
var fatalLegend = L.control({ position: 'bottomright' });
fatalLegend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'legend');
    // Define an array of legend items for fatal overdoses, including color and label
    var fatalLegendItems = [
        { color: '#006d2c', label: 'Very High: 229+' },
        { color: '#2ca25f', label: 'High: 92-228' },
        { color: '#66c2a4', label: 'Medium: 33-91' },
        { color: '#99d8c9', label: 'Low: 10-32' },
        { color: '#eff3ff', label: 'Very Low: 1-9' }    
    ];
    // Add title for the legend
    div.innerHTML += '<div class="legend-title"><b>Fatal Drug Overdoses</b><br>per County in Washington<br>';
    // Loop through each legend item and create a colored icon and label
    fatalLegendItems.forEach(function(item) {
        div.innerHTML += `<i style="background: ${item.color}"></i><p>${item.label}</p>`;
    });
    return div;
};

// Create a Leaflet control object for the non-fatal overdose legend
var nonFatalLegend = L.control({ position: 'bottomright' });
nonFatalLegend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'legend');
    // Define an array of legend items for non-fatal overdoses, including color and label
    var nonFatalLegendItems = [
        { color: '#08519c', label: 'Very High: 1995+' },
        { color: '#3182bd', label: 'High: 958-1994' },
        { color: '#6baed6', label: 'Medium: 167-957' },
        { color: '#bdd7e7', label: 'Low: 47-166' },
        { color: '#eff3ff', label: 'Very Low: 1-46' }    
    ];
    div.innerHTML += '<div class="legend-title"><b>Non-Fatal Drug Overdoses</b><br>per County in Washington<br>';
    // Loop through each legend item and create a colored icon and label
    nonFatalLegendItems.forEach(function(item) {
        div.innerHTML += `<i style="background: ${item.color}"></i><p>${item.label}</p>`;
    });
    return div;
};

// Listen for 'layeradd' event to display the appropriate legend when an overlay layer is added to the map
map.on('layeradd', function(event) {
    // If the added layer is a non-fatal overdose layer, remove the fatal overdose legend and add the non-fatal legend
    if (event.layer === nonFatalOverdoseLayer2003 || event.layer === nonFatalOverdoseLayer2013) {
        map.removeControl(fatalLegend);
        nonFatalLegend.addTo(map);
    } 
    // If the added layer is a fatal overdose layer, remove the non-fatal legend and add the fatal legend
    else if (event.layer === fatalOverdoseLayer2003 || event.layer === fatalOverdoseLayer2013) {
        map.removeControl(nonFatalLegend);
        fatalLegend.addTo(map);
    }
});

// Listen for 'overlayremove' event to remove the appropriate legend when an overlay layer is removed from the map
map.on('overlayremove', function(event) {
    // If a fatal overdose layer is removed, remove the fatal legend
    if (event.layer === fatalOverdoseLayer2003 || event.layer === fatalOverdoseLayer2013) {
        map.removeControl(fatalLegend);
    } 
    // If a non-fatal overdose layer is removed, remove the non-fatal legend
    else if (event.layer === nonFatalOverdoseLayer2003 || event.layer === nonFatalOverdoseLayer2013) {
        map.removeControl(nonFatalLegend);
    }
});

// Add the geocoder control to the map, allowing users to search for locations by name
var geocoder = L.Control.geocoder({
    position: "topleft",
    placeholder: "Enter place name",
    errorMessage: "No place found.",
})
.on('result', function(place) {
    map.setView(place.latlng, 13); 
    // Remove previous search marker if it exists
    if (window.searchMarker) {
        map.removeLayer(window.searchMarker);
    }
    window.searchMarker = L.marker(place.latlng).addTo(map) // Add a new marker for the search result
        .bindPopup(place.query) // Bind the place name to the marker
        .openPopup(); // Automatically open the popup
})
.addTo(map);