$(document).ready(function(){

  var $has = {
    touch: "ontouchend" in document,
    orientation: "onorientationchange" in window,
    geolocation: typeof navigator.geolocation != "undefined",
    transitions: "WebKitTransitionEvent" in window,
    canvas: !!document.createElement("canvas").getContext,
    audio: !!document.createElement("audio").canPlayType,
    localStorage: "localStorage" in window
  };

  var seen = false;
  if($has.localStorage) {
    seen = window.localStorage["seen"] || false;
    window.localStorage["seen"] = "seen";
  }
  if(!seen) {
    $("#showOnce").show();
  }
  
  var rotation = 0, scale = 1;
  
  $("#cropper").bind({ 
    "gesturechange": function(e) {
      var gesture = e.originalEvent;
      // Update the image
      var curScale = gesture.scale * scale; 
      var curRotation = (gesture.rotation + rotation) % 360; 
      //console.log(e.srcElement.id);
  		$("#" + e.srcElement.id).css(
  			"webkitTransform", 
  			"scale(" + curScale + ")" + "rotate(" + curRotation + "deg)"
  		);
    },
    "gestureend": function(e) { 
      var gesture = e.originalEvent; 
      // Store the details for the next gesture
      scale *= gesture.scale; 
      rotation = (rotation + gesture.rotation) % 360;
    } 
  });
  
 // showDialog({heading: "My Dialog Box", content: "This is a dialog!", cancel: true}, clickedOk, "");
	checkForShake();

	$(".locate-me").click(function(e){
		e.preventDefault();
		function checkNetwork(reachability){
			var networkState = reachability.code || reachability;
			
			if networkState == NetworkStatus.NOT_REACHABLE {	
    			showDialog({heading: "No Network Connection!", content: "Please turn turn on WiFi or Cellular Data?", cancel: false}, "", "");	
    		}
    		else if networkState == NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK {
    			fetchGeo("Cellular");
    		}
    		else if networkState == NetworkStatus.REACHABLE_VIA_WIFI_NETWORK {
    			fetchGeo("Wifi");
    		}
    	}
  	});
  	
  	//Adding new native device features
  	$("#location button").bind(touchEndEvent, function(){
  		navigator.notification.alert("Coming soon!",function() {}, "Not ready yet...", "No problem");
  	});


	
	//end new native device features
	
	  $(window).bind("orientationchange", function(){
    switch(window.orientation) {
      case 0:
      case 180:
        $("#streetview").hide();
        $("#mapview").show();
        break;
      case 90:
      case -90:
        $("#streetview").show();
        $("#mapview").hide();
        break;
    }
  });

});

function spinner(blnShow) {
  var elements = $("#spinner,#mask");
  if(blnShow) {
    elements.fadeIn();
  }
  else {
    elements.fadeOut();
  }
}

function checkForShake(){
  var lastX,
  	lastY,
  	lastZ,
  	lastShake = new Date().getTime(),
  	threshold = 10;
  
  $(window).bind("devicemotion", function(e){
  	var motionEvent = e.originalEvent,
  		accel = motionEvent.accelerationIncludingGravity,
      	x = accel.x,
      	y = accel.y,
      	z =  accel.z;
  
/*  	$("body").html(
  		"x:" + x + "<br/>" +
  		"y:" + y + "<br/>" +
  		"z:" + z
  	); */
  
  	if(lastX !== null && lastY !== null &&  lastZ !== null) {
  
  	  var diffX = Math.abs(x - lastX),
  	  	diffY = Math.abs(y - lastY),
  	  	diffZ = Math.abs(z - lastZ);
  
  	  if (diffX > threshold && diffY > threshold ||
  		diffX > threshold && diffZ > threshold ||
  		diffY > threshold && diffZ > threshold) {
  			var now = new Date().getTime(),
  	  			diffTime = now - lastShake;
  
  	  		if (diffTime > 500) {
  				showDialog({heading: "Trak Me!", content: "Don't be so rough!", cancel: false}, "");
  	    		lastShake = now;
  			}
  		}
  	}
  
  	// Replace for next time
  	lastX = x;
  	lastY = y;
  	lastZ = z;
  });
}

function fetchGeo() {
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      // Succesfully got location
      var lat = pos.coords.latitude,
          lng = pos.coords.longitude;
      fetchLocations(lat, lng);
    },
    function(error) {
      // Failed to get location
      alert(error);
    }, {
      // Options for geolocation
      maximumAge: 10000, 
      timeout: 10000,
      enableHighAccuracy: true
    }
  );
}

function fetchLocations(lat, lng) {
	var location = lat + ",%20" + lng;
	var API_key = "&key=AIzaSyDY5Fl3dKB3RtQE1DNWyiGfGBsV6Eo8CDQ";
	var size = "size=450x300";
	var sensor = "&sensor=true";

   spinner(true);
   setTimeout(function() { spinner(false) }, 100);

    var url = "http://maps.googleapis.com/maps/api/streetview?"+ size +"&location="+ location + sensor + API_key;
     $("#streetview a").html('<img src="' +url+ '">');
    // $("#streetview").css('background-image','url(' + url + ')');
  	//			showDialog({heading: "Trak Me!", content: url, cancel: false}, "");
   	url="http://maps.google.com/maps/api/staticmap?zoom=14&size=300x200&maptype=roadmap&markers=size:mid%7Ccolor:red%7C"+location + sensor + API_key;
    $("#mapview a").html('<img src="' +url+ '">');
     //$("#mapview").css('background-image','url(' + url + ')');    
     //console.log(url);
}

function showDialog(options, OKCallback, CancelCallback) {
  var dialog = $("#dialog");
  // Set defaults.
  var settings = $.extend({
        heading: "Notice",
        content: "",
        cancel: false
      }, options);
  
  // Set the text
  dialog.find(".heading").text(settings.heading);
  dialog.find(".content").text(settings.content);
  
  dialog.find("#ok").one("click", function() {
    $("#dialog,#mask").fadeOut();
    OKCallback && OKCallback();
  });
    
  if(options.cancel) {
    dialog.find("#cancel")
      .one("click", function(){
        $("#dialog,#mask").fadeOut();
        CancelCallback && CancelCallback();
      })
      .show();
  }
  else {
    dialog.find("#cancel").hide();
  }
  
  $("#dialog,#mask").fadeIn();
}

function clickedOk() {
  alert("Clicked OK! thats get a lot more text into this thing to see the change in size");
}
