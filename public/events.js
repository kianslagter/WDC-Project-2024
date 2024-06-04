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

// get rsvp responses
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
// create event function
function createEvent() {
    // get data
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let details = Array.from(document.getElementsByClassName('create-event-details')).map(input => input.value).join('\n');
    let date = document.getElementById('date').value;
    let startTime = document.getElementById('startTime').value;
    let endTime = document.getElementById('endTime').value;
    let location = "Adelaide" // can we make this an option on the event page for simplicity
    let image_url = document.getElementById('image_url').files[0];
    let publicValue = document.querySelector('input[name="event_privacy"]:checked').value;

    // validate data
    if (!title || !description || !date || !startTime || !endTime || !location || publicValue === undefined) {
        alert('Please fill all required fields.');
        return;
    }

    // POST request
    fetch('/manage/event/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => { throw new Error(error.message) });
            }
            return response.json();
        })
        .then(data => {
            alert('Event created successfully with ID: ' + data.id);
            window.location.href = '/events';
        })
        .catch(error => {
            alert('Failed to create event: ' + error.message);
        });
}