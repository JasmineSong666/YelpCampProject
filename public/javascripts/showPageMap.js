// console.log(campground)
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

//Display zoom and rotation controls
map.addControl(new mapboxgl.NavigationControl());

//add marker and popup
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h4>${campground.title}</h4><p>${campground.location}</p>`)
    ) // add popup https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker#setpopup
    .addTo(map);
