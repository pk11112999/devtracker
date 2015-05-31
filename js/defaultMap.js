var mapSouthWest = L.latLng(40.4584, -74.3253),
	mapNorthEast = L.latLng(40.9560, -73.6359),
	map = L.map('map', {
		center: [40.7160,-73.9668],
		zoom: 10,
		scrollWheelZoom: false,
		maxBounds: L.latLngBounds(mapSouthWest, mapNorthEast)
	   });		
var selfUrl = 'http://nycdevelopmenttracker.com';
var selfAttrib = '| <a href='+ selfUrl +'>nycdevelopmenttracker.com</a>';
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var attrib = osmAttrib + selfAttrib;
var osm = new L.TileLayer(osmUrl, {minZoom: 10, maxZoom: 18, attribution: attrib});		
// Generate map
osm.addTo(map);