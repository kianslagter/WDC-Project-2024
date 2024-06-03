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
            } else {
                console.error("Error fetching event");
            }
        }
    }
    xhttp.send();
}

// get rsvp response
async function fetchRSVPResponses(eventID) {
    try {
        const response = await fetch(`/manage/event/responses/${eventID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching RSVP responses:', error);
        throw error;
    }
}