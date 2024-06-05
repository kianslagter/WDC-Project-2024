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

function displayRSVPResponses(eventID) {
  fetchRSVPResponses(eventID)
    .then(data => {
      const yesList = document.getElementById('yesList');
      const noList = document.getElementById('noList');
      const yesCount = document.getElementById('yesCount');
      const noCount = document.getElementById('noCount');

      // clear any existing fields
      yesList.innerHTML = '';
      noList.innerHTML = '';

      // update counts
      yesCount.textContent = `Total yes: ${data.yes.length}`;
      noCount.textContent = `Total no: ${data.no.length}`;

      data.yes.forEach(user => {
        const listItem = document.createElement('li');
        listItem.textContent = user.name;
        yesList.appendChild(listItem);
      });

      data.no.forEach(user => {
        const listItem = document.createElement('li');
        listItem.textContent = user.name;
        noList.appendChild(listItem);
      });
    })
    .catch(error => {
      const yesList = document.getElementById('yesList');
      const noList = document.getElementById('noList');
      yesList.innerHTML = '<li>Error fetching RSVP responses</li>';
      noList.innerHTML = '<li>Error fetching RSVP responses</li>';
    });
}

function createEvent() {
  // get data
  let title = document.getElementById('title').value;
  let description = document.getElementById('description').value;
  let details = Array.from(document.getElementsByClassName('create-event-details')).map(input => input.value).join('\n');
  let date = document.getElementById('date').value;
  let startTime = document.getElementById('startTime').value;
  let endTime = document.getElementById('endTime').value;
  let location = "Adelaide"; // assuming adelaide is location, TODO: add this to the create page soon
  let image_url = document.getElementById('image_url').files[0]; // file upload
  let publicValue = document.querySelector('input[name="event_privacy"]:checked').value;

  // validate data
  if (!title || !description || !date || !startTime || !endTime || !location || publicValue === undefined) {
    alert('Please fill all required fields.');
    return;
  }
  // TODO: handle image upload

  submitEvent(title, description, details, date, startTime, endTime, location, '', publicValue);

}

function submitEvent(title, description, details, date, startTime, endTime, location, imageUrl, publicValue) {
  let eventData = {
    title: title,
    description: description,
    details: details,
    date: date,
    startTime: startTime,
    endTime: endTime,
    location: location,
    image_url: imageUrl,
    public: publicValue
  };

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
        return response.text().then(text => { throw new Error(text) });
      }
      return response.json();
    })
    .then(data => {
      alert('Event created successfully with ID: ' + data.id);
    })
    .catch(error => {
      try {
        let errorMsg = JSON.parse(error.message);
        alert('Failed to create event: ' + errorMsg.message);
      } catch (e) {
        alert('Failed to create event: ' + error.message);
      }
    });
}

function deleteEvent(eventID) {
  if (!confirm('Are you sure you want to delete this event?')) {
    return;
  }

  fetch(`/manage/event/delete/${eventID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (response.ok) {
        // deleted successfully
        const eventContainer = document.getElementById(`event-${eventID}`);
        if (eventContainer) {
          eventContainer.remove();
        }
        alert('Event deleted successfully');
      } else if (response.status === 403) {
        alert('You do not have permission to delete this event');
      } else {
        alery('Failed to delete event');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while deleting the event');
    });
}
function editEvent(eventID) {
  const eventContainer = document.getElementById(`event-${eventID}`);
  if (!eventContainer) return;

  const titleInput = eventContainer.querySelector('.edit-title');
  const descriptionInput = eventContainer.querySelector('.edit-description');
  const detailsInput = eventContainer.querySelector('.edit-details');

  const updatedFields = {};
  if (titleInput && titleInput.value !== titleInput.defaultValue) {
    updatedFields.title = titleInput.value;
  }
  if (descriptionInput && descriptionInput.value !== descriptionInput.defaultValue) {
    updatedFields.description = descriptionInput.value;
  }
  if (detailsInput && detailsInput.value !== detailsInput.defaultValue) {
    updatedFields.details = detailsInput.value;
  }

  if (Object.keys(updatedFields).length === 0) {
    alert('No changes to save');
    return;
  }

  fetch(`/manage/event/edit/${eventID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedFields)
  })
    .then(response => {
      if (response.ok) {
        // Event updated successfully
        alert('Event updated successfully');
        // Update the display values
        if (updatedFields.title) {
          eventContainer.querySelector('.display-title').textContent = updatedFields.title;
        }
        if (updatedFields.description) {
          eventContainer.querySelector('.display-description').textContent = updatedFields.description;
        }
        if (updatedFields.details) {
          eventContainer.querySelector('.display-details').textContent = updatedFields.details;
        }
        // Reset the input fields
        if (titleInput) titleInput.value = titleInput.defaultValue;
        if (descriptionInput) descriptionInput.value = descriptionInput.defaultValue;
        if (detailsInput) detailsInput.value = detailsInput.defaultValue;
      } else if (response.status === 403) {
        alert('You do not have permission to edit this event');
      } else if (response.status === 404) {
        alert('Event not found');
      } else if (response.status === 400) {
        alert('Invalid data provided', 'error');
      } else {
        alert('Failed to update event', 'error');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while updating the event', 'error');
    });
}
