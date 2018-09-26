// Check for the various File API support.
// if (window.File && window.FileReader && window.FileList && window.Blob) {
// 	// Great success! All the File APIs are supported.
// } else {
// 	alert('The File APIs are not fully supported in this browser.');
// }

var map = null;
var markers = [];
var openInfoWindow = null;

var qth = null;

function initMap() {
	map = new google.maps.Map(document.getElementById('map-canvas'), {
		center: { lat: 40, lng: -30 },
		zoom: 3,
		mapTypeId: 'terrain',
	});
}

function clearMarkers() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}

	markers = [];
}

function createInfoWindowForQSO(qso) {
	var info = '<div class="qso">' +
		'<h1>' + qso.call + '</h1>' +
		'<div><p>' +
		'Time:' + qso.qso_date + ' ' + qso.time_on +
		' Band:' + qso.band +
		' Mode:' + qso.mode +
		'</p></div></div>';

	let infowindow = new google.maps.InfoWindow({
		content: info
	});

	return infowindow;
}

function latLonForQso(qso) {
	if (typeof (qso.lat) === 'string' && typeof (qso.lon) === 'string') {
		var latitude = parseCoordinate(qso.lat);
		var longitude = parseCoordinate(qso.lon);
		return [latitude, longitude];
	}

	if (typeof (qso.gridsquare) === 'string' 
		&& (qso.gridsquare.length == 4 || qso.gridsquare.length == 6)) {
		var [latitude, longitude] = latLonForGrid(qso.gridsquare);
		return [latitude, longitude];
	}

	return null;
}

function createMarkerForQSO(qso) {
	var latlon = latLonForQso(qso);
	if (latlon === null) {
		//throw "No location for qso";
		return null;
	}

	var [latitude, longitude] = latlon;

	let marker = new google.maps.Marker({
		title: name,
		position: new google.maps.LatLng(latitude, longitude)
	});

	marker.addListener('click', function () {
		if (openInfoWindow !== null) {
			openInfoWindow.close();
		}

		let infowindow = createInfoWindowForQSO(qso);
		infowindow.open(map, marker);
		openInfoWindow = infowindow;
	});

	return marker;
}

function addMarkerForQSO(qso) {
	var marker = createMarkerForQSO(qso);
	if (marker) {
		marker.setMap(map);
		markers.push(marker);
	}
}

function addMarkersForQSOs(qsos) {
	for (var q = 0; q < qsos.length; q++) {
		addMarkerForQSO(qsos[q]);
	}
}

function handleFiles(files) {
	var numFiles = files.length;
	for (var i = 0, numFiles = files.length; i < numFiles; i++) {
		loadMarkersFromADIF(files[i], addMarkerForQSO);
	}
}

function loadMarkersFromADIF(file, addMarkerFunc) {
	var reader = new FileReader();
	reader.onload = function (e) {
		var qsos = parseADIF(e.target.result);
		for (var q = 0; q < qsos.length; q++) {
			addMarkerFunc(qsos[q]);
		}
	};

	reader.readAsText(file);
}