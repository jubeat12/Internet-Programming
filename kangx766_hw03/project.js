function display_preview (elementID){
	document.getElementById(elementID).style.display = "block";
}

function remove_preview (elementID){
	document.getElementById(elementID).style.display = "none";
}

var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 44.9727, lng: -93.23540000000003},
	  zoom: 14
	});
	markaddress();
	geolocator();
}

var scheduleMarkers = [];
var mapMarkers = [];
function markaddress(){
    var event_name = document.getElementsByClassName("event_name");
    var address = document.getElementsByClassName("event_address");
    
    for (var i = 0; i < event_name.length; i++){
        scheduleMarkers.push([event_name[i].textContent.toString(), address[i].textContent.toString()]); 
    }
    
	var geocoder = new google.maps.Geocoder();
    var infoWindow = new google.maps.InfoWindow();
    var j = 0;
	
    for (var i = 0; i < scheduleMarkers.length; i++) {
        geocoder.geocode({'address': scheduleMarkers[i][1]}, function (results, status) {
            if (status === 'OK') {
                map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    icon: "./favicon.ico"
                });
				infoWindow.setContent(scheduleMarkers[j][0]+"<br/>"+scheduleMarkers[j][1]);
				google.maps.event.addListener(marker, 'mouseover', (function(marker){
                    return function () {
                        infoWindow.open(map, marker);
                    };
                })(marker));
				google.maps.event.addListener(marker, 'mouseout', function(){
                        infoWindow.close();
                });
                mapMarkers.push(marker);
                j++;
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }
}

function findLocation() {
	var service = new google.maps.places.PlacesService(map);
	map = new google.maps.Map(document.getElementById('map'), {
		center: currentposition,
		zoom: 14
	});
    
    for (var i = 0; i < mapMarkers.length; i++) {
        mapMarkers[i].setMap(null);
    }
    mapMarkers.length = 0;
    var radius = document.getElementById('Radius').value;
	if(document.getElementById("PlaceType").value !== "Other"){
		service.nearbySearch({
			location: currentposition,
			radius: radius,
			type: [document.getElementById('PlaceType').value]
		}, callback);
	}
	else{
		service.textSearch({
			location: currentposition,
			radius: radius,
			query: [document.getElementById('OtherType').value]
		}, callback);
	}
}

function checkother(){
	if(document.getElementById("PlaceType").value !== "Other"){
		document.getElementById("OtherType").disabled = true;
	}
	else{
		document.getElementById("OtherType").disabled = false;
	}
}

function callback(results, status) {
  if (status === "OK") {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });
    google.maps.event.addListener(marker, 'mouseover', function () {
        infoWindow.setContent(place.name+"<br/>"+place.address);
        infoWindow.open(map, this);
    });
	google.maps.event.addListener(marker, 'mouseout', function () {
        infoWindow.close();
    });
    mapMarkers.push(marker);
}

var currentposition;
function geolocator() {
    var infoWindow = new google.maps.InfoWindow;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            currentposition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(currentposition);
            map.setCenter(currentposition);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, currentposition) {
	infoWindow.setPosition(currentposition);
	infoWindow.setContent(browserHasGeolocation ?
						  'Error: The Geolocation service failed.' :
						  'Error: Your browser doesn\'t support geolocation.');
	infoWindow.open(map);
}

function route() {
    var directionsService = new google.maps.DirectionsService;
    map = new google.maps.Map(document.getElementById('map'), {
        center: currentposition,
        zoom: 14
    });
    var directionsDisplay = new google.maps.DirectionsRenderer({
        panel: document.getElementById('route')
    });
    document.getElementById('route').innerHTML = '';
    directionsDisplay.setMap(map);
    givenDirections(currentposition, document.getElementById("Dest").value, directionsService, directionsDisplay);
    
}

function givenDirections(origin, destination, service, display) {
    var travelMode;
	var mode = document.getElementsByName('routetype');
	for (var i = 0; i < mode.length; i++){
		if (mode[i].checked)
		{
			travelMode = mode[i].value;
			break;
		}
	}
    service.route({
        origin: new google.maps.LatLng(origin),
        destination: destination,
        travelMode: google.maps.TravelMode[travelMode]
    }, function (response, status) {
        if (status === 'OK') {
            display.setDirections(response);
        } else {
            alert('Could not display directions due to: ' + status);
        }
    });
}

function formvalidator() {
	var event = document.getElementById("eventname").value;
	var location = document.getElementById("location").value;
	if(event.search(/^[0-9a-zA-Z]+$/) !==0 || location.search(/^[0-9a-zA-Z]+$/) !==0){
		alert("Error: event name and location must be alphanumeric");
		return false;
	}
	return true;
}

var moves = 0;
var previousplayer = "";
var winner = [['one', 'two', 'three'],['four', 'five', 'six'],['seven', 'eight', 'nine'], ['one', 'four', 'seven'],['three', 'six', 'nine'], ['three', 'five', 'seven']
	['two', 'five', 'eight'], ['one', 'five', 'nine']];

function win() {
	for(var x = 0; x < 8; x++){
		var firstcell = document.getElementById(winner[x][0]).style.backgroundColor;
		var secondcell = document.getElementById(winner[x][1]).style.backgroundColor;
		var thirdcell = document.getElementById(winner[x][2]).style.backgroundColor;
		if(firstcell === 'red' && secondcell === 'red' && thirdcell === 'red'){
			alert("Red Player beat Blue Player!");
			resetgame();
		}
		else if(firstcell === 'blue' && secondcell === 'blue' && thirdcell === 'blue'){
			alert("Blue Player beat Red Player!");
			resetgame();
		}
	}
	if(moves === 9){
		alert("Draw");
		resetgame();
	}
}
function tictactoegame() {
	var playercell = document.getElementById("cellname").value.toLowerCase();
	var playercolor = document.getElementById("cellcolor").value.toLowerCase();
	if(playercell.search(/^[a-zA-Z]+$/) !==0){
		alert("Cell Name must be alphabetic");
		return false;
	}
	if(playercolor === previousplayer){
		alert("pick different player");
		return false;
	}
	if(playercell==="one" || playercell==="two" || playercell==="three" || playercell==="four" || playercell==="five" || playercell==="six" || playercell==="seven" 
	|| playercell==="eight" || playercell==="nine"){
		if(document.getElementById(playercell).style.backgroundColor === 'rgb(168, 255, 168)'){
			document.getElementById(playercell).style.backgroundColor = playercolor;
		}
		else{
			alert("This cell name has already been chosen");
			return false;
		}
	}
	else{
		alert("write cell name only");
		return false;
	}
	previousplayer = playercolor; 
	moves++;
	setTimeout(win, 5);
	return true;
}
function resetgame() {
	moves = 0;
	previousplayer = "";
	document.getElementById("cellname").value = "";
	document.getElementById("one").style.backgroundColor = "#a8ffa8";
	document.getElementById("two").style.backgroundColor = "#a8ffa8";
	document.getElementById("three").style.backgroundColor = "#a8ffa8";
	document.getElementById("four").style.backgroundColor = "#a8ffa8";
	document.getElementById("five").style.backgroundColor = "#a8ffa8";
	document.getElementById("six").style.backgroundColor = "#a8ffa8";
	document.getElementById("seven").style.backgroundColor = "#a8ffa8";
	document.getElementById("eight").style.backgroundColor = "#a8ffa8";
	document.getElementById("nine").style.backgroundColor = "#a8ffa8";
}