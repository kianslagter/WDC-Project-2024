// EVENT DETAILS
function getEventDetails(eventID, callback, errorCallback) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/events/id/' + eventID + '/details.json', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {
                var data = JSON.parse(xhttp.responseText);
                console.log(data);
                callback(data);
            } else if (xhttp.status == 404) {
                console.error("Event not found");
                if (errorCallback) errorCallback("Event not found");
            } else {
                console.error("Error fetching event");
                if (errorCallback) errorCallback("Error fetching event");
            }
        }
    }
    xhttp.send();
}